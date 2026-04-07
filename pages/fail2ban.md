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

[Fail2ban](https://github.com/fail2ban/fail2ban) est un logiciel de sécurité destiné à prévenir les attaques par force brute en bloquant temporairement les adresses IP suspectes. Il analyse les journaux des services pour détecter des schémas d’échecs d’authentification répétés et autres comportements suspects, pus utilise des règles **nftables** pour bannir temporairement ces adresses IP.

### Fonctionnalités principales de Fail2ban

1. **Surveillance des journaux** : fail2ban surveille les fichiers de journaux de divers services (SSH, FTP, HTTP, etc.) pour détecter des tentatives de connexion échouées répétées
2. **Bannissement temporaire** : lorsque fail2ban détecte un nombre prédéfini de tentatives échouées depuis une même IP, il bannit cette IP pour une période définie
3. **Flexibilité et extensibilité** : fail2ban est hautement configurable et peut être étendu pour surveiller presque n’importe quel service à travers des fichiers de configuration personnalisés et des filtres regex
4. **Actions de bannissement** : fail2ban peut utiliser différentes actions de bannissement, telles que la mise à jour des règles **nftables**, la modification des règles hosts.deny, ou l’envoi de notifications par email

## Installation de Fail2ban

#### Méthode N°1

Installation de **Fail2ban** et **nftables** via les paquets officiels :

`sudo apt install -y fail2ban nftables`

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

Par défaut, **Fail2ban** utilise les fichiers `/etc/fail2ban/jail.conf` et `/etc/fail2ban/jail.d/defaults-debian.conf` qui contient les réglages globaux et les définitions des prisons (*jails*). Ce fichier **ne doit jamais être modifié** car il serait écrasé lors d’une mise à jour de **Fail2ban**.

Par défaut, fail2ban utilise `nftables-multiport`.

On vérifie que le fichier existe :

`sudo cat /etc/fail2ban/action.d/nftables-multiport.conf`

La méthode standard consiste à créer un fichier de configuration local qui surchargera uniquement les paramètres qu’on souhaite modifier :

`sudo nano /etc/fail2ban/jail.local`

On va configurer le fichier `jail.local` et utiliser les paramètres par défaut les plus importants pour définir la politique de bannissement pour toutes les prisons qui seront activées :

```sh
[DEFAULT]
backend = systemd
banaction = nftables-multiport
bantime = 1h
findtime = 10m
maxretry = 3
# On peut remplacer 192.168.1.0/24 par la plage d’IP de votre réseau local, si applicable
ignoreip = 127.0.0.1/8 192.168.1.0/24 ::1

# bannissement progressif
bantime.increment = true
bantime.factor = 2
bantime.max = 1w
# IP autorisées

ignoreip = 127.0.0.1/8 192.168.1.0/24 ::1
```

| Paramètres    | Description                                                                                                                                               |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **bantime**   | durée du bannissement qui s’applique à une IP une fois qu’elle a atteint le seuil `maxretry`                                                              |
| **findtime**  | fenêtre de temps pendant laquelle **Fail2Ban** compte les tentatives de connexion échouées                                                                |
| **maxretry**  | nombre maximal d’échecs (tentatives) qu’une IP peut faire avant d’être bannie.                                                                            |
| **ignoreip**  | liste des adresses IP (IPv4 et IPv6) ignorées<br>plages IP ; exemples : `ignoreip = 127.0.0.1/8` ou `ignoreip = 192.168.1.0/24`                           |
| **action**    | action par défaut : utilise `nftables` (ou `iptables`) pour bannir l’IP                                                                                   |
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

```sh
[sshd]
enabled = true
port = ssh
filter = sshd
maxretry = 3
bantime = 48h
logpath = %(sshd_log)s
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

```sh
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
| **filter**   | pas de filtre associé (on ne cherche pas de tentatives d’échec) |
| **bantime**  | on va lui donner un temps de bannissement très long, 1 an       |
| **maxretry** |                                                                 |
{:.table .table-hover}

Note : en utilisant `logpath = /dev/null`, on indique à **Fail2ban** de ne lire aucun fichier pour cette prison, ce qui réduit la charge inutile.

On active la prison :

`sudo systemctl restart fail2ban`

On vérifie qu’elle est active :

`sudo fail2ban-client status manual-jail`

Vous devriez voir une sortie similaire à ceci, confirmant que la prison est active :

```text
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

### Exemple **Fail2ban** pour **nginx**

**Fail2ban** fournit déjà des prisons (*jails*) et filtres prêts à l’emploi pour **nginx**, notamment `nginx-http-auth`, `nginx-botsearch`, `nginx-bad-request`, `nginx-forbidden` et `nginx-limit-req`. La prison `nginx-http-auth` surveille par défaut le log d’erreurs **Nginx**, et `nginx-limit-req` suppose que le module `ngx_http_limit_req_module` est utilisé.

`sudo nano /etc/fail2ban/jail.local`

On y ajoute ;

```sh
[DEFAULT]
backend = systemd
banaction = nftables-multiport
bantime = 1h
findtime = 10m
maxretry = 5
bantime.increment = true
bantime.factor = 2
bantime.max = 1w
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = %(nginx_error_log)s
maxretry = 5

[nginx-botsearch]
enabled = true
port = http,https
logpath = %(nginx_error_log)s
maxretry = 10

[nginx-bad-request]
enabled = true
port = http,https
logpath = %(nginx_error_log)s
maxretry = 10

[nginx-forbidden]
enabled = true
port = http,https
logpath = %(nginx_error_log)s
maxretry = 10
```

### Récidive

La **prision recidive** sert à re-bannir plus longtemps les IP qui reviennent régulièrement.

```sh
[recidive]
enabled = true
logpath = /var/log/fail2ban.log
banaction = nftables-multiport
bantime = 1w
findtime = 1d
maxretry = 5
```

### Installation automatique

Un script qui installe automatiquement `nftables`, `fail2ban`, `curl`, active les services, crée une base `nftables`.
Il crée une config Fail2ban avec `sshd`, `nginx-http-auth`, `nginx-botsearch`, `apache-auth`, `recidive` :

```sh
#!/usr/bin/env bash
set -euo pipefail

echo "1/7 Installation des paquets..."
apt update
apt install -y nftables fail2ban curl

echo "2/7 Activation des services..."
systemctl enable nftables
systemctl enable fail2ban

echo "3/7 Sauvegarde des configs existantes...
[ -f /etc/nftables.conf ] && cp /etc/nftables.conf /etc/nftables.conf.bak.$(date +%F-%H%M%S)
[ -f /etc/fail2ban/jail.local ] && cp /etc/fail2ban/jail.local /etc/fail2ban/jail.local.bak.$(date +%F-%H%M%S)

echo "4/7 Écriture de /etc/nftables.conf ..."
cat > /etc/nftables.conf <<'EOF'
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0;
        policy drop;

        iif lo accept
        ct state established,related accept

        # Ping
        ip protocol icmp accept
        ip6 nexthdr icmpv6 accept

        # SSH
        tcp dport 22 accept

        # Web
        tcp dport { 80, 443 } accept
    }

    chain forward {
        type filter hook forward priority 0;
        policy drop;
    }

    chain output {
        type filter hook output priority 0;
        policy accept;
    }
}
EOF

