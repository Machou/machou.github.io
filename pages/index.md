---
layout: defaut
permalink: "/"
# slug:
title: "Sommaire"
canonical_url: "https://machou.github.io/"
description: "Pages GitHub générée via GitHub Pages. Informations sur World of Warcraft et tutoriel Tor."
favicon: "/assets/img/favicon.png"
# Exemple : https://github.com/microsoft/generative-ai-for-beginners
---

<p align="center">
	<a href="assets/img/hacker.png" class="img-fluid" data-fancybox="gallerie"><img src="assets/img/hacker.png" alt="Logo Hacker" title="Logo Hacker"></a>
</p>

<nav style="--bs-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
	<ol class="breadcrumb">
		<li class="breadcrumb-item active" aria-current="page">Accueil</li>
	</ol>
</nav>

# [machou.github.io](https://machou.github.io/)

# Sommaire

- [Word of Warcraft : PNJ de l’outil Recherche de Raid](https://machou.github.io/wow-pnj-lfr)
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

## Statistiques

* [GitHub Stats Visualization](https://github.com/jstrieb/github-stats)
* [GitHub Metrics](https://github.com/lowlighter/metrics)
* [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats)
* [GitHub Profile Trophy](https://github.com/ryo-ma/github-profile-trophy)
* [GitHub Repository Card for every web site](https://gh-card.dev/)

## Les statistiques

**Statistiques diverses**<br>[![](generated/overview.svg)](https://github.com/jstrieb/github-stats)

---

**Les Langages**<br>[![](generated/languages.svg)](https://github.com/jstrieb/github-stats)

---

**Métriques**<br>[![](generated/github-metrics.svg)](https://github.com/lowlighter/metrics)

---

**Statistiques GitHub**<br><br>[![](https://github-readme-stats.vercel.app/api?username=Machou&locale=fr&show_icons=cobalt)](https://github.com/anuraghazra/github-readme-stats)                                                                                                                             |

---

**Langages les plus utilisés dans les dépôts de Machou**<br><br>[![Top Languages Used](https://github-readme-stats.vercel.app/api/top-langs/?username=Machou&locale=fr&theme=dracula)](https://github.com/anuraghazra/github-readme-stats)                                                                 |

---

**Trophées**<br><br>[![Trophy](https://github-profile-trophy.vercel.app/?username=Machou&theme=matrix)](https://github.com/ryo-ma/github-profile-trophy)                                                                                                                                                   |

---

**GitHub Repository Card**<br><br>[![Machou/machou.github.io](https://gh-card.dev/repos/Machou/machou.github.io.svg)](https://gh-card.dev/)                                                                                                                                             |

## Configuration et installation

Les `Pages` utilisent une mise en page et des styles / thèmes **Jekyll** que vous avez sélectionnés dans les [options de votre dépôt](https://github.com/Machou/machou.github.io/settings). Les options de ce thème sont sauvegardées dans le fichier [_config.yml](https://jekyllrb.com/docs/configuration/).

1. Comment créer un **[Personal Access Token](https://docs.github.com/fr/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)**
2. Créer un [Tokens (classic)](https://github.com/settings/tokens)
3. Nomme le **github-stats** et **sans expiration**
4. Permissions : `read:user` et `repo`
5. On l’ajoute sur la page [Actions](https://github.com/Machou/machou.github.io/settings/secrets/actions/new)
4. Nomme le **ACCESS_TOKEN**

[Plus d'informations sur github.com/jstrieb/github-stats](https://github.com/jstrieb/github-stats#installation)