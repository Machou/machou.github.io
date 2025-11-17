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

[PortSentry](https://github.com/Perdjesk/portsentry) est un outil de détection et de réponse aux scans de port conçu pour améliorer la sécurité des systèmes en surveillant les connexions réseau suspectes. Il peut identifier les tentatives de scan de port sur un système et réagir en bloquant les adresses IP des attaquants, empêchant ainsi les intrusions potentielles.

### Fonctionnalités principales de PortSentry

1. **Détection de scans de port** : PortSentry surveille les tentatives de connexion sur les ports ouverts ou fermés pour détecter les scans de port effectués par des attaquants
2. **Réponse active** : lorsqu’un scan de port est détecté, PortSentry peut réagir en bloquant l’adresse IP de l’attaquant en temps réel, souvent en ajoutant des règles de pare-feu ou en modifiant les fichiers de configuration réseau
3. **Modes de fonctionnement** : il peut fonctionner en plusieurs modes, notamment le mode "stealth" où il simule des ports ouverts pour attirer et détecter les scanners, et le mode "advanced" où il surveille des ports spécifiques
4. **Flexibilité et configuration** : il est hautement configurable, permettant aux administrateurs de définir les ports à surveiller, les actions à entreprendre en cas de détection de scan, et les niveaux de sensibilité

### Services et options

#### Surveillance des ports

- **Surveillance des ports ouverts** : PortSentry peut surveiller les ports ouverts légitimes pour détecter les tentatives de connexion suspectes
- **Surveillance des ports fermés** : il peut également surveiller les ports fermés pour détecter les scans de port, attirant les attaquants vers des ports qui ne devraient pas être accessibles

#### Actions de réponse

- **Blocage d’IP** : en réponse à un scan de port, PortSentry peut bloquer automatiquement l’adresse IP de l’attaquant en ajoutant des règles de pare-feu (comme iptables) ou en modifiant les fichiers de configuration des hôtes
- **Notifications** : il peut envoyer des notifications aux administrateurs en cas de détection d’activités suspectes, permettant une réponse rapide aux incidents

#### Modes de fonctionnement

- **Mode "attracteur" (Honey Pot)** : simule des ports ouverts pour attirer les attaquants et détecter les scans
- **Mode "détection avancée"** : surveille une liste spécifiée de ports pour des tentatives de connexion suspectes
- **Mode "stealth"** : fonctionne de manière discrète pour éviter d’être détecté par les scanners

#### Configuration

- **Sensibilité** : Les administrateurs peuvent configurer le niveau de sensibilité de PortSentry pour définir combien de tentatives de connexion sont nécessaires avant qu’une IP soit bloquée
- **Personnalisation des ports** : il est possible de spécifier quels ports doivent être surveillés en fonction des besoins spécifiques de sécurité
- **Options de journalisation** : il peut être configuré pour enregistrer les tentatives de connexion suspectes dans des fichiers de journal pour une analyse ultérieure

PortSentry est un outil essentiel pour renforcer la sécurité des systèmes en détectant et en réagissant aux scans de port, réduisant ainsi le risque d’intrusion par des attaquants potentiels.

## Installation de PortSentry

On installe PortSentry :

`sudo apt install portsentry`

## Configuration de PortSentry

On démarre le service :

`systemctl start portsentry`

On active le démarrage automatique :

`systemctl enable portsentry`

On vérifie que le service fonctionne :

`systemctl status portsentry`

On ajoute l’IP de notre serveur pour éviter de se faire bannir :

`sudo nano /etc/portsentry/portsentry.ignore.static`

à la fin du fichier, on y ajoute notre IP.

Ensuite, on active le mode de détection avancé ; PortSentry propose deux modes : simple et avancé. Le mode avancé est recommandé, car il ne « ferme » pas un port en apparence seulement ; il surveille directement les paquets entrants.

Dans `/etc/default/portsentry`, activez le mode avancé :

```sh
TCP_MODE="atcp"
UDP_MODE="audp"
```

Puis on configure les actions à effectuer lors d’une détection

Dans `/etc/portsentry/portsentry.conf`, adaptez les directives importantes.

Activation du blocage par iptables :

```sh
BLOCK_UDP="1"
BLOCK_TCP="1"
KILL_ROUTE="/sbin/iptables -I INPUT -s $TARGET$ -j DROP"
```

On évite de ce faire bannir, on ajoute / modifie la ligne :

`IGNORE_FILE="/etc/portsentry/portsentry.ignore"`

On modifie le fichier **portsentry.ignore** :

```sh
127.0.0.1
192.168.0.0/16
10.0.0.0/8
mon-ip
ip-du-serveur
```

On active l’écriture des fichiers journaux :

`SYSLOG_FACILITY="auth"`

On peut demander à **PortSentry** d’éviter de bloquer certaines IP sensibles (serveur DNS, passerelle, etc.) en les ajoutant dans :

`/etc/portsentry/portsentry.ignore.static`

On active le blocage permanent :

```sh
HISTORY_FILE="/var/lib/portsentry/portsentry.history"
BLOCK_FILE="/var/lib/portsentry/portsentry.blocked"
```

Une fois la configuration terminée, on redémarre **PortSentry** :

```sh
sudo systemctl restart portsentry
sudo systemctl enable portsentry
```

On vérifie qu'il fonctionne :

`sudo systemctl status portsentry`

Pour observer ce que PortSentry bloque :

`sudo iptables -L -n`

Pour surveiller les alertes dans les logs du système :

`sudo journalctl -u portsentry`

ou, selon le mode d’écriture :

`sudo tail -f /var/log/auth.log`
