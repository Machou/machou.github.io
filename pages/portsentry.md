---
layout: defaut
title: "Comment utiliser PortSentry sur Debian"
description: "Comment installer et configurer PortSentry sur Debian"
permalink: /comment-utiliser-portsentry
slug: comment-utiliser-portsentry
canonical_url: https://machou.github.io/comment-utiliser-portsentry
favicon: /assets/img/favicon.png
---

<nav aria-label="breadcrumb">
	<ol class="breadcrumb">
		<li class="breadcrumb-item"><a href="https://machou.github.io/">Accueil</a></li>
		<li class="breadcrumb-item"><a href="comment-creer-hidden-service">Créer un Hidden Service</a></li>
		<li class="breadcrumb-item active" aria-current="page">PortSentry</li>
	</ol>
</nav>

# [PortSentry](comment-utiliser-portsentry)

- [Qu’est-ce que PortSentry ?](#quest-ce-que-portsentry-)
- [Installation de PortSentry](#installation-de-portsentry)
- [Configuration de PortSentry](#configuration-de-portsentry)

## Qu’est-ce que PortSentry ?

[PortSentry](https://github.com/portsentry/portsentry) est un outil de détection et de réponse aux scans de port conçu pour améliorer la sécurité des systèmes en surveillant les connexions réseau suspectes. Il peut identifier les tentatives de scan de port sur un système et réagir en bloquant les adresses IP des attaquants, empêchant ainsi les intrusions potentielles.

### Fonctionnalités principales de PortSentry

1. **Détection de scans de port** : **PortSentry** surveille les tentatives de connexion sur les ports ouverts ou fermés pour détecter les scans de port effectués par des attaquants
2. **Réponse active** : lorsqu’un scan de port est détecté, **PortSentry** peut réagir en bloquant l’adresse IP de l’attaquant en temps réel, souvent en ajoutant des règles de pare-feu ou en modifiant les fichiers de configuration réseau
3. **Modes de fonctionnement** : il peut fonctionner en plusieurs modes, notamment le mode "stealth" où il simule des ports ouverts pour attirer et détecter les scanners, et le mode "advanced" où il surveille des ports spécifiques
4. **Flexibilité et configuration** : il est hautement configurable, permettant aux administrateurs de définir les ports à surveiller, les actions à entreprendre en cas de détection de scan, et les niveaux de sensibilité

### Services et options

#### Surveillance des ports

- **Surveillance des ports ouverts** : **PortSentry** peut surveiller les ports ouverts légitimes pour détecter les tentatives de connexion suspectes
- **Surveillance des ports fermés** : il peut également surveiller les ports fermés pour détecter les scans de port, attirant les attaquants vers des ports qui ne devraient pas être accessibles

#### Actions de réponse

- **Blocage d’IP** : en réponse à un scan de port, **PortSentry** peut bloquer automatiquement l’adresse IP de l’attaquant en ajoutant des règles de pare-feu (comme iptables) ou en modifiant les fichiers de configuration des hôtes
- **Notifications** : il peut envoyer des notifications aux administrateurs en cas de détection d’activités suspectes, permettant une réponse rapide aux incidents

#### Modes de fonctionnement

- **Mode « attracteur » (Honey Pot)** : simule des ports ouverts pour attirer les attaquants et détecter les scans
- **Mode « détection avancée »** : surveille une liste spécifiée de ports pour des tentatives de connexion suspectes
- **Mode « stealth »** : fonctionne de manière discrète pour éviter d’être détecté par les scanners

#### Configuration

- **Sensibilité** : Les administrateurs peuvent configurer le niveau de sensibilité de **PortSentry** pour définir combien de tentatives de connexion sont nécessaires avant qu’une IP soit bloquée
- **Personnalisation des ports** : il est possible de spécifier quels ports doivent être surveillés en fonction des besoins spécifiques de sécurité
- **Options de journalisation** : il peut être configuré pour enregistrer les tentatives de connexion suspectes dans des fichiers de journal pour une analyse ultérieure

**PortSentry** est un outil robuste mais ancien. Son approche est efficace contre les scans agressifs, mais moins adaptée à des attaques modernes plus subtiles. Il reste cependant pertinent pour renforcer une défense en profondeur, en complément d’un pare-feu configuré avec soin et d’un système de supervision.

## Installation et configuration de PortSentry

On installe **PortSentry** :

`sudo apt install portsentry`

On ajoute notre IP en liste blanche : (pour ne pas te bannir sois-même par accident)

`sudo nano /etc/portsentry/portsentry.ignore`

On s’assure que `127.0.0.1/32` est présent.

On rajoute notre adresse IP publique (et celle du VPN si on en utilise un).

Le fichier **portsentry.ignore** doit ressembler à :

```text
127.0.0.1/32
MON_IP
```

On active le blocage :

`sudo nano /etc/portsentry/portsentry.conf`

On change :

```sh
BLOCK_UDP="0"
BLOCK_TCP="0"
```

en

```sh
BLOCK_UDP="1"
BLOCK_TCP="1"
```

**PortSentry** peut bloquer de plusieurs façons (`hosts.deny`, `route`, `iptables`). La méthode la plus propre sur un Linux moderne est d’utiliser [iptables](https://www.netfilter.org/projects/iptables/).

Dans la section `DROPPING ROUTES`, on dé-commente ou rajoute cette ligne :

`KILL_ROUTE="/sbin/iptables -I INPUT -s $TARGET$ -j DROP"`

> Note : dans **Debian 13**, `/sbin/iptables` interagit avec le backend [nftables](https://www.netfilter.org/projects/nftables/index.html), ce qui est parfait.

Dans la section `Scan trigger value`, on dé-commente ou rajoute cette ligne :

`SCAN_TRIGGER="0"`

> Cela signifie qu’une seule touche sur un port piège suffit à bannir l’IP. Pour plus de tolérance, on peut changer à **1** ou **2**

Par défaut, **PortSentry** utilise le mode « Classic » qui écoute sur des ports spécifiques. Le mode « Advanced » (*Stealth*) est bien meilleur : il surveille tous les ports en dessous d’une certaine limite (sauf ceux déjà utilisés par tes services comme SSH ou Apache).

On modifie le fichier de démarrage par défaut :

`sudo nano /etc/default/portsentry`

On change :

```sh
TCP_MODE="atcp"
UDP_MODE="audp"
```

en

```sh
TCP_MODE="atcp"
UDP_MODE="audp"
```

On active **PortSentry** au démarrage du serveur :

`sudo systemctl enable portsentry`

On démarre / redémarre le service :

`sudo systemctl restart portsentry`

---

## Dépannage

Lors du lancement de **PortSentry** cette erreur peu apparaitre :

````sh
sudo systemctl start portsentry
Failed to start portsentry.service: Unit portsentry.service is masked.
```

Sur les systèmes basés sur `systemd` (comme **Debian 13**) pour certains outils sensibles comme **PortSentry**, le service est volontairement désactivé pour éviter qu’il ne se lance accidentellement sans être configuré.

On vérifie l’état du service :

`systemctl status portsentry.service`

Un message de ce type devrai s’afficher :

```text
○ portsentry.service
     Loaded: masked (Reason: Unit portsentry.service is masked.)
     Active: inactive (dead)
```

On doit *démasquer*, puis *le **réactiver* le service :

```sh
sudo systemctl unmask portsentry.service
sudo systemctl enable portsentry.service
sudo systemctl start portsentry.service
```

Si ça ne fonctionne pas, on vérifie que **PortSentry** est bien installé :

`dpkg -l | grep portsentry`

Doit renvoyer :

`ii  portsentry                        1.2-16                               amd64        Portscan detection daemon`

Sur certaines versions de Debian, **PortSentry** ne fournit pas de service systemd par défaut car il tournait via `init.d`.

On vérifie que le script exsite :

`ls -l /etc/init.d/portsentry`

Doit renvoyer :

`-rwxr-xr-x 1 root root 2116 15 oct.   2024 /etc/init.d/portsentry*`

On peut l’activer via ce script :

```sh
sudo update-rc.d portsentry defaults
sudo service portsentry start
```






On démasque le service :

`sudo systemctl unmask portsentry`

Si le service `portsentry` reste toujours masquer, on teste si le lien existe :

`ls -l /etc/systemd/system/portsentry.service`

Si cette commande affiche une ligne se terminant par -> `/dev/null`, c’est que le service est toujours masqué.
Si le fichier n’existe pas, c’est qu’il a été démasqué mais que `systemd` n’a pas mis à jour son statut.

On force le démasquage (si le lien existe). Si la commande `systemctl unmask` ne fonctionne pas, on peut tenter de supprimer le lien manuellement (c’est ce que fait unmask en coulisse) :

`sudo rm /etc/systemd/system/portsentry.service`

*Attention : faire ceci uniquement si la commande `ls -l` a confirmé l’existence du lien symbolique.*

On recharge la configuration `systemd` :

*Pour s’assurer que systemd prend en compte la nouvelle configuration du service démasqué.*

`sudo systemctl daemon-reload`

Pour vérifier que tout fonctionne : (on regarde les logs : **PortSentry** note son démarrage dans syslog)

`grep "portsentry" /var/log/syslog`

On peut aussi vérifier l’écout du port :

```sh
sudo netstat -taupen | grep portsentry
# Ou avec ss
sudo ss -lptn | grep portsentry
```

> Note : En mode « Advanced », il est possible que tu ne voies pas les ports ouverts de manière classique avec netstat car il utilise des raw sockets, mais le processus doit être là.