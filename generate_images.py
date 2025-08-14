#!/usr/bin/python3

import asyncio
import os
import re
import aiohttp
from github_stats import Stats

def generate_output_folder() -> None:
    """
    Create the output folder if it does not already exist
    """
    if not os.path.isdir("generated"):
        os.mkdir("generated")
        print("Created 'generated' folder")

async def generate_overview(s: Stats) -> None:
    """
    Generate an SVG badge with summary statistics
    :param s: Represents user's GitHub statistics
    """
    print("Generating overview...")
    
    # Vérifier si le template existe
    if not os.path.exists("templates/overview.svg"):
        print("ERROR: templates/overview.svg not found!")
        return
        
    with open("templates/overview.svg", "r") as f:
        output = f.read()

    # Récupérer les données avec gestion d'erreur
    try:
        name = await s.name
        stars = await s.stargazers
        forks = await s.forks
        contributions = await s.total_contributions
        lines_changed = await s.lines_changed
        views = await s.views
        repos = await s.repos
        
        print(f"Stats: {name}, {stars} stars, {forks} forks, {contributions} contributions")
        
        output = re.sub("{{ name }}", name, output)
        output = re.sub("{{ stars }}", f"{stars:,}", output)
        output = re.sub("{{ forks }}", f"{forks:,}", output)
        output = re.sub("{{ contributions }}", f"{contributions:,}", output)
        changed = lines_changed[0] + lines_changed[1]
        output = re.sub("{{ lines_changed }}", f"{changed:,}", output)
        output = re.sub("{{ views }}", f"{views:,}", output)
        output = re.sub("{{ repos }}", f"{len(repos):,}", output)

        generate_output_folder()
        with open("generated/overview.svg", "w") as f:
            f.write(output)
        print("✅ Overview SVG generated successfully!")
        
    except Exception as e:
        print(f"❌ Error generating overview: {e}")

async def generate_languages(s: Stats) -> None:
    """
    Generate an SVG badge with summary languages used
    :param s: Represents user's GitHub statistics  
    """
    print("Generating languages...")
    
    # Vérifier si le template existe
    if not os.path.exists("templates/languages.svg"):
        print("ERROR: templates/languages.svg not found!")
        return
        
    with open("templates/languages.svg", "r") as f:
        output = f.read()

    try:
        languages = await s.languages
        print(f"Found {len(languages)} languages")
        
        progress = ""
        lang_list = ""
        sorted_languages = sorted(
            languages.items(), reverse=True, key=lambda t: t[1].get("size")
        )
        
        delay_between = 150
        for i, (lang, data) in enumerate(sorted_languages[:10]):  # Limiter à 10 langages
            color = data.get("color")
            color = color if color is not None else "#000000"
            progress += (
                f'<span style="background-color: {color};'
                f'width: {data.get("prop", 0):0.3f}%;" '
                f'class="progress-item"></span>'
            )
            lang_list += f"""
<li style="animation-delay: {i * delay_between}ms;">
<svg xmlns="http://www.w3.org/2000/svg" class="octicon" style="fill:{color};"
viewBox="0 0 16 16" version="1.1" width="16" height="16"><path
fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>
<span class="lang">{lang}</span>
<span class="percent">{data.get("prop", 0):0.2f}%</span>
</li>
"""

        output = re.sub(r"{{ progress }}", progress, output)
        output = re.sub(r"{{ lang_list }}", lang_list, output)

        generate_output_folder()
        with open("generated/languages.svg", "w") as f:
            f.write(output)
        print("✅ Languages SVG generated successfully!")
        
    except Exception as e:
        print(f"❌ Error generating languages: {e}")

async def main() -> None:
    """
    Generate all badges
    """
    print("Starting badge generation...")
    
    access_token = os.getenv("ACCESS_TOKEN")
    if not access_token:
        # Essayer avec GITHUB_TOKEN en fallback
        access_token = os.getenv("GITHUB_TOKEN")
        if not access_token:
            raise Exception("A personal access token is required to proceed!")
    
    user = os.getenv("GITHUB_ACTOR")
    if user is None:
        raise RuntimeError("Environment variable GITHUB_ACTOR must be set.")
    
    print(f"User: {user}")
    print(f"Token present: {'Yes' if access_token else 'No'}")
    
    exclude_repos = os.getenv("EXCLUDED")
    excluded_repos = (
        {x.strip() for x in exclude_repos.split(",")} if exclude_repos else None
    )
    exclude_langs = os.getenv("EXCLUDED_LANGS")
    excluded_langs = (
        {x.strip() for x in exclude_langs.split(",")} if exclude_langs else None
    )
    raw_ignore_forked_repos = os.getenv("EXCLUDE_FORKED_REPOS")
    ignore_forked_repos = (
        not not raw_ignore_forked_repos
        and raw_ignore_forked_repos.strip().lower() != "false"
    )
    
    async with aiohttp.ClientSession() as session:
        s = Stats(
            user,
            access_token,
            session,
            exclude_repos=excluded_repos,
            exclude_langs=excluded_langs,
            ignore_forked_repos=ignore_forked_repos,
        )
        await asyncio.gather(generate_languages(s), generate_overview(s))
        print("Badge generation completed!")

if __name__ == "__main__":
    asyncio.run(main())