echo "5/7 Écriture de /etc/fail2ban/jail.local ..."
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
backend = systemd
banaction = nftables-multiport

bantime = 1h
findtime = 10m
maxretry = 5

bantime.increment = true
bantime.factor = 2
bantime.max = 1w

ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = %(nginx_error_log)s
maxretry = 5

[nginx-botsearch]
enabled = true
port = http,https
logpath = %(nginx_error_log)s
maxretry = 10

[apache-auth]
enabled = true
port = http,https
logpath = /var/log/apache2/error.log
maxretry = 5

[recidive]
enabled = true
logpath = /var/log/fail2ban.log
banaction = nftables-multiport
bantime = 1w
findtime = 1d
maxretry = 5
EOF

echo "6/7 Application des règles..."
nft -f /etc/nftables.conf
systemctl restart nftables
systemctl restart fail2ban

echo "7/7 Vérifications..."
echo
echo "=== nftables ==="
nft list ruleset || true
echo
echo "=== fail2ban ==="
fail2ban-client status || true
echo
echo "Installation terminée."
```

### Commandes **nftables** et **fail2ban**

`nft` est l’outil officiel pour inspecter et administrer [nftables](https://manpages.debian.org/trixie/nftables/nft.8.en.html).
La commande `fail2ban-client` est l’outil officiel pour piloter le service, et `fail2ban-regex` permet de tester les filtres sur des logs avant mise en production.

```sh
sudo nft list ruleset
```

##### Afficher les jails actives

`sudo fail2ban-client status`

##### Afficher une jail précise

`sudo fail2ban-client status nginx-http-auth`

##### Tester un filtre

`sudo fail2ban-regex /var/log/nginx/error.log /etc/fail2ban/filter.d/nginx-http-auth.conf`

##### Bannir une IP

`sudo fail2ban-client set sshd banip 195.24.12.52`

##### Débannir une IP

`sudo fail2ban-client set sshd unbanip 195.2`.12.52

Avantages de cette méthode

- Séparation des tâches : cela vous permet de séparer clairement les bannissements automatiques (basés sur les logs) des bannissements que vous décidez d’appliquer vous-même.
- Politique de temps dédiée : vous pouvez donner à cette prison manuelle une durée de bannissement (`bantime`) très différente des autres (par exemple, 1 an ou même permanent si vous configurez les actions appropriées), sans affecter les autres prisons.

##### Afficher toutes les options disponibles

`fail2ban-client -h`

##### Status du service

`sudo fail2ban-client status`

##### Status de la prison **sshd**

`sudo fail2ban-client status sshd`

##### Vérifier les IP bannies

`sudo fail2ban-client status`

##### Vérifier les IP bannies pour **ssh**

`sudo fail2ban-client status sshd`

##### Afficher les logs

`sudo journalctl -u fail2ban`

##### Tester regex (très utile)

`fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf`

##### Protection brute force directement dans nftables

`tcp dport 22 ct state new limit rate 10/minute accept`