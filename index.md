---
author: "Machou"
---

## Statistiques

![](generated/overview.svg)
![](generated/languages.svg)

## Liens

* [Lien du site](https://machou.github.io/)
* [forty-jekyll-theme](https://github.com/andrewbanchich/forty-jekyll-theme)
* [GitHub Support](https://support.github.com/)
* [GitHub Pages](https://pages.github.com/)
* [GitHub Pages Documentation](https://docs.github.com/fr/pages)
* [GitHub Actions Examples](https://github.com/actions/cache/blob/master/examples.md)
* [Documentation Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
* [Syntaxe Showdown pour Markdown](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)

## Markdown

Markdown est une syntaxe légère et facile à utiliser pour styliser vos écrits. Quelques exemples :

```markdown
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6

- Liste à puces
- Lorem
- Lorem

1. Liste numérotée
2. Lorem
3. Lorem

+ Autre liste
+ Lorem
+ Lorem

1. Lorem 1
   - Lorem 1.1
     - Lorem 1.2
2. Lorem 2
   - Lorem 2.2
     - Lorem 2.3

Gras : **double astérisques** ou __double underscore__
Italique : *astérisque* ou _underscore_
```

----

```php
<?php
echo 'Hello World';
?>
```

----

```js
$(function () {
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t + b;

        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };
});
```

----

Bout de code
`git push`

Lien
`[Nom du lien](https://www.google.fr/)`

Image
`![Alt de l’image](https://lipsum.app/random/100x50 "Title de l’image")`

Lien + image
`[![Alt de l’image](https://lipsum.app/random/250x100)](https://www.google.fr/ "Title de l’image")`

[![Alt de l’image](https://lipsum.app/random/250x100)](https://www.google.fr/ "Title de l’image")

----

| Droite         | Centre       | Gauche        |
| :----------    | :----------:  | ----------:   |
| lorem          | lorem         | lorem         |
| lorem          | lorem         | lorem         |
| lorem          | lorem         | lorem         |

----

Lorem ipsum dolor sit amet[^1].

Maecenas mollis bibendum nulla vel sagittis[^2].

[^1]: ref 1
[^2]: ref 2

----

## Jekyll Themes

Les `Pages` utilisent une mise en page et des styles / thèmes **Jekyll** que vous avez sélectionnés dans les [options de votre dépôt](https://github.com/Machou/machou.github.io/settings). Le nom de ce thème est sauvegarder dans le fichier [_config.yml](https://jekyllrb.com/docs/configuration/).e ce thème est sauvegarder dans le fichier [_config.yml](https://jekyllrb.com/docs/configuration/).