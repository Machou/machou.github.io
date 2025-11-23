---
layout: defaut
title: "Comment utiliser Fail2ban sur Debian"
description: "Comment installer et configurer Fail2ban sur Debian"
permalink: /comment-utiliser-fail2ban
slug: comment-utiliser-fail2ban
canonical_url: https://machou.github.io/comment-utiliser-fail2ban
favicon: /assets/img/favicon.png
---

<nav aria-label="breadcrumb">
	<ol class="breadcrumb">
		<li class="breadcrumb-item"><a href="https://machou.github.io/">Accueil</a></li>
		<li class="breadcrumb-item"><a href="comment-creer-hidden-service">Créer un Hidden Service</a></li>
		<li class="breadcrumb-item active" aria-current="page">Fail2ban</li>
	</ol>
</nav>

# [Fail2ban](comment-utiliser-fail2ban)

- [Qu’est-ce que Fail2ban ?](#quest-ce-que-fail2ban-)
- [Installation de Fail2ban](#installation-de-fail2ban)
- [Configuration de Fail2ban](#configuration-de-fail2ban-pour-les-services-actifs)
- [Configuration avancée](#configuration-avancée)

## Qu’est-ce que Fail2ban ?

<p class="text-center"><a href="https://i.ibb.co/NmgL9QN/Fail2ban-screenshot.png" data-fancybox="gallerie"><img src="https://i.ibb.co/NmgL9QN/Fail2ban-screenshot.png" class="border rounded img-fluid" alt="Fenêtre Fail2ban" title="Fenêtre Fail2ban"></a></p>

[Fail2ban](https://github.com/fail2ban/fail2ban) est un logiciel de sécurité destiné à prévenir les attaques par force brute en bloquant temporairement les adresses IP suspectes. Il analyse les journaux des services pour détecter des motifs d’échecs d’authentification répétés et autres comportements suspects, puis utilise des règles **iptables** pour bannir temporairement ces adresses IP.

### Fonctionnalités principales de Fail2ban

1. **Surveillance des journaux** : Fail2ban surveille les fichiers de journaux de divers services (SSH, FTP, HTTP, etc.) pour détecter des tentatives de connexion échouées répétées
2. **Bannissement temporaire** : lorsque Fail2ban détecte un nombre prédéfini de tentatives échouées depuis une même IP, il bannit cette IP pour une période déterminée
3. **Flexibilité et extensibilité** : Fail2ban est hautement configurable et peut être étendu pour surveiller presque n’importe quel service à travers des fichiers de configuration personnalisés et des filtres regex
4. **Actions de bannissement** : Fail2ban peut utiliser différentes actions de bannissement, telles que la mise à jour des règles **iptables**, la modification des règles hosts.deny, ou l’envoi de notifications par email

## Installation de Fail2ban

#### Méthode N°1

Installation de **Fail2ban** via les paquets officiels :

`sudo apt install fail2ban`

---

#### Méthode N°2 : via les sources

Installation de **Fail2ban** via les sources du dépôt GitHub :

```sh
git clone https://github.com/fail2ban/fail2ban.git
cd fail2ban
sudo python setup.py install
```

On vérifie que Fail2ban s’est correctement installé :

`fail2ban-client -h`

### Configuration de Fail2ban pour les services actifs

On démarre le service :

`systemctl start fail2ban`

On active le démarrage automatique :

`systemctl enable fail2ban`

On vérifie que le service fonctionne :

`systemctl status fail2ban`

Par défaut, **Fail2ban** utilise le fichier `/etc/fail2ban/jail.conf` qui contient les réglages globaux et les définitions des prisons (*jails*). Ce fichier **ne doit jamais être modifié** car il serait écrasé lors d'une mise à jour de **Fail2ban**.

La méthode standard consiste à créer un fichier de configuration local qui surchargera uniquement les paramètres qu’on souhaite modifier :

`sudo nano /etc/fail2ban/jail.local`

On va configurer le fichier `jail.local` et utiliser paramètres par défaut les plus importants pour définir la politique de bannissement pour toutes les prisons qui seront activées :

```toml
[DEFAULT]
bantime = 24h
findtime = 10m
maxretry = 3
# Remplacez 192.168.1.0/24 par la plage d'IP de votre réseau local, si applicable.
ignoreip = 127.0.0.1/8 192.168.1.0/24 ::1
action = %(action_)s
```

| Paramètres    | Description                                                                                                                                |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **bantime**   | durée du bannissement qui s’applique à une IP une fois qu’elle a atteint le seuil `maxretry`                                               |
| **findtime**  | fenêtre de temps pendant laquelle **Fail2Ban** compte les tentatives de connexion échouée                                                  |
| **maxretry**  | nombre maximal d’échecs (tentatives) qu’une IP peut faire avant d’être bannie.                                                             |
| **ignoreip**  | liste des adresses IP (IPv4 et IPv6) ignorées<br>plages IP ; exemples : `ignoreip = 192.168.1.0/24` ou `ignoreip = 192.168.1.0/24 10.0.0.1 172.16.0.0/16` |
| **action**    | action par défaut : utilise `iptables` (ou `nftables`) pour bannir l’IP                                                                    |
{:.table .table-hover}

**Autres paramètres**

| Paramètres    | Description                                                                                                                                |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **logrotate** | utilitaire système conçu pour gérer automatiquement les fichiers journaux (logs).                                                          |
| **enabled**   | simple booléen (`true`/`false` ou `1`/`0`) qui active ou désactive une **jail** (une règle de protection pour un service donné)            |
| **destemail** | adresse e-mail à laquelle **Fail2Ban** enverra les notifications ou les rapports                                                           |
{:.table .table-hover}

### Activer la prison SSH (sshd)

Maintenant que les valeurs par défaut sont définies, nous allons créer (ou surcharger) la section spécifique au service SSH (nommé `sshd` dans **Fail2ban**).

On modifie le fichier `jail.local` :

`sudo nano /etc/fail2ban/jail.local`

On cherche la partie `[sshd]` :

```toml
[sshd]
enabled = true
port = ssh
filter = sshd
maxretry = 3
bantime = 48h
```

Le paramètre `filter = sshd` indique à **Fail2ban** d’utiliser le fichier de filtre pré-écrit `/etc/fail2ban/filter.d/sshd.conf`. Ce fichier contient les expressions régulières (failregex) nécessaires pour identifier les lignes de tentatives de connexion échouées dans le fichier de journal (auth.log).

On applique les modifications :

`sudo systemctl restart fail2ban`

On vérifie que **Fail2ban** fonctionne :

`sudo systemctl status fail2ban`

Doit renvoyer :

```sh
● fail2ban.service - Fail2Ban Service
     Loaded: loaded (/usr/lib/systemd/system/fail2ban.service; enabled; preset: enabled)
     Active: active (running) since Thu 2025-11-20 13:47:43 CET; 1s ago
 Invocation: 1ff45edcd8eb4238bbaec105c3c9cf2c
       Docs: man:fail2ban(1)
   Main PID: 72339 (fail2ban-server)
      Tasks: 7 (limit: 4596)
     Memory: 14.4M (peak: 16.8M)
        CPU: 1.627s
     CGroup: /system.slice/fail2ban.service
             ├─72339 /usr/bin/python3 /usr/bin/fail2ban-server -xf start
             └─72448 /usr/bin/python3 /usr/bin/fail2ban-server -xf start

nov. 20 13:47:43 sd-117585 systemd[1]: Started fail2ban.service - Fail2Ban Service.
nov. 20 13:47:43 sd-117585 fail2ban-server[72339]: Server ready
```

Pour vérifier l’état de la prison `[sshd]` :

`sudo fail2ban-client status sshd`

Vous devriez voir une sortie similaire à ceci, confirmant que le filtre surveille le bon journal :

```text
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     0
|  `- File list:        /var/log/auth.log
`- Actions
   |- Currently banned: 0
   |- Total banned:     0
   `- Banned IP list:
```

### La Prison spéciale

On va créer une prison pour bannir des adresses IP manuellement et éviter de rentrer en conflit avec d¹autres filtres.

Voici comment la mettre en place :

On va ajouter cette nouvelle section dans votre fichier de configuration local, soit `/etc/fail2ban/jail.local`, soit dans un nouveau fichier de la structure `/etc/fail2ban/jail.d/`.

On ouvre `jail.local` :

`sudo nano /etc/fail2ban/jail.local`

On ajoute à la fin du fichier :

```toml
[manual-jail]
enabled = true
logpath = /dev/null
filter =
bantime = 1y
maxretry = 1
```

| Paramètres   | Description                                                     |
|--------------|-----------------------------------------------------------------|
| **enabled**  | on active la prison                                             |
| **logpath**  | pas de chemin de journal (on ne surveille rien)                 |
| **filter**   | pas de filtre associé (on ne cherche pas de tentatives d'échec) |
| **bantime**  | on va lui donner un temps de bannissement très long, 1 année    |
| **maxretry** |                                                                 |
{:.table .table-hover}

Note : En utilisant `logpath = /dev/null`, on indique à **Fail2ban** de ne lire aucun fichier pour cette prison, ce qui réduit la charge inutile.

On active la prison :

`sudo systemctl restart fail2ban`

On vérifie qu’elle est active :

`sudo fail2ban-client status manual-jail`

Vous devriez voir une sortie similaire à ceci, confirmant que la prison est active :

````text
Status for the jail: manual-jail
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     0
|  `- File list:        /dev/null
`- Actions
   |- Currently banned: 0
   |- Total banned:     0
   `- Banned IP list:
```

Une fois le service **Fail2ban** redémarré et la prison activée, on va pouvoir l’utiliser à tout moment pour bannir / dé-bannir une IP spécifique.

#### Bannissement manuel

`sudo fail2ban-client set manual-jail banip IP_À_BANNIR`

#### Dé-bannissement manuel

`sudo fail2ban-client set manual-jail unbanip IP_À_DÉBANNIR`

Avantages de cette méthode

- Séparation des tâches : cela vous permet de séparer clairement les bannissements automatiques (basés sur les logs) des bannissements que vous décidez d'appliquer vous-même.
- Politique de temps dédiée : vous pouvez donner à cette prison manuelle une durée de bannissement (`bantime`) très différente des autres (par exemple, 1 an ou même permanent si vous configurez les actions appropriées), sans affecter les autres prisons.