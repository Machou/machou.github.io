---
# Exemple : https://github.com/microsoft/generative-ai-for-beginners
lang: "fr"
published: true
permalink: "/"
draft: false
toc: false
robots: "index, follow"
canonical_url: "https://machou.github.io/"
author: "Machou"
favicon: "assets/img/favicon.png"
---

# Sommaire

- [Word of Warcraft : les PNJ pour l’outil Recherche de Raid](https://machou.github.io/wow-pnj-lfr)
- [Comment créer un Hidden Service sécurisé de zéro avec Tor sur Debian](https://machou.github.io/comment-creer-hidden-service)
  - [Tutoriel PortSentry](https://machou.github.io/comment-utiliser-portsentry)
  - [Tutoriel Fail2ban](https://machou.github.io/comment-utiliser-fail2ban)
- [Liens divers](#liens-divers)
- [Statistiques](#statistiques)
- [Configuration et installation](#configuration-et-installation)

## Liens divers

* [GitHub Support](https://support.github.com/)
* [GitHub Pages](https://pages.github.com/)
  * [Documentation](https://docs.github.com/fr/pages)
  * [GitHub Pages et Jekyll](https://docs.github.com/fr/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll)
  * [GitHub Actions Examples](https://github.com/actions/cache/blob/master/examples.md)
* [Documentation Markdown](https://docs.github.com/fr/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
* [Syntaxe Showdown](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)
* [GitHub Stats Visualization](https://github.com/jstrieb/github-stats)

## Statistiques

| Statistiques                   | Les Langages                   |
| ------------------------------ | ------------------------------ |
| ![](generated/overview.svg)    | ![](generated/languages.svg)   |

-----

| Liens                                                                                              | Stats                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Dépôts de Machou](https://github.com/Machou)                                                      | [![](https://github-readme-stats.vercel.app/api?username=Machou&locale=fr&show_icons=true&theme=onedark)](https://github.com/anuraghazra/github-readme-stats)                                |
| [Cartes @machou.github.io](https://github.com/Machou/machou.github.io)                             | [![](https://github-readme-stats.vercel.app/api?username=Machou&locale=fr&repo=github-stats&theme=swift)](https://github.com/Machou/machou.github.io)                                        |
| [Langages de programmation les plus utilisés dans les dépôts de Machou](https://github.com/Machou) | [![Top Languages Used](https://github-readme-stats.vercel.app/api/top-langs/?username=Machou&locale=fr&bg_color=30,e96443,904e95&title_color=fff&text_color=fff)](https://github.com/Machou) |

[![Machou/machou.github.io](https://gh-card.dev/repos/Machou/machou.github.io.svg)](https://github.com/Machou/machou.github.io)

[![Trophy](https://github-profile-trophy.vercel.app/?username=ryo-ma&theme=dracula)](https://github.com/ryo-ma/github-profile-trophy)

## Configuration et installation

Les `Pages` utilisent une mise en page et des styles / thèmes **Jekyll** que vous avez sélectionnés dans les [options de votre dépôt](https://github.com/Machou/machou.github.io/settings). Les options de ce thème sont sauvegardées dans le fichier [_config.yml](https://jekyllrb.com/docs/configuration/).

1. Comment créer un **[Personal Access Token](https://docs.github.com/fr/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)**
2. Permissions : `read:user` et `repo`
3. Aller sur la page [secrets/action/](../../settings/secrets/actions)
4. Créer un nouveau *secret*, nommez le `ACCESS_TOKEN` et coller le *token* ci-dessus

[Plus d'informations sur github.com/jstrieb/github-stats](https://github.com/jstrieb/github-stats#installation)
