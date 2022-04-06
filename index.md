# Bienvenue sur GitHub Pages

## Liens

* [Lien du site](https://machou.github.io/)

* [GitHub Help](https://help.github.com/categories/github-pages-basics/)
* [GitHub Pages](https://pages.github.com/)
* [GitHub Pages Documentation](https://docs.github.com/en/pages)


Modifier le fichier [index.md](https://github.com/Machou/machou.github.io/edit/main/index.md) sur GitHub pour maintenir et éditer le contenu du site.

Chaque fois que vous pousserez une modification dans ce dépôt, GitHub Pages lancera [Jekyll](https://jekyllrb.com/) pour reconstruire les pages du site, à partir du contenu de vos fichiers `Markdown`.

## Markdown

Markdown est une syntaxe légère et facile à utiliser pour styliser vos écrits. Quelques exemples :

```markdown
# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6

Listes :

- Liste à puces
- #
- #

1. Liste numérotée
2. #
3. #

+ Autre liste
+ #
+ #

Mise en forme :

Gras : **double astérisques** ou __double underscore__
Italique : *astérisque* ou _underscore_
```

Langage :

```php
<?php
echo 'Hello World';
?>
```

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

Bout de code : `git push`

Emoji : :smile: `:smile:`

Image : `[Lien](url)`

Image : `![Image](https://lipsum.app/random/100x50 "Alt de l’image")`

Rendu :

![Image](https://lipsum.app/random/100x50 "Alt de l’image")

Tableau :

| Tables        | Are           |
| ------------- |:-------------:|
| col 1         | x             |
| col 2         | x             |
| col 3         | x             |
```

(Plus d’exemple)[https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax]

## Jekyll Themes

Votre `Pages` utilise une mise en page et des styles des thèmes Jekyll que vous avez sélectionnés dans les [options de votre dépôt](https://github.com/Machou/machou.github.io/settings). Le nom de ce thème est sauvegarder dans le fichier `_config.yml`.
