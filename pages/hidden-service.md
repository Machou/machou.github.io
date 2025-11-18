---
layout: defaut
title: "Créer un Hidden Service sur Tor"
description: "Comment créer un Hidden Service sécurisé de zéro avec Tor sur Debian"
permalink: /comment-creer-hidden-service
slug: comment-creer-hidden-service
canonical_url: https://machou.github.io/comment-creer-hidden-service
favicon: /assets/img/favicon-tor.svg
---

<nav aria-label="breadcrumb">
	<ol class="breadcrumb">
		<li class="breadcrumb-item"><a href="https://machou.github.io/">Accueil</a></li>
		<li class="breadcrumb-item active" aria-current="page">Créer un Hidden Service</li>
	</ol>
</nav>

# Créer un Hidden Service sécurisé avec Tor sur Debian

## **Sommaire**

- [Liste des logiciels](#liste-des-logiciels)
- [Qu’est-ce que Tor et un Hidden Service ?](#quest-ce-que-tor-et-un-hidden-service-)
  - [Quelques règles importantes](#quelques-règles-importantes)
- [Configuration du serveur](#configuration-du-serveur)
  - [Configuration Debian](#configuration-debian)
    - [sources.list](#sourceslist)
    - [Les paquets](#les-paquets)
  - [SSH](#ssh)
    - [Configuration SSH](#configuration-ssh)
    - [Authentification SSH](#authentification-ssh)
      - [Méthode N°1 : clés SSH](#méthode-n1--clés-ssh)
      - [Méthode N°2 : mot de passe](#méthode-n2--mot-de-passe)
    - [Double Authentification avec Google Authenticator PAM module](#facultatif-double-authentification-avec-google-authenticator-pam-module)
- [Installation d’un serveur LAMP](#installation-dun-serveur-lamp)
  - [Apache](#installation-et-configuration-dapache2)
    - [Virtual Host](#virtual-host)
  - [nginx](#installation-et-configuration-de-nginx-comme-proxy)
  - [PHP](#php)
    - [PHP](#installation-et-configuration-de-php)
  - [MariaDB](#mariadb)
    - [Base de données et utilisateur](#base-de-données-et-utilisateur)
    - [Adminer : accéder aux tables SQL](#adminer--accéder-aux-tables-sql)
  - [Tor](#tor)
    - [Installation et configuration de Tor](#installation-et-configuration-de-tor)
      - [Configuration du Hidden Service](#configuration-du-hidden-service)
  - [Générer une adresse .onion personnalisée](#générer-une-adresse-onion-personnalisée)
  - [Debug](#debug)
- [PortSentry](comment-utiliser-portsentry)
- [Fail2ban](comment-utiliser-fail2ban)
- [Facultatif](#facultatif)
  - [Configuration du Pare-feu (UFW)](#configuration-du-pare-feu-ufw)
  - [Configuration de la langue](#configuration-de-la-langue)
  - [Configuration de la date et heure](#configuration-de-la-date-et-heure)
  - [Rediriger le trafic réseau du serveur vers Tor](#rediriger-le-trafic-réseau-du-serveur-vers-tor)
  - [Réécrire la RAM avant un arrêt / redémarrage du serveur](#réécrire-la-ram-avant-un-arrêt--redémarrage-du-serveur)
  - [Supprimer mes traces](#supprimer-mes-traces)
  - [Alias utiles (*~/.bashrc*)](#alias-utiles-pour-le-serveur)
  - [Désactiver IPv6](#désactiver-ipv6)
    - [Méthode N°1 : désactiver IPv6 via le fichier de configuration GRUB](#méthode-n1--désactiver-ipv6-via-le-fichier-de-configuration-grub)
    - [Méthode N°2 : désactiver IPv6 via le fichier sysctl](#méthode-n2--désactiver-ipv6-via-le-fichier-sysctl)
    - [Méthode N°3 : rejeter tout le trafic IPv6](#méthode-n3--rejeter-tout-le-trafic-ipv6)
  - [Quelques liens / tutoriels utiles](#quelques-liens--tutoriels-utiles)
    - [Aide-mémoires / tutoriels](#aide-mémoires--tutoriels)
    - [Documentations](#documentations)
    - [Autres](#autres)
  - [À faire](#à-faire)

## Liste des logiciels

Dans ce tutoriel, nous tenterons de garder les logiciels à jour avec leurs dernières versions. Voici la liste actuelle :

- [Debian](https://www.debian.org/) — [version 13.1, liste des changements](https://www.debian.org/News/2025/20250906)
- [Apache2](https://httpd.apache.org/) — [version 2.4.65, liste des changements](https://httpd.apache.org/security/vulnerabilities_24.html#2.4.65)
- [nginx](https://nginx.org/) — [version 1.26.3, liste des changements](https://nginx.org/en/CHANGES-1.26)
- [PHP](https://www.php.net/) — [version 8.4.14, liste des changements](https://www.php.net/ChangeLog-8.php#8.4.14)
- [MariaDB](https://mariadb.org/) — [version 11.8.3, liste des changements](https://mariadb.com/docs/release-notes/community-server/mariadb-11-8-series/mariadb-11.8.3-release-notes)
- [Tor](https://www.torproject.org/) — [version 0.4.8.21, liste des changements](https://gitlab.torproject.org/tpo/core/tor/-/commits/tor-0.4.8.21)

*Dernière mise à jour le 4 novembre 2025*

Nous allons configurer notre serveur, qui sera basé sur Apache2, PHP et SQL. Ce type de serveur est plus communément appelé **LAMP**. LAMP est un acronyme désignant un ensemble de logiciels libres permettant de construire des serveurs de sites web. L’acronyme original se réfère aux logiciels suivants :

- « **L**inux », le système d’exploitation ( GNU/Linux ) ;
- « **A**pache », le serveur Web ;
- « **M**ySQL ou **M**ariaDB », le serveur de base de données ;
- À l’origine, « **P**HP », « **P**erl » ou « **P**ython », les langages de script.

Bien sûr, nous pourrions utiliser une [image Docker LAMP](https://hub.docker.com/r/mattrayner/lamp), mais le but est de se familiariser avec l’environnement Linux. Aussi, il existe d’autres logiciels pour le serveur web, comme [nginx](https://nginx.org/) ou [Caddy](https://caddyserver.com/). Cependant, j’ai choisi d’utiliser Apache2, mais vous êtes libre de changer.

## Qu’est-ce que Tor et un Hidden Service ?

Tor (acronyme de « **The Onion Router** ») est un réseau de communication anonyme. Il permet aux utilisateurs de naviguer sur Internet de manière anonyme en dirigeant le trafic à travers une série de serveurs (appelés nœuds) gérés par des bénévoles. Chaque **nœud** ne connaît que les informations du nœud précédent et du nœud suivant, ce qui rend difficile pour quelqu’un de surveiller le chemin complet des données. Tor utilise un système de couches de chiffrage, d’où le terme « onion » (oignon) qui fait référence aux multiples couches de protection.

Un Hidden Service (ou service caché) est un service accessible uniquement via le réseau Tor. Ces services utilisent des adresses en « .onion » et permettent aux sites web, aux forums, aux messageries instantanées et à d’autres types de services de fonctionner de manière anonyme. Les utilisateurs peuvent accéder à ces services sans connaître l’emplacement physique du serveur, et le serveur ne connaît pas l’adresse IP des utilisateurs. Cela garantit une confidentialité et une sécurité accrues pour les deux parties. Les Hidden Services sont souvent utilisés pour protéger la vie privée des utilisateurs, mais ils peuvent aussi être utilisés à des fins malveillantes en raison de l’anonymat qu’ils offrent.

> Cartographie des utilisateurs Tor, par pays.

<p class="mb-0 text-center"><a href="https://i.ibb.co/fY6VCzk/Geographies-of-Tor.png" data-fancybox="gallerie"><img src="https://i.ibb.co/fY6VCzk/Geographies-of-Tor.png" class="border rounded img-fluid" alt="Cartographie des utilisateurs" title="Cartographie des utilisateurs"></a></p>

*[Statistiques officielles du projet Tor](https://metrics.torproject.org/)*

Tor est utilisé pour se protéger contre une certaine forme de surveillance sur Internet, connue sous le nom d’analyse de trafic. Cette analyse est utilisée pour déterminer qui communique avec qui sur un réseau public. Connaître la source et la destination de votre trafic peut permettre à des personnes de traquer votre comportement et vos intérêts. Cartogramme de l’usage de Tor à l’international.

Tor est aussi un outil de contournement de la censure sur Internet. Il permet aux personnes l’utilisant d’accéder à des sites, contenus ou services bloqués dans certaines zones du monde.

Tor fait circuler le trafic de ses utilisateurs et utilisatrices via une série de relais. Ce procédé permet de ne pas être tracé par les sites web consultés, d’accéder à des services, contenus ou sites bloqués par un FAI. Il est aussi possible pour chaque utilisateur de publier des contenus via les services *onion* de Tor, sans révéler la position de ces services.

Ces avantages peuvent être utiles pour chaque personne qui souhaite maîtriser ses traces laissées en ligne. Ils sont notamment mis en œuvre dans les échanges entre lanceurs d’alerte, journalistes, avocats, dissidents politiques, organisations non gouvernementales, pour échanger en maîtrisant la sécurité de leurs données, de leur connexion, de leurs destinataires et de leur position.

Pour faire simple, un *Hidden Service* va vous permettre d’avoir un serveur Jabber, SSH, d’héberger un site, etc. le tout en masquant complètement l’adresse IP et les informations du VPS / serveur aux utilisateurs, bots, aux gouvernements, etc.

Plusieurs choses :

- les utilisateurs chinois bloqués par le [Grand Firewall de Chine](https://fr.wikipedia.org/wiki/Grand_Firewall_de_Chine) peuvent accéder à l’internet sans censure
- les utilisateurs Iraniens / Turcs, etc. bloqués par leur gouvernement peuvent accéder à l’internet sans censure
- être anonyme à 99,99% pendant la navigation sur internet
- accéder aux sites cachés via les adresses en .onion
- discuter sur des messageries utilisant le proxy Tor
- etc.

Malheureusement, qui dit anonymisation des utilisateurs, dit criminalité en tout genre, vente de drogue, d’armes, trafic d’êtres humains, de fausse monnaie, etc. et j’en passe. Il a des côtés positifs et des côtés négatifs. Que ce soit dans la vraie vie ou sur internet, on sera toujours embêté par les vilains… Le but de ce tutoriel n’est pas de vous montrer comment acheter de la drogue mais d’apprendre le fonctionnement d’un serveur web utilisant le service de cryptage de Tor.

## Quelques règles importantes

*Ce tutoriel est à titre informatif et scolaire. Vous pouvez adapter en fonction de vos besoins.*

- Toujours se connecter à vos services (SSH, sFTP, FTP, etc) via un proxy SOCK5 de Tor
- Ne JAMAIS installer de logiciel / script (PHP, Python, Bash, etc.), dont vous n’êtes pas certain de la source
- Ne JAMAIS exécuter de logiciel / script / commande dont vous n’êtes pas certain de la source
- Ne JAMAIS réaliser des tâches dont vous n’êtes pas certain de la source
- Démarrer votre installation / configuration avec un VPS / serveur dont vous êtes certain de la source
- Démarrer votre installation / configuration sur un système d’exploitation fraîchement installé
- Utiliser un courriel anonyme pour le service sur lequel vous allez louer votre VPS / serveur
- *[Liste de quelques services de courriels sécurisés](https://www.privacytools.io/privacy-email)*
- Payer votre VPS / serveur en [cryptomonnaie](https://fr.wikipedia.org/wiki/Cryptomonnaie) (Bitcoin, Monero, etc.)
- Ne JAMAIS fournir votre identité lorsque vous payez via Cryptomonnaie
- **Ne JAMAIS faire fonctionner un relais Tor sur le VPS / serveur, car ces adresses IP sont rendues publiques**
- Ne JAMAIS envoyer de courriel via le VPS / serveur (donc désactiver tous les logiciels / fonctions liées aux courriels)
- Ne JAMAIS autoriser l’envoie de fichiers sur le VPS / serveur où va être hébergé votre site
- Ne JAMAIS autoriser l’ajout d’image distante (exemple, avec la balise *img src=""*)
- JavaScript est à BANNIR sur les applications Web que vous allez développer / héberger
- Désactiver toutes les fonctions Apache2, nginx, PHP, etc. qui sont susceptibles de renvoyer des erreurs aux visiteurs et peuvent afficher votre adresse IP (une liste non-exhaustive sera fournie)
- Ne pas inclure des fichiers distants via des CDNs, par exemple : jQuery, Bootstrap, etc.
- Effectuer un audit de vos applications Web pour éviter toute faille potentielle
- Effectuer un audit de vos scripts pour éviter toute faille potentielle
- Garder votre VPS / serveur à jour (amélioration des logiciels, correction de faille de sécurité, etc.)

*Si une règle vous semble incorrecte, si vous souhaitez proposer une amélioration, ajouter un oubli, n’hésitez pas à le proposer.*

**VPN > Tor, Tor > VPN > Proxy, Proxy > VPN > Tor, VPN > Tor ? Quelle est la meilleure solution ?**

Il n’y a pas de réponse universelle à cette question, car cela dépend de votre situation individuelle et de ce que vous cherchez à protéger.

Dans l’ensemble, l’utilisation de Tor est considérée comme la meilleure solution pour protéger son anonymat en ligne, car elle vous permet de masquer votre adresse IP et de rendre vos communications difficiles à tracer. Cependant, il est important de noter que l’utilisation de Tor ne garantit pas une protection à 100% et qu’il est possible que certaines attaques puissent encore vous identifier.

L’utilisation d’un VPN peut également être utile pour protéger votre anonymat en ligne, car elle permet de masquer votre adresse IP et de chiffrer votre trafic internet. Cependant, il est important de choisir un fournisseur VPN fiable qui ne conserve pas de journaux de connexion et qui utilise des protocoles de chiffrement solides pour éviter toute compromission.

L’utilisation d’un proxy peut également être utile pour masquer votre adresse IP, mais il est important de choisir un proxy fiable et sécurisé, car certains proxies peuvent être compromis ou surveillés par des tiers malveillants.

Dans l’ensemble, l’utilisation de Tor est considérée comme la solution la plus sûre et la plus robuste pour protéger son anonymat en ligne, mais l’utilisation d’un VPN ou d’un proxy peut également être utile en complément. Si vous choisissez d’utiliser un VPN ou un proxy en plus de Tor, il est important de comprendre les risques et les limitations de chaque solution, et de prendre les mesures de sécurité nécessaires pour éviter toute compromission.

**Ma recommandation :** VPN + Tor

**VPNs recommandés :** [Mullvad](https://mullvad.net/) ou [ProtonVPN](https://protonvpn.com/)

## Configuration du serveur

On se connecte au serveur via SSH et on change le mot de passe root :

```sh
sudo su
passwd
```

## SSH

> **SSH** (Secure Shell) est un protocole réseau qui permet d’établir une connexion sécurisée entre un client et un serveur. Il est principalement utilisé pour accéder à distance à des systèmes informatiques, en garantissant la confidentialité et l’intégrité des données grâce au chiffrement. SSH permet d’exécuter des commandes, de transférer des fichiers en toute sécurité et d’administrer des serveurs à distance. Il remplace des protocoles moins sécurisés comme Telnet et FTP.

### Configuration SSH

On paramètre / sécurise SSH :

`sudo nano /etc/ssh/sshd_config`

On change le port SSH :

`Port _PORT_`

C’est une forme de sécurité simple, mais étonnamment efficace.

Les serveurs utilisent généralement le port 22 pour se connecter à SSH, donc il est moins susceptible d’être trouvé par des robots qui analysent les adresses IP à la recherche de mot de passe faible sur les comptes par défaut. Si vous numérisez tout le réseau, vous ne pouvez pas vous permettre de vérifier tous les ports possibles (65 535 ports disponibles) pour trouver le serveur SSH.

Cependant, si quelqu’un vous cible activement, cela ne fournit aucun bénéfice, car une simple analyse *nmap* unique révèlera le port sur lequel **SSH** fonctionne réellement (on utilisera [PortSentry](PortSentry.md) pour bloquer ces attaques, voir plus bas).

- **Le port doit être compris entre 0-65535**
- **Le port utilisé ne doit pas être déjà utilisé par une application**

On désactive la connexion root en SSH :

`PermitRootLogin no`

Nous n’utiliserons pas le protocole [FTP](https://fr.wikipedia.org/wiki/File_Transfer_Protocol), cela pour des raisons évidentes de sécurités, mais [sFTP](https://fr.wikipedia.org/wiki/SSH_File_Transfer_Protocol).

On commente et / ou supprime cette ligne :

`#Subsystem sftp /usr/lib/openssh/sftp-server`

On ajoute en dessous :

`Subsystem sftp internal-sftp`

**internal-sftp** est recommandé pour les scénarios où la sécurité et l’isolation sont importantes, comme le chrooting des utilisateurs vers un répertoire spécifique.*

À la fin de la page, on ajoute : (on vérifie que les paramètres ne sont pas présents pour éviter les doublons)

```sh
UseDNS no
UsePAM yes

DebianBanner no

AllowUsers salameche
```

- **UseDNS** : par défaut, le serveur cherche à établir la résolution DNS inverse depuis votre IP. Cette requête peut être assez longue, c’est pour cela que nous désactivons cette fonctionnalité, plutôt inutile
- **UsePAM** : UsePAM gère les modules d’authentification (PAM) et on doit le laisser à *yes* si on veut utiliser l’authentification à deux facteurs (2FA) via `libpam-google-authenticator`, même si on utilise des clés SSH
- **DebianBanner** : permet d’éviter que le serveur SSH n’affiche la distribution Linux Ubuntu ou Debian
- **AllowUsers** : ajoute les utilisateurs autorisés à se connecter à SSH, pour notre cas, on ajoutera simplement « *salameche* »

On quitte et on redémarre SSH :

`sudo systemctl restart sshd`

### Authentification SSH

#### Méthode N°1 : clés SSH

On génère les clés SSH avec l’algorithme de chiffrement [ed25519](https://fr.wikipedia.org/wiki/EdDSA) :

`ssh-keygen -t ed25519`

*Pourquoi ED25519 ? En résumé, ED25519 et RSA sont tous deux des algorithmes cryptographiques à clé publique populaires utilisés pour la transmission sécurisée de données. ED25519 est généralement considéré comme plus sécurisé et efficace que RSA, tandis que RSA offre un niveau de sécurité plus élevé en raison de la taille de sa clé plus grande. Le choix entre ces deux algorithmes dépend de l’application spécifique et du niveau de sécurité et d’efficacité requis.*

On laisse l’emplacement par défaut :

```sh
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/salameche/.ssh/id_ed25519):
```

On y met un mot de passe, pas obligatoire, mais fortement recommandé :

```sh
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```

Nos clés sont générées :

```sh
Your identification has been saved in /home/salameche/.ssh/id_ed25519.
Your public key has been saved in /home/salameche/.ssh/id_ed25519.pub.
The key fingerprint is:
SHA256:4Yjb63lZzyRw+ADKaZ6nwZDA7jBrtorVR4mkgXRGWN0 salameche@my-pc
The key's randomart image is:
+--[ED25519 256]--+
|..+=. .          |
|o+o  ..E         |
|o..o.o ...       |
|o.o+=o ++..      |
|oo.=o.+ S=       |
|.+ .=+.   + .    |
|o o o+o  o =     |
|.o  .. oo   o    |
|+    .+.         |
+----[SHA256]-----
```

Une fois vos clés générées sur votre PC, on les place sur le serveur distant :

`ssh-copy-id <username>@<hostname>`

Remplacez **username** par le nom d’utilisateur et **hostname** par l’adresse IP ou le nom d’hôte du serveur.

Entrez le mot de passe de l’utilisateur.

C’est fait, la clé publique a bien été copiée dans le fichier **~/.ssh/authorized_keys** du serveur.

*Pour se connecter :*

Connectez-vous normalement en SSH via un terminal, par exemple :

`ssh <username>@<hostname>`

Entrez votre mot de passe de clé générée ci-dessus, voilà, vous êtes maintenant connecté à votre serveur !

Source : [Se connecter en SSH par échange de clés SSH - LeCrabe.info](https://lecrabeinfo.net/tutoriels/se-connecter-en-ssh-par-echange-de-cles-ssh/#etape-1-generer-des-cles-ssh)

#### Méthode N°2 : mot de passe

Je vous conseille de lire le début du [tutoriel pour apprendre à vous connecter à SSH](https://mondedie.fr/d/11708).

### (Facultatif) Double Authentification avec Google Authenticator PAM module

Il est possible d’activer l’authentification multifacteur (MFA/2FA) pour les connexions SSH sous Debian. Cette couche supplémentaire vient renforcer la sécurité au-delà du simple mot de passe. Lorsqu’on se connecte à une machine distante protégée par la MFA/2FA, on vous demandera d’abord un code à six chiffres, puis votre mot de passe habituel.

Ce code de vérification est calculé à partir d’un secret partagé entre l’appareil et le serveur, de l’heure courante — d’où l’importance de la synchronisation des horloges — ainsi que d’un algorithme de hachage. Ce procédé repose sur la norme TOTP (**Time‑based One‑Time Password**).

À noter que cette approche ne s’appuie sur aucun service externe : le serveur n’a pas besoin d’accès à Internet ni d’interroger *Google* ou un autre fournisseur tiers.

L’objectif est de sécuriser les connexions SSH (au lieu de se reposer uniquement sur un mot de passe) en demandant aux utilisateurs de fournir un mot de passe à usage unique (TOTP).

On se connecte en root et on installe [Google Authenticator PAM module](https://github.com/google/google-authenticator-libpam) :

`sudo apt update && sudo apt install libpam-google-authenticator`

Une fois `libpam-google-authenticator` installé, basculez sur le compte utilisateur pour lequel vous souhaitez activer la double authentification (MFA/2FA).

`su salameche`

On lance la commande :

`google-authenticator`

Ce qui donne :

```sh
Do you want authentication tokens to be time-based (y/n) y
Warning: pasting the following URL into your browser exposes the OTP secret to Google:
  https://www.google.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/root@Localhost%3Fsecret%3DKTWW75POHG75HQYVKGCEYAGBK4%26issuer%3DLocalhost

Your new secret key is: KTWW75POHG75HQYVKGCEYAGBK4
Enter code from app (-1 to skip):
```

Soit on capture le QR Code ou on entre le code secret (`KTWW75POHG75HQYVKGCEYAGBK4`) dans notre application pour générer notre code TOTP :

```sh
Enter code from app (-1 to skip): 457816
Code confirmed
Your emergency scratch codes are:
  30488198
  31255118
  10646665
  91637824
  69014874
```

Voici quelques application pour gérer les codes TOTP :

- [Bitwarden](https://bitwarden.com/) : [iOS](https://apps.apple.com/fr/app/bitwarden/id1137397744) - [Android](https://play.google.com/store/apps/details?id=com.x8bit.bitwarden&hl=fr) ⭐⭐⭐⭐
- [Twilio Authy](https://www.authy.com/) : [iOS](https://apps.apple.com/fr/app/twilio-authy/id494168017) - [Android](https://play.google.com/store/apps/details?id=com.authy.authy&hl=fr) ⭐⭐⭐
- Google Authenticator : [iOS](https://apps.apple.com/fr/app/google-authenticator/id388497605) - [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr) ⭐⭐⭐

Une fois le code TOTP confirmé, **sauvegardez vos codes de secours**, puis répondez aux questions selon vos besoins :

```sh
Do you want me to update your "/root/.google_authenticator" file? (y/n) y

Do you want to disallow multiple uses of the same authentication
token? This restricts you to one login about every 30s, but it increases
your chances to notice or even prevent man-in-the-middle attacks (y/n) y

By default, a new token is generated every 30 seconds by the mobile app.
In order to compensate for possible time-skew between the client and the server,
we allow an extra token before and after the current time. This allows for a
time skew of up to 30 seconds between authentication server and client. If you
experience problems with poor time synchronization, you can increase the window
from its default size of 3 permitted codes (one previous code, the current
code, the next code) to 17 permitted codes (the 8 previous codes, the current
code, and the 8 next codes). This will permit for a time skew of up to 4 minutes
between client and server.
Do you want to do so? (y/n) y

If the computer that you are logging into isn't hardened against brute-force
login attempts, you can enable rate-limiting for the authentication module.
By default, this limits attackers to no more than 3 login attempts every 30s.
Do you want to enable rate-limiting? (y/n) y
```

Une fois notre code OPT installé et configuré, on va modifier le fichier de configuration PAM pour le service **PAM** nommé **sshd** :

`sudo nano /etc/pam.d/sshd`

On ajoute, en haut du fichier :

`auth required pam_google_authenticator.so nullok`

- **auth** : utile pour l’authentification
- **required** : contrôle obligatoire, l’authentification échouera si celui-ci ne réussit pas
- **pam_google_authenticator.so** : le module PAM qui active le TOTP
- **nullok** : si le fichier `~/.google_authenticator` n’existe pas, le TOTP sera ignoré. Supprimez cette option si vous souhaitez imposer le TOTP pour toutes les connexions.

Ensuite on modifie le fichier de configuration principal du démon serveur **OpenSSH** (**sshd**) :

`sudo nano /etc/ssh/sshd_config`

On ajoute / modifie :

```sh
ChallengeResponseAuthentication yes
KbdInteractiveAuthentication yes
```

On quitte et on redémarre SSH :

`sudo systemctl restart sshd`

### Configuration Debian

#### sources.list

On met à jour notre fichier *sources.list* :

`nano --backup /etc/apt/sources.list`

On copie / colle :

```sh
deb https://deb.debian.org/debian trixie main contrib non-free-firmware
deb https://security.debian.org/debian-security trixie-security main contrib non-free-firmware
deb https://deb.debian.org/debian trixie-updates main contrib non-free-firmware
```

- **main** : logiciels 100% libres selon les critères Debian
- **contrib** : logiciels libres qui dépendent de paquets non libres (p. ex. nécessitent un firmware non libre pour fonctionner)
- **non-free-firmware** : section spéciale dédiée aux firmwares redistribuables mais non libres, utiles notamment pour cartes Wi‑Fi, GPU, etc. (*séparée de non-free depuis Debian 12 pour mieux isoler ces blobs*)
- **trixie-updates** : « pocket » des mises à jour dites **stable-updates**

**Ligne 1** : paquets de base de Trixie
**Ligne 2** : correctifs de sécurité pour Trixie
**Ligne 3** : mises à jour urgentes non-sécurité pour Trixie

On met à jour :

`sudo apt update`

#### Les paquets

On met à jour les paquets et on installe [nano](https://doc.ubuntu-fr.org/nano) (éditeur de texte) et [sudo](https://doc.ubuntu-fr.org/sudo) (permet à un utilisateur normal d’exécuter des commandes en tant que super-utilisateur (ou « root »)).

*Ces deux logiciels ne sont pas installés par défaut sur certains VPS, cela dépend du fournisseur et de la distribution, donc pour éviter tout problème, on installe, s’ils sont déjà présents sur le serveur, ça ne changera rien.*

`apt update && apt install apt-transport-https lsb-release ca-certificates nano sudo wget`

On re-met à jour le serveur :

`apt update && apt upgrade -y`

On crée notre utilisateur principal :

`adduser salameche`

Pour plus de clarté dans ce tutoriel, j’utiliserai comme nom d’utilisateur : **salameche**

Une fois notre utilisateur créé, on l’ajoute au groupe « *sudo* », cela permettra d’exécuter les commandes « *root* », sans être « *root* », cela améliore grandement la sécurité et évitera de faire des bêtises :

`adduser salameche sudo`

La sortie doit renvoyer :

```sh
Adding user `salameche' to group `sudo' ...
Adding user salameche to group sudo
Done.
```

Une fois l’utilisateur ajouté au groupe « *sudo* », on se connecte sur notre compte utilisateur « *salameche* » :

`su salameche`

On installe / désinstalle quelques logiciels pour la pratique et la sécurité, on recharge le cache de recherche et on met les liens symboliques à jour :

`sudo apt install ca-certificates curl gnupg && sudo apt purge ntp exim* postfix* sendmail* samba*`

***Ajouts*** :

- [ca-certificates](https://packages.debian.org/fr/bookworm/ca-certificates) : ce paquet inclut les autorités de certifications livrées avec les navigateurs Mozilla afin de permettre aux applications basées sur SSL de vérifier l’authenticité des connexions SSL
- [curl](https://packages.debian.org/fr/bookworm/curl) : curl est un outil en ligne de commande pour transférer des données avec une syntaxe URL qui prend en charge DICT, FILE, FTP, FTPS, GOPHER, HTTP, HTTPS, IMAP, IMAPS, LDAP, LDAPS, POP3, POP3S, RTMP, RTSP, SCP, SFTP, SMTP, SMTPS, TELNET et TFTP
- [gnupg](https://packages.debian.org/fr/bookworm/gnupg) : GnuPG est l’outil GNU pour sécuriser les communications et le stockage de données. Il peut être utilisé pour chiffrer des données et créer des signatures numériques. Il inclut un mécanisme perfectionné de gestion de clés et est compatible avec la proposition de standard OpenPGP pour Internet tel que décrit dans la RFC 4880

***Suppressions*** :

- [ntp](https://packages.debian.org/fr/bookworm/ntp) : il s’agit d’un package de transition factice pour passer à NTPsec. Il peut être retiré en toute sécurité
- [exim4](https://packages.debian.org/fr/bookworm/exim4) : exim (version 4) est un agent de transport de courrier. Exim4 est le métapaquet sur lequel dépendent les composants essentiels d’une installation de base d’exim4
- [postfix](https://packages.debian.org/fr/bookworm/postfix) : postfix est l’agent de transport de courriel de Wietse Venema qui a commencé son existence comme une alternative au très utilisé programme Sendmail. Postfix vise à être rapide, facile à administrer et sécuritaire, tout en restant assez compatible avec Sendmail pour ne pas frustrer ses utilisateurs. Ainsi, l’externe ressemble à Sendmail, alors que la structure interne est complètement différente
- [sendmail](https://packages.debian.org/fr/bookworm/sendmail) : sendmail est un agent de transmission de courriels (MTA) alternatif pour Debian. Il est adapté pour le traitement des configurations de messagerie sophistiquées, quoique cela signifie aussi que sa configuration peut être complexe
- [samba](https://packages.debian.org/fr/bookworm/samba) : samba est une implémentation du protocole SMB/CIFS pour les systèmes Unix, offrant la prise en charge du partage de fichiers et d’imprimantes multiplateforme avec Microsoft Windows, OS X et d’autres systèmes Unix. Samba peut également fonctionner comme un contrôleur de domaine de style Active Directory ou NT4 et peut s’intégrer aux domaines Active Directory ou aux domaines NT4 en tant que serveur membre

## Installation d’un serveur LAMP

### Installation et configuration d’Apache2

> **Apache2** est un serveur web open source largement utilisé pour héberger des sites web et des applications. Développé par la fondation Apache, il est compatible avec divers systèmes d’exploitation, dont Linux et Windows. Apache2 prend en charge plusieurs modules pour étendre ses fonctionnalités, comme PHP, SSL pour la sécurité, et des options de configuration avancées pour gérer le trafic web. Sa flexibilité et sa fiabilité en font l’un des serveurs web les plus populaires au monde.

On installe Apache2 :

Pour éviter tout conflit, on désinstalle Apache2 :

`sudo apt purge apache*`

Puis on réinstalle Apache2 :

`sudo apt install apache2 apache2-utils`

Par défaut, Apache2 écoute sur le port 80. Pour utiliser Tor et nginx en proxy inverse, on va écouter sur le port 8080.

`sudo nano /etc/apache2/ports.conf`

On change :

`Listen 80`

par

`Listen 127.0.0.1:8081`

On configure Apache2 :

`sudo nano /etc/apache2/apache2.conf`

On ajoute ces 3 lignes à la fin de la page :

```sh
ServerSignature Off
ServerTokens Prod
TraceEnable Off
```

- [ServerSignature](https://httpd.apache.org/docs/2.4/fr/mod/core.html#ServerSignature)
- [ServerTokens](https://httpd.apache.org/docs/2.4/fr/mod/core.html#ServerTokens)
- [TraceEnable](https://httpd.apache.org/docs/2.4/fr/mod/core.html#TraceEnable)

On applique les droits **Apache2** sur le dossier de notre futur projet *Hidden Service* :

```sh
sudo usermod -aG www-data salameche
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 775 /var/www/html
sudo chmod g+s /var/www/html
```

#### Virtual Host

> Un **Virtual Host** est une configuration qui permet à un serveur unique de répondre à des requêtes pour plusieurs noms de domaine. Cette fonctionnalité est particulièrement utile pour les serveurs web qui hébergent plusieurs sites web, permettant ainsi à chaque site d’avoir ses propres configurations et paramètres, tout en partageant les mêmes ressources serveur.

On crée notre *Virtuel Host* :

`sudo nano /etc/apache2/sites-available/hidden-service.conf`

On copie / colle :

```conf
<VirtualHost 127.0.0.1:8081>
    ServerName localhost
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    AddDefaultCharset UTF-8
    DefaultLanguage fr
    RewriteEngine on
    LimitRequestBody 10485760

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

- `AddDefaultCharset UTF-8` : définit l’encodage **UTF-8** par défaut pour les pages servies par le serveur Apache
- `DefaultLanguage fr` : définit la langue **fr** par défaut pour le contenu servi par le serveur Apache
- `RewriteEngine on` : active le module de réécriture d’URL **mod_rewrite** d’Apache
- `LimitRequestBody 10485760` : limite la taille à **10 Mo** maximale des requêtes HTTP que le serveur acceptera

On active le *Virtual Host* :

`sudo a2ensite hidden-service`

On désactive le [mod_autoindex](https://httpd.apache.org/docs/2.4/fr/mod/mod_autoindex.html) et le [mod_status](https://httpd.apache.org/docs/2.4/fr/mod/mod_status.html) :

`sudo a2dismod autoindex status`

- **mod_autoindex** : fournit une fonctionnalité de génération de listes de répertoires automatiques lorsque le serveur web reçoit une requête pour un répertoire qui ne contient pas de fichier index (comme index.html, index.php, etc.).

En d’autres termes, lorsque vous accédez à un répertoire sur un serveur web Apache et qu’aucun fichier d’index n’est présent dans ce répertoire, le module **mod_autoindex** génère automatiquement une liste des fichiers et répertoires contenus dans ce répertoire et la renvoie au client (le navigateur web) sous forme de page HTML. Cette page affiche généralement le nom, la taille et la date de modification des fichiers, ainsi que des liens pour naviguer dans les répertoires.

Le module **mod_autoindex** offre également des fonctionnalités de personnalisation permettant de modifier l’apparence et le comportement de ces listes de répertoires, comme la possibilité de masquer certains fichiers, d’ajouter des en-têtes et des pieds de page personnalisés, ou encore de définir des icônes pour différents types de fichiers.

En résumé, le module Apache **mod_autoindex** simplifie la gestion des répertoires sur un serveur web en générant automatiquement des listes de fichiers et de répertoires lorsque nécessaire, offrant ainsi une manière pratique de naviguer dans la structure des fichiers sur un site web.

- **mod_status** : module optionnel pour le serveur web Apache qui fournit des informations en temps réel sur la performance et l’utilisation du serveur. Il expose ces informations via une page HTML accessible via une URL spécifique.

Voici quelques-unes des informations que **mod_status** peut fournir :

- Statut du serveur : Il indique si le serveur est en cours d’exécution ou s’il est arrêté.
- Nombre de requêtes en cours : Combien de requêtes sont actuellement en cours de traitement par le serveur.
- Statistiques sur les requêtes : Nombre total de requêtes traitées depuis le démarrage du serveur, ainsi que des statistiques détaillées telles que le nombre de requêtes traitées par seconde.
- Statistiques sur les processus : Nombre de processus Apache en cours d’exécution, leur état (actif, en attente, etc.) et leur utilisation de la mémoire.
- Connexions : Informations sur les connexions actives et les connexions en attente.
- Détails sur les workers : Pour les configurations avec plusieurs workers (travailleurs), **mod_status** peut fournir des détails sur chaque worker, y compris leur état et leur utilisation des ressources.

Le module **mod_status** est souvent utilisé pour surveiller et diagnostiquer la performance du serveur Apache, ainsi que pour détecter tout problème éventuel. Il peut être particulièrement utile pour les administrateurs système chargés de gérer et de surveiller un serveur web Apache en temps réel.

Il convient de noter que, comme tout module Apache, **mod_status** doit être activé et configuré dans le fichier de configuration d’Apache pour être utilisé, et il est généralement recommandé de restreindre l’accès à la page de statut pour des raisons de sécurité.

On active différents modules utiles pour Apache2 :

`sudo a2enmod deflate rewrite headers`

On quitte et on redémarre Apache2 :

`sudo systemctl restart apache2`

On vérifie qu’Apache est bien configuré :

`sudo netstat -tuln | grep 8081`

La sortie doit renvoyer :

`tcp        0      0 127.0.0.1:8081          0.0.0.0:*					LISTEN`

- [Site officiel d’Apache2](https://httpd.apache.org/)
- [Dépôt GitHub officiel](https://github.com/apache/httpd)

### Installation et configuration de nginx comme proxy

> Un proxy **nginx** / Apache2 est une configuration où nginx est utilisé comme proxy inverse (reverse proxy) devant Apache2. Nginx reçoit toutes les requêtes des clients sur le port 80 (HTTP) ou 443 (HTTPS). Apache2 traite les requêtes dynamiques (comme les scripts PHP) et renvoie les réponses à Nginx, qui les transmet ensuite au client. Cette combinaison permet de tirer parti des avantages des deux serveurs, offrant ainsi une meilleure performance, une sécurité accrue, et une grande flexibilité dans la gestion du trafic web.

On installe nginx :

Pour éviter tout conflit, on désinstalle nginx :

`sudo apt purge nginx*`

Puis on réinstalle Apache2 :

`sudo apt install nginx`

On crée un fichier de configuration pour le proxy :

`sudo nano /etc/nginx/sites-available/proxy.conf`

On copie / colle :

```conf
server {
    listen 127.0.0.1:8080;
    server_name localhost;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Bloque l’accès aux fichiers sensibles (.htaccess, .git, .env, etc.)
    location ~ /\.(ht|git|env) {
        deny all;
    }

    # Sécurisation des requêtes
    client_max_body_size 10M;
    proxy_read_timeout 90;
    proxy_connect_timeout 90;
    proxy_send_timeout 90;
    proxy_redirect off;

    # Sécurité des en-têtes HTTP
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

On active cette configuration :

`sudo ln -s /etc/nginx/sites-available/proxy.conf /etc/nginx/sites-enabled/`

On vérifie qu’nginx est bien configuré :

`sudo nginx -t`

La sortie doit renvoyer :

```sh
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## PHP

### Installation et configuration de PHP

On va installer PHP 8 via le dépôt d’[Ondřej Surý](https://deb.sury.org/) car les dernières versions de PHP ne sont pas disponibles sur Debian.

Qui est **Ondřej Surý** ?

> Ondřej Surý est un développeur Debian depuis les années 2000, et il empaquetee PHP pour Debian depuis PHP 5, ce qui signifie que les paquets officiels dans Debian et Ubuntu sont soit son travail, soit ils sont basés sur son travail. Les paquets PHP de son Ubuntu PPA et Debian DPA correspondent aux paquets officiels de Debian.

- [Site officiel de PHP](https://www.php.net/)
- [Dépôt GitHub officiel](https://github.com/php/php-src)
- [Nouveautés dans PHP 8.4](https://kinsta.com/fr/blog/php-8-4/)

Pour éviter tout conflit, on désinstalle PHP :

```sh
sudo systemctl stop php*
sudo apt autoremove --purge php*
sudo a2dismod php5 php7.0 php7.1 php7.2 php7.3 php7.4 php8.0 php8.1 php8.2 php8.3 php8.4
```

On ajoute la clé GPG et le dépôt :

```sh
sudo curl -sSLo /tmp/debsuryorg-archive-keyring.deb https://packages.sury.org/debsuryorg-archive-keyring.deb
sudo dpkg -i /tmp/debsuryorg-archive-keyring.deb
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'
```

On met à jour les paquets :

`sudo apt update`

On installe PHP et quelques dépendances utiles :

```sh
sudo apt install php8.4 \
php8.4-{bz2,cli,common,curl,intl,mbstring,mysql,opcache,xml,zip} \
libapache2-mod-php8.4
```

On active PHP pour Apache2 :

`sudo a2enmod php8.4`

On configure PHP :

`sudo nano /etc/php/8.4/apache2/php.ini`

On remplace et / ou rajoute :

```ini
; https://www.php.net/manual/fr/ini.core.php#ini.short-open-tag
short_open_tag = Off

; https://www.php.net/manual/fr/ini.core.php#ini.open-basedir
open_basedir = /var/www/html:/tmp

; https://www.php.net/manual/fr/ini.core.php#ini.disable-functions
disable_functions =
    show_source,          ; Affiche le code source d’un fichier
    highlight_file,       ; Alias de show_source
    fpassthru,            ; Lit un fichier et l’affiche
    readlink,             ; Lit le chemin d’un lien symbolique
    symlink,              ; Crée un lien symbolique
    link,                 ; Crée un lien physique
    getcwd,               ; Obtient le répertoire de travail courant
    ;file_get_contents,    ; Lit le contenu d’un fichier dans une chaîne
    ;file_put_contents,    ; Écrit une chaîne dans un fichier
    parse_ini_file,       ; Analyse un fichier INI
    tmpfile,              ; Crée un fichier temporaire
    exec,                 ; Exécute une commande système
    system,               ; Exécute une commande système et affiche le résultat
    shell_exec,           ; Exécute une commande via le shell
    passthru,             ; Exécute un programme externe et affiche la sortie brute
    popen,                ; Ouvre un processus en lecture/écriture
    proc_open,            ; Exécution avancée de commandes
    pcntl_exec,           ; Exécute un programme
    curl_exec,            ; Exécution d’une requête cURL
    curl_multi_exec,      ; Exécution multiple de requêtes cURL
    fsockopen,            ; Ouverture de sockets réseau
    pfsockopen,           ; Ouverture persistante de sockets réseau
    stream_socket_client, ; Ouverture de sockets réseau via flux
    stream_socket_server  ; Création de serveurs socket
    allow_url_include,    ; Interdit l’inclusion de fichiers distants
    allow_url_fopen       ; Interdit l’ouverture de fichiers distants
    phpinfo,              ; Affiche les informations PHP (peut exposer l’IP et d’autres infos sensibles)
    ; getenv,               ; Obtient des variables d’environnement
    putenv,               ; Définit des variables d’environnement
    ini_set,              ; Modifie des options de configuration PHP
    ini_restore,          ; Rétablit une option PHP à sa valeur initiale
    dl,                   ; Charge une extension PHP au moment de l’exécution
    leak,                 ; Permet des fuites de mémoire
    posix_getpwuid,       ; Récupère les infos d’un utilisateur Unix
    posix_getgrgid,       ; Récupère les infos d’un groupe Unix
    get_current_user,     ; Récupère le nom de l’utilisateur sous lequel tourne PHP
    proc_nice,            ; Change la priorité du processus
    proc_terminate,       ; Termine un processus
    proc_close            ; Ferme un processus ouvert avec proc_open
    eval,                 ; Évalue du code PHP
    assert,               ; Évalue une assertion PHP (pouvant exécuter du code)
    create_function,      ; Crée une fonction anonyme à partir d’une chaîne
    mail,                 ; Permet l’envoie d’un courriel
    proc_get_status,      ; Lit les informations concernant un processus ouvert par proc_open()
    imap_open             ; Ouvre un flux IMAP vers une boîte aux lettres

; https://www.php.net/manual/fr/info.configuration.php#ini.max-execution-time
max_execution_time = 60

; https://www.php.net/manual/fr/info.configuration.php#ini.max-input-time
max_input_time = -1

; https://www.php.net/manual/fr/errorfunc.configuration.php#ini.display-errors
display_errors = Off

; https://www.php.net/manual/fr/errorfunc.configuration.php#ini.display-startup-errors
display_startup_errors = Off

; https://www.php.net/manual/fr/errorfunc.configuration.php#ini.log-errors
log_errors = On

; https://www.php.net/manual/fr/ini.core.php#ini.post-max-size
post_max_size = 8M

; https://www.php.net/manual/fr/ini.core.php#ini.upload-max-filesize
upload_max_filesize = 8M

; https://www.php.net/manual/fr/ini.core.php#ini.max-file-uploads
max_file_uploads = 0

; https://www.php.net/manual/fr/ini.core.php#ini.file-uploads
file_uploads = Off

; https://www.php.net/manual/fr/datetime.configuration.php#ini.date.timezone
date.timezone = Europe/Paris

; https://www.php.net/manual/fr/ini.core.php#ini.expose-php
expose_php = Off

; https://www.php.net/manual/fr/filesystem.configuration.php#ini.allow-url-fopen
allow_url_fopen = Off

; https://www.php.net/manual/fr/filesystem.configuration.php#ini.allow-url-include
allow_url_include = Off

; https://www.php.net/manual/fr/mysqlnd.config.php#ini.mysqlnd.collect-statistics
mysqlnd.collect_statistics = Off

; https://www.php.net/manual/fr/mysqlnd.config.php#ini.mysqlnd.collect-memory-statistics
mysqlnd.collect_memory_statistics = Off
```

Ces fonctions sont à titre d’information, vous pouvez activer / désactiver celles que vous souhaitez.

On sauvegarde le fichier **php.ini** et on redémarre Apache2 :

`sudo systemctl restart apache2`

## MariaDB

### Installation et configuration de MySQL

> **MariaDB** est un système de gestion de base de données édité sous licence GPL. Il s’agit d’un embranchement communautaire de MySQL : la gouvernance du projet est assurée par la fondation MariaDB, et sa maintenance par la société Monty Program AB, créateur du projet. Cette gouvernance confère au logiciel l’assurance de rester libre.

L’installation du méta-paquet **default-mysql-server** installera mariadb-server. Si les paquets mysql-server-* ou mysql-server-* sont installés, ils seront supprimés et remplacés par leur équivalent MariaDB. De la même façon, l’installation du méta-paquet default-mysql-client installera mariadb-client-*.

- [Site officiel de MariaDB](https://mariadb.org/)
- [Dépôt GitHub officiel](https://github.com/MariaDB/server)

Pour éviter tout conflit, on désinstalle MariaDB :

```sh
sudo systemctl stop mysql* maria*
sudo apt autoremove --purge mysql* maria*
```

On installe le serveur et le client MariaDB :

`sudo apt install default-mysql-server default-mysql-client`

Ensuite, on sécurise l’installation, le script ci-dessous nous guidera à travers certaines procédures qui élimineront les valeurs par défaut qui ne sont pas adaptées à un environnement de production.

On lance la commande, pour configurer, sécuriser et finaliser l’installation :

`sudo mysql_secure_installation`

1. `Enter current password for root (enter for none):` : **Entrer** > vide (si un mot de passe a déjà été défini, entrez-le pour continuer)
2. `Switch to unix_socket authentication [Y/n]` : **Y** > empêche les tentatives de connexion root
3. `Change the root password? [Y/n]` : **Y** > on change le mot de passe root
4. `Remove anonymous users? [Y/n]` : **Y** > empêche les connexions anonymes
5. `Disallow root login remotely? [Y/n]` : **Y** > empêche les tentatives de connexion root depuis l’extérieur du serveur
6. `Remove test database and access to it? [Y/n]` : **Y** > supprimer la base de données de test
7. `Reload privilege tables now? [Y/n]` : **Y** > applique les modifications

Une fois terminé, doit renvoyer :

`All done!  If you've completed all of the above steps, your MariaDB installation should now be secure.`

On redémarre MariaDB :

`sudo systemctl restart mariadb`

On active MariaDB au démarrage :

`sudo systemctl enable mariadb`

On vérifie que MariaDB fonctionne correctement :

`sudo systemctl status mariadb`

On vérifie que la connexion fonctionne :

`sudo mysql -u root`

Une fois connecté, on peut afficher les bases de données :

`SHOW DATABASES;`

Cela fonctionne sans demander de mot de passe car vous utilisez le socket Unix en tant que root.

#### Base de données et utilisateur

On se connecte en root à la base de données MySQL :

`sudo mysql -u root`

On crée notre base de données **mon_onion** :

`CREATE DATABASE mon_onion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

On crée un utilisateur **salameche** avec comme de mot de passe **mot_de_passe** :

`CREATE USER 'salameche'@'localhost' IDENTIFIED BY 'mot_de_passe';`

On applique les privilèges pour la base de données **mon_onion** à **salameche** :

`GRANT ALL PRIVILEGES ON mon_onion.* TO 'salameche'@'localhost';`

On recharge les privilèges pour qu’ils prennent effet immédiatement :

`FLUSH PRIVILEGES;`

#### Adminer : accéder aux tables SQL

Pour accéder à votre base de données SQL, je vous propose d’utiliser [Adminer](https://www.adminer.org/).

Généralement, on utilise [phpMyAdmin](https://www.phpmyadmin.net/), complet et facile d’utilisation mais malheureusement, ce gestionnaire n’est pas adapté à notre configuration car gourmand en ressource et il utilise JavaScript (à proscrire sur le réseau Tor), il s’expose à des vulnérabilités, etc. Si vous souhaitez utiliser un autre logiciel, vous trouverez des exemples sur [sql.sh](https://sql.sh/logiciels).

Nous n’allons pas installer de gestionnaire de base de données à propremment parler. Il vous suffira de télécharger le fichier lorsque vous aurez besoin d’accéder à votre base de données et de le supprimer une fois vos opérations terminées.

Voici comment on peut utiliser **Adminer** :

```sh
fichier=$(mktemp -u adminer_XXXXXXXXXXXXXXXXXXXX.php) && wget -O "$fichier" "https://github.com/vrana/adminer/releases/download/v5.4.1/adminer-5.4.1.php" && echo "Fichier Adminer : $fichier"
```

Lorsque vous avez terminé, **veuillez supprimer** le fichier **adminer_XXXXXXXXXXXXXXXXXXXX.php** !

- [Site officiel d’Adminer](https://www.adminer.org/)
- [Dépôt GitHub officiel](https://github.com/vrana/adminer)

## Tor

### Installation et configuration de Tor

> Tor est un réseau informatique superposé mondial et décentralisé. Il se compose de serveurs, appelés nœuds du réseau et dont la liste est publique. Ce réseau permet d’anonymiser l’origine de connexions TCP. Cela peut entre autres servir à anonymiser la source d’une session de navigation Web ou de messagerie instantanée. Cependant, l’anonymisation du flux n’est pas totale, car l’application peut transmettre des informations annexes permettant d’identifier la personne, c’est pourquoi le projet Tor développe également un navigateur Web fondé sur Firefox, Tor Browser, ainsi que d’autres applications spécialement modifiées pour préserver l’anonymat de leurs usagers. Le nom « Tor » est à l’origine un acronyme pour « The Onion Router », littéralement « le routeur oignon », qui s’est lexicalisé comme nom propre.

- [Site officiel de Tor](https://www.torproject.org/)
- [Dépôt GitLab officiel](https://gitlab.torproject.org/tpo/core/tor)
- [Clé GPG officielle du projet Tor](https://support.torproject.org/tbb/how-to-verify-signature/)

Pour éviter tout conflit, on désinstalle Tor :

```sh
sudo systemctl stop tor*
sudo apt autoremove --purge tor*
```

On installe Tor :

`sudo apt install tor`

On active Tor au démarrage :

`sudo systemctl enable tor`

On vérifie que Tor fonctionne et renvoie bien cette page :

`curl --socks5 127.0.0.1:9050 https://check.torproject.org/`

#### Configuration du Hidden Service

On configure Tor :

`sudo nano /etc/tor/torrc`

On recherche et ajoute / dé-commente ces lignes :

```sh
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:8080
```

On limite l’accès à Tor SOCKS sur 127.0.0.1 :

On recherche et ajoute / dé-commente ces lignes :

```sh
SocksPolicy accept 192.168.0.0/16
SocksPolicy reject *
```

On redémarre Tor :

`sudo systemctl restart tor`

On vérifie que Tor fonctionne correctement :

`sudo systemctl status tor`

Redémarrer Tor va créer le répertoire **/var/lib/tor/hidden_service** ainsi que deux fichiers très importants :

- **hostname** : nom de votre Hidden Service : `gv3ebskdgoavtwl345y7tnqvcizljlmifxzvqnzx3p22sd5gd252z5id.onion`, par exemple

- **private_key** : clé privée de votre Hidden Service

*Notez le contenu de **hostname** quelque part, on l’utilisera plus tard !*

### Générer une adresse .onion personnalisée

Les adresses en .onion sont générées aléatoirement par un algorithme intégré à Tor et n’a pas d’identité propre, en revanche vous pouvez personnaliser les premiers caractères de l’adresse .onion. Le nombre de caractères dépendra de votre puissance de calcul liée à votre carte graphique ou processeur. On va utiliser le logiciel [mkp224o](https://github.com/cathugger/mkp224o) pour générer les adresses.

Temps moyen pour générer un alias personnalisé sur une carte graphique *nVidia GeForce GTX 4070* :

- **5** lettres : 1 seconde
- **6** lettres : 10 secondes
- **7** lettres : 15 secondes
- **8** lettres : 1 minute

On installe les pré-requis :

`apt install gcc libc6-dev libsodium-dev make autoconf`

On clone le dépôt :

`git clone https://github.com/cathugger/mkp224o.git`

On configure **mkp224o** :

```sh
./autogen.sh
./configure
make
```

On créé notre adresse personnalisée qui commence par **machou** :

`./mkp224o machou`

Un répertoire a été créé :

`cd machou********************************.onion`

On copie ce répertoire dans le dossier du **Hidden Service**, sur le serveur :

`sudo cp -r machou********************************.onion /var/lib/tor/hidden_service`

On ajuste les droits :

```sh
sudo chown -R debian-tor:debian-tor /var/lib/tor/hidden_service
sudo chmod -R u+rwX,og-rwx /var/lib/tor/hidden_service
```

### Debug

Résumé des Ports :

- **Tor** → **nginx** : **Port 80** → **127.0.0.1:8080**
- **nginx** → **Apache2** : **Port 8080** → **127.0.0.1:8081**

Status des services :

`sudo systemctl status tor nginx apache2`

Surveillez les logs pour vérifier le bon fonctionnement :

```sh
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/nginx/access.log
sudo journalctl -u tor -f
```

On vérifie que le répertoire de Tor existe et que les permissions sont correctes :

`sudo ls -la /var/lib/tor/hidden_service/`

Exemple :

```sh
-rw------- 1 debian-tor debian-tor   63 27 févr. 16:09 hostname
-rw------- 1 debian-tor debian-tor   64 27 févr. 16:09 hs_ed25519_public_key
-rw------- 1 debian-tor debian-tor   96 27 févr. 16:09 hs_ed25519_secret_key
```

Maintenant, lancez le [Navigateur Tor](https://www.torproject.org/download/) sur votre ordinateur et connectez-vous au *Hidden Service* que vous avez généré plus haut !

<p class="text-center"><a href="https://i.ibb.co/M267kK8/onion.png" data-fancybox="gallerie"><img src="https://i.ibb.co/M267kK8/onion.png" class="border rounded img-fluid" alt="Fenêtre Tor" title="Fenêtre Tor"></a></p>

## Facultatif

### Configuration du Pare-feu (UFW)

Pour s’assurer que seuls Tor (via le *Hidden Service*) et vous (via SSH) pouvez accéder au serveur, nous allons installer `ufw` (Uncomplicated Firewall).

`sudo apt install ufw`

Par défaut, on bloque tout :

`sudo ufw default deny incoming`
`sudo ufw default allow outgoing`

On autorise ensuite **uniquement** notre port SSH (remplace `_PORT_` par ton port SSH personnalisé) :

`sudo ufw allow _PORT_/tcp`

**Important** : nous n’avons **pas** besoin d’ouvrir les ports 80, 8080, ou 8081. Tor (le service) et Nginx/Apache communiquent en local (`127.0.0.1`), ce qui n’est pas filtré par `ufw` de cette manière.

On active le pare-feu :

`sudo ufw enable`

Vérifiez que votre connexion SSH est toujours active !

### Configuration de la langue

On peut changer la langue pour brouiller un peu les pistes :

`sudo dpkg-reconfigure locales`

Dans, la liste, on peut choisir les deux langues principales *en*, *en_US.UTF-8*, *fr*, *fr_FR.UTF-8* :

La sortie renverra :

```sh
Generating locales (this might take a while)...
	en_US.UTF-8... done
	fr_FR.UTF-8... done
Generation complete.
```

Les langues anglaise et française ont été sélectionnées, mais libre à vous de configurer celle que vous souhaitez, c’est d’ailleurs fortement recommandé de ne pas choisir votre langue maternelle, sinon laissez celle par défaut.

### Configuration de la date et heure

On peut changer la date et heure pour brouiller un peu les robots :

`sudo dpkg-reconfigure tzdata`

Dans la liste, on choisit le fuseau horaire que l’on souhaite, pour nous ça sera Paris :

Cela renverra :

```sh
Current default time zone: 'Europe/Paris'
Local time is now:      Thu Jun 20 15:51:54 CEST 2024.
Universal Time is now:  Thu Jun 20 13:51:54 UTC 2024.
```

Le fuseau horaire de Paris a été choisi, mais libre à vous de configurer celui que vous souhaitez, c’est d’ailleurs fortement recommandé de ne pas choisir celui où vous résidez (pays ou ville), sinon laissez celui par défaut.

### Rediriger le trafic réseau du serveur vers Tor

**Nipe** est un script pour faire de Tor Network votre passerelle réseau par défaut.

On installe **Perl** :

`sudo apt install perl`

On télécharge et on installe le script :

```sh
git clone https://github.com/htrgouvea/nipe && cd nipe
sudo cpanm --installdeps .
sudo perl nipe.pl install
```

Si erreur, on installe les dépendances **Perl** manquantes via **cpan** :

`sudo cpan install Try::Tiny Config::Simple JSON`

- Pour lancer Nipe : `perl nipe.pl start`
- Pour arrêter Nipe : `perl nipe.pl stop`

Commandes Nipe :

```sh
COMMAND          FUNCTION
install          Install dependencies
start            Start routing
stop             Stop routing
restart          Restart the Nipe circuit
status           See status
```

Exemples :

```sh
perl nipe.pl install
perl nipe.pl start
perl nipe.pl stop
perl nipe.pl restart
perl nipe.pl status
```

<p class="mb-0 text-center"><a href="https://heitorgouvea.me/images/projects/nipe/demo.gif" data-fancybox="gallerie"><img src="https://heitorgouvea.me/images/projects/nipe/demo.gif" class="border rounded img-fluid" alt="Cartographie des utilisateurs" title="Cartographie des utilisateurs"></a></p>

- [Dépôt GitHub officiel du projet Nipe](https://github.com/GouveaHeitor/nipe)

### Réécrire la RAM avant un arrêt / redémarrage du serveur

On installe le paquet `secure-delete`

`sudo apt install secure-delete`

On créé notre fichier script :

`nano /home/salameche/ram.sh`

On rend le script exécutable :

`chmod +x ram.sh`

On y ajoute :

```sh
#!/bin/bash

# Vérifier les arguments
if [ "$1" != "shutdown" ] && [ "$1" != "reboot" ]; then
    echo "Usage: $0 <shutdown|reboot>"
    exit 1
fi

echo "Purge de la RAM en cours (peut prendre du temps)..."
# Utilise sdmem pour réécrire la RAM
# -f (fast) -l (less secure, 1 pass) -v (verbose)
# On peut enlever -f et -l pour 38 passes (très lent)
sudo sdmem -f -l -v

echo "RAM purgée."

# Arrêter ou redémarrer le serveur
if [ "$1" == "shutdown" ]; then
    echo "Arrêt du serveur..."
    sudo shutdown -h now
elif [ "$1" == "reboot" ]; then
    echo "Redémarrage du serveur..."
    sudo reboot
fi
```

- Redémarrer le serveur : `./ram.sh shutdown`
- Arrêter le serveur : `./ram.sh reboot`

### Supprimer mes traces

Nous allons utiliser [shred](https://doc.ubuntu-fr.org/shred) pour supprimer les fichiers logs sur le serveur. **shred** est un utilitaire de ligne de commande sous Linux et Unix qui permet de supprimer définitivement des fichiers en écrivant de manière aléatoire des données sur les emplacements de stockage correspondants. Il est généralement utilisé pour supprimer des fichiers sensibles ou confidentiels de manière sécurisée afin de s’assurer qu’ils ne peuvent pas être récupérés.

Il est important de noter que l’utilisation de **shred** ne garantit pas à 100% que les données sont totalement irrécupérables, car il est toujours possible qu’une partie des données soit récupérée à l’aide de techniques de récupération avancées. Cependant, shred offre une méthode simple et efficace pour supprimer de manière sécurisée des fichiers sur un système Linux ou Unix.

Vous pouvez utiliser shred sur tous les fichiers que vous souhaitez, j’utilise le dossier `/var/log` pour l’exemple.

`sudo find /var/log -type f -print0 | sudo xargs -0 shred -fuzv -n 15`

Explications de la commande :

| Commandes		| Explications																																		|
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| sudo			| exécute la commande en tant que super-utilisateur pour avoir le droit de lire tous les fichiers dans /var/log										|
| find			| outil de recherche																																|
| -type f		| cherche uniquement les fichiers																													|
| -print0		| sépare les fichiers trouvés par un caractère nul (\0). Essentiel pour que `xargs` ne « trébuche » pas sur un nom de fichier contenant un espace	|
| xargs			| permet de transformer l’entrée standard en une séquence d’arguments pour une autre commande														|
| -0			| les noms de fichiers devront être séparés par un caractère nul (pour correspondre au `-print0` de `find`)											|
| shred			| réécrit par-dessus x fois avant de le supprimer																									|
| -f			| force l'opération, même si le fichier est protégé en écriture (change les permissions si besoin)													|
| -u			| supprime le fichier après l'avoir « déchiqueté »																									|
| -z			| fait une passe finale d'écriture avec des zéros (pour masquer le fait que shred a été utilisé)													|
| -v			| affiche ce qu'il est en train de faire (mode bavard)																								|
| -n 15			| réécrit 15 fois des données aléatoires sur le fichier avant la passe de zéros et la suppression. (Le défaut est 3).		|

On peut aussi créer un fichier qui s’exécutera tous les jours à minuit :

`nano /home/salameche/delete.sh`

On y ajoute :

```sh
#!/bin/bash

# Supprimer tous les fichiers dans /var/log de manière sécurisée
sudo find /var/log -type f -print0 | sudo xargs -0 shred -fuzv -n 15

# Supprimer tous les répertoires vides dans /var/log
sudo find /var/log -type d -empty -exec rmdir {} \;
```

On rend le script exécutable :

`chmod +x /home/salameche/delete.sh`

On crée la tâche cron :

`crontab -e`

On y ajoute la ligne de commande :

`0 0 * * * /home/salameche/delete.sh`

#### Alias utiles (*~/.bashrc*)

On édite notre fichier **~/.bashrc** :

`sudo nano ~/.bashrc`

On y ajoute :

```sh
alias cleany="sudo truncate -s 0 /var/run/utmp && sudo truncate -s 0 /var/log/btmp && sudo truncate -s 0 /var/log/wtmp && sudo truncate -s 0 /var/log/lastlog"
alias clog="find /var/log -type f -print0 | sudo xargs -0 shred -fuzv -n 10"
alias update="sudo apt update && sudo apt upgrade && sudo apt full-upgrade && sudo apt dist-upgrade && sudo apt clean && sudo apt autoclean && sudo apt autoremove && sudo updatedb && sudo ldconfig && sudo chown www-data:www-data /var/www/html -R"
```

- *cleany* : nettoie les connexions et les logs
- *clog* : nettoie en profondeur tous les fichiers contenus dans le dossier /var/log
- *update* : met à jour, nettoie, et regénèredes les liens symboliques

On recharge le fichier **~/.bashrc** :

`source ~/.bashrc`

### Désactiver IPv6

#### Méthode N°1 : désactiver IPv6 via le fichier de configuration GRUB

On modifie le fichier de configuration GRUB :

`sudo nano /etc/default/grub`

On modifie la ligne GRUB_CMDLINE_LINUX :

`GRUB_CMDLINE_LINUX="ipv6.disable=1"`

Si la ligne existe déjà avec d’autres paramètres, ajoutez simplement *ipv6.disable=1* à la liste, en **séparant chaque paramètre par un espace**. Par exemple :

`GRUB_CMDLINE_LINUX="quiet splash ipv6.disable=1"`

On met à jour la configuration GRUB :

`sudo update-grub`

On redémarre le serveur :

`sudo reboot`

Une fois redémarrer, on vérifie qu’IPv6 est désactivé ;

`cat /proc/sys/net/ipv6/conf/all/disable_ipv6`

La sortie doit renvoyer **1**, indiquant que IPv6 est désactivé.

#### Méthode N°2 : désactiver IPv6 via le fichier sysctl

On modifie le fichier de configuration **sysctl** :

`sudo nano /etc/sysctl.conf`

On y ajoute :

```sh
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 0
net.bridge.bridge-nf-call-ip6tables = 0
net.bridge.bridge-nf-call-iptables = 0
net.bridge.bridge-nf-call-arptables = 0
net.ipv4.ip_forward = 1
net.ipv6.conf.all.autoconf = 0
net.ipv6.conf.default.autoconf = 0
```

- `net.ipv6.conf.all.disable_ipv6 = 1` : désactive IPv6 pour toutes les interfaces réseau
- `net.ipv6.conf.default.disable_ipv6 = 1` : désactive IPv6 par défaut pour toutes les nouvelles interfaces réseau qui seront créées
- `net.ipv6.conf.lo.disable_ipv6 = 0` : active IPv6 sur l’interface de bouclage (loopback, généralement lo), même si IPv6 est désactivé sur les autres interfaces
- `net.bridge.bridge-nf-call-ip6tables = 0` : désactive le passage des paquets IPv6 aux tables de filtrage (ip6tables) sur les interfaces bridge
- `net.bridge.bridge-nf-call-iptables = 0` : désactive le passage des paquets IPv4 aux tables de filtrage (iptables) sur les interfaces bridge
- `net.bridge.bridge-nf-call-arptables = 0` : désactive le passage des paquets ARP aux tables de filtrage (arptables) sur les interfaces bridge
- `net.ipv4.ip_forward=1` : active le routage des paquets IPv4 entre les interfaces réseau, permettant à la machine de faire office de routeur
- `net.ipv6.conf.all.autoconf = 0` : désactive la configuration automatique des adresses IPv6 (stateless autoconfiguration) sur toutes les interfaces réseau. Cela signifie que les interfaces réseau ne tenteront pas d’auto-configurer leurs adresses IPv6 basées sur les annonces de routeurs IPv6
- `net.ipv6.conf.default.autoconf = 0**` : désactive la configuration automatique des adresses IPv6 par défaut pour toutes les nouvelles interfaces réseau qui seront créées. Cela s’applique aux interfaces réseau qui n’existent pas encore mais qui seront ajoutées ultérieurement

On applique les modifications :

`sudo sysctl -p`

On redémarre le serveur :

`sudo reboot`

#### Méthode N°3 : rejeter tout le trafic IPv6](#méthode-n3--rejeter-tout-le-trafic-ipv6)

On crée la règle de blocage :

`sudo nano /etc/ipv6-iptables-rules`

On y ajoute :

```sh
*filter

# Politique par défaut pour la chaîne INPUT : DROP
:INPUT DROP [0:0]
# Politique par défaut pour la chaîne FORWARD : DROP
:FORWARD DROP [0:0]
# Politique par défaut pour la chaîne OUTPUT : ACCEPT
:OUTPUT ACCEPT [0:0]

# Bloquer tout le trafic entrant
-A INPUT -j DROP

# Bloquer tout le trafic forward
-A FORWARD -j DROP

COMMIT
```

On applique la règle :

`sudo ip6tables-restore < /etc/ipv6-iptables-rules`

Pour persister cette règle à chaque redémarrage du serveur, on peut installer `netfilter-persistent` :

`sudo apt install netfilter-persistent`

On y sauvegarde la règle :

`sudo netfilter-persistent save`

On active le service pour qu’il démarre automatiquement :

`sudo systemctl enable netfilter-persistent`

On peut vérifier les règles IPv6 pour voir si elle a été prise en compte :

`sudo ip6tables -L -v`

On redémarre le serveur :

`sudo reboot`

## Quelques liens / tutoriels utiles](#quelques-liens--tutoriels-utiles)

### Aide-mémoires / tutoriels](#aide-mémoires--tutoriels)

- [Aide-mémoire Bash](https://devhints.io/bash) 🇺🇸
- [Aide-mémoire du mode d’édition Bash Emacs](https://catonmat.net/bash-emacs-editing-mode-cheat-sheet) 🇺🇸
- [Awesome Bash Awesome](https://github.com/awesome-lists/awesome-bash) 🇺🇸
- [Awesome Linux Software](https://github.com/luong-komorebi/Awesome-Linux-Software) 🇺🇸
- [Bien débuter sur Debian](https://mondedie.fr/d/5438) 🇫🇷
- [Installation et configuration de Fail2ban](https://mondedie.fr/d/5318/2) 🇫🇷
- [How To  A Linux Server](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server) 🇺🇸
- [The Onion Diaries](https://github.com/alecmuffett/the-onion-diaries/tree/master) 🇺🇸

### Documentations](#documentations)

- [FAQ Debian GNU/Linux](https://www.debian.org/doc/manuals/debian-faq/) 🇫🇷
- [Documentation officielle Debian](https://www.debian.org/releases/stable/amd64/index.fr.html) 🇫🇷
- [Documentation officielle Ubuntu](https://help.ubuntu.com/lts/ubuntu-help/index.html) 🇫🇷

### Autres](#autres)

- [Commande : sudo](https://wiki.debian.org/fr/sudo) 🇫🇷
- [Générateur de couleur : .bashrc & PS1](https://robotmoon.com/bash-prompt-generator/) 🇺🇸
- [vim pour les humains](https://vimebook.com/fr) 🇫🇷

## À faire](#à-faire)

> - héberger le site directement dans la ram
> - bloquer les ports inutiles
> - chiffrer le disque dur
> - stocker les clés dans le CPU plutôt que dans la RAM (qui peut être copiée) par exemple via TRESOR
> - SSH par clé avec accès selon IP ou par PortKnocking
> Concernant les logs, 2 solutions, sur des machines dites « sécurisées » :
> - soit de ne pas en émettre
> - soit de les traiter avec logrotate (et le paramètre shred — 3 max.)

Si vous avez des idées ou des améliorations à proposer, n’hésitez pas à poster un commentaire ci-dessous.

****

<p class="text-center">
	<a href="assets/img/tor.svg" data-fancybox="gallerie"><img src="assets/img/tor.svg" class="img-fluid" alt="Logo Tor / Debian" title="Logo Tor / Debian"></a>
</p>
