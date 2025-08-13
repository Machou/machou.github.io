#!/usr/bin/python3
# -*- coding: utf-8 -*-

import asyncio
import os
from pathlib import Path
from typing import Optional, Set

import aiohttp

from github_stats import Stats  # Supposé fournir des attributs/coros utilisés ci-dessous


# -----------------------------
# Utilitaires
# -----------------------------

def generate_output_folder() -> None:
    """Crée le dossier de sortie si nécessaire."""
    out = Path("generated")
    out.mkdir(exist_ok=True)

def read_template(path: Path) -> str:
    """Lit un fichier template en UTF-8 avec vérification d'existence."""
    if not path.is_file():
        raise FileNotFoundError(f"Template introuvable: {path}")
    return path.read_text(encoding="utf-8")

def write_output(path: Path, content: str) -> None:
    """Écrit le contenu UTF-8 dans un fichier, dossier créé si besoin."""
    generate_output_folder()
    path.write_text(content, encoding="utf-8")

def parse_bool_env(var_name: str, default: bool = False) -> bool:
    """
    Convertit une variable d'environnement en booléen.
    True  si dans {1,true,yes,on}
    False si dans {0,false,no,off,""}
    Sinon renvoie `default`.
    """
    raw = os.getenv(var_name)
    if raw is None:
        return default
    val = raw.strip().lower()
    if val in {"1", "true", "yes", "on"}:
        return True
    if val in {"0", "false", "no", "off", ""}:
        return False
    return default

def parse_csv_env(var_name: str) -> Optional[Set[str]]:
    """Parse une variable d'env CSV en set de chaînes, ou None si vide."""
    raw = os.getenv(var_name, "")
    items = {x.strip() for x in raw.split(",") if x.strip()}
    return items or None


# -----------------------------
# Génération des images
# -----------------------------

async def generate_overview(s: Stats) -> None:
    """
    Génère le badge SVG de synthèse.
    Hypothèse: les attributs de `Stats` utilisés ici sont awaitables.
    """
    tpl = read_template(Path("templates/overview.svg"))

    # Mise en cache des valeurs asynchrones (évite les appels multiples)
    name = await s.name
    stars = await s.stargazers
    forks = await s.forks
    total_contribs = await s.total_contributions
    lines_added, lines_removed = await s.lines_changed
    views = await s.views
    repos = await s.repos

    changed = (lines_added or 0) + (lines_removed or 0)

    # Remplacements simples sans regex
    out = tpl.replace("{{ name }}", str(name))
    out = out.replace("{{ stars }}", f"{stars:,}")
    out = out.replace("{{ forks }}", f"{forks:,}")
    out = out.replace("{{ contributions }}", f"{total_contribs:,}")
    out = out.replace("{{ lines_changed }}", f"{changed:,}")
    out = out.replace("{{ views }}", f"{views:,}")
    out = out.replace("{{ repos }}", f"{len(repos):,}")

    write_output(Path("generated/overview.svg"), out)


async def generate_languages(s: Stats) -> None:
    """
    Génère le badge SVG des langages utilisés.
    """
    tpl = read_template(Path("templates/languages.svg"))

    languages = await s.languages  # dict(lang -> {"size": int, "prop": float, "color": str|None, ...})

    # Tri par taille décroissante
    sorted_languages = sorted(languages.items(), reverse=True, key=lambda t: t[1].get("size", 0))

    progress = ""
    lang_list = ""
    delay_between = 150  # ms

    for i, (lang, data) in enumerate(sorted_languages):
        color = data.get("color") or "#000000"
        prop = float(data.get("prop", 0.0))

        progress += (
            f'<span style="background-color: {color};'
            f'width: {prop:0.3f}%;" '
            f'class="progress-item"></span>'
        )

        lang_list += (
            f'\n        <li style="animation-delay: {i * delay_between}ms;">\n'
            f'        <svg xmlns="http://www.w3.org/2000/svg" class="octicon" style="fill:{color};" '
            f'viewBox="0 0 16 16" version="1.1" width="16" height="16"><path '
            f'fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>\n'
            f'        <span class="lang">{lang}</span>\n'
            f'        <span class="percent">{prop:0.2f}%</span>\n'
            f'        </li>\n'
        )

    out = tpl.replace("{{ progress }}", progress)
    out = out.replace("{{ lang_list }}", lang_list)

    write_output(Path("generated/languages.svg"), out)


# -----------------------------
# Programme principal
# -----------------------------

async def main() -> None:
    """Point d'entrée asynchrone."""
    access_token = os.getenv("ACCESS_TOKEN")
    if not access_token:
        raise RuntimeError("ACCESS_TOKEN est requis pour poursuivre.")

    user = os.getenv("GITHUB_ACTOR")
    if not user:
        raise RuntimeError("La variable d'environnement GITHUB_ACTOR doit être définie.")

    excluded_repos = parse_csv_env("EXCLUDED")
    excluded_langs = parse_csv_env("EXCLUDED_LANGS")
    ignore_forked_repos = parse_bool_env("EXCLUDE_FORKED_REPOS", default=False)

    timeout = aiohttp.ClientTimeout(total=30)  # 30s de timeout global
    async with aiohttp.ClientSession(timeout=timeout) as session:
        s = Stats(
            user,
            access_token,
            session,
            exclude_repos=excluded_repos,
            exclude_langs=excluded_langs,
            ignore_forked_repos=ignore_forked_repos,
        )
        # Lancement concurrent des deux générations
        await asyncio.gather(
            generate_languages(s),
            generate_overview(s),
        )


if __name__ == "__main__":
    # Lève les erreurs de façon explicite pour faciliter le debug CI
    asyncio.run(main())
