# TP3 : On va router des trucs

Au menu de ce TP, on va revoir un peu ARP et IP histoire de **se mettre en jambes dans un environnement avec des VMs**.

Puis on mettra en place **un routage simple, pour permettre à deux LANs de communiquer**.

![Reboot the router](./pics/reboot.jpeg)

## Sommaire

- [TP3 : On va router des trucs](#tp3--on-va-router-des-trucs)
  - [Sommaire](#sommaire)
  - [0. Prérequis](#0-prérequis)
  - [I. ARP](#i-arp)
    - [1. Echange ARP](#1-echange-arp)
    - [2. Analyse de trames](#2-analyse-de-trames)
  - [II. Routage](#ii-routage)
    - [1. Mise en place du routage](#1-mise-en-place-du-routage)
    - [2. Analyse de trames](#2-analyse-de-trames-1)
    - [3. Accès internet](#3-accès-internet)
  - [III. DHCP](#iii-dhcp)
    - [1. Mise en place du serveur DHCP](#1-mise-en-place-du-serveur-dhcp)
    - [2. Analyse de trames](#2-analyse-de-trames-2)

## 0. Prérequis

➜ Pour ce TP, on va se servir de VMs Rocky Linux. 1Go RAM c'est large large. Vous pouvez redescendre la mémoire vidéo aussi.  

➜ Vous aurez besoin de deux réseaux host-only dans VirtualBox :

- un premier réseau `10.3.1.0/24`
- le second `10.3.2.0/24`
- **vous devrez désactiver le DHCP de votre hyperviseur (VirtualBox) et définir les IPs de vos VMs de façon statique**

➜ Quelques paquets seront souvent nécessaires dans les TPs, il peut être bon de les installer dans la VM que vous clonez :

- de quoi avoir les commandes :
  - `dig`
  - `tcpdump`
  - `nmap`
  - `nc`
  - `python3`
  - `vim` peut être une bonne idée

➜ Les firewalls de vos VMs doivent **toujours** être actifs (et donc correctement configurés).

➜ **Si vous voyez le p'tit pote 🦈 c'est qu'il y a un PCAP à produire et à mettre dans votre dépôt git de rendu.**

## I. ARP

Première partie simple, on va avoir besoin de 2 VMs.

| Machine  | `10.3.1.0/24` |
|----------|---------------|
| `john`   | `10.3.1.11`   |
| `marcel` | `10.3.1.12`   |

```schema
   john               marcel
  ┌─────┐             ┌─────┐
  │     │    ┌───┐    │     │
  │     ├────┤ho1├────┤     │
  └─────┘    └───┘    └─────┘
```

> Référez-vous au [mémo Réseau Rocky](../memo/rocky_network.md) pour connaître les commandes nécessaire à la réalisation de cette partie.

### 1. Echange ARP

🌞**Générer des requêtes ARP**

- effectuer un `ping` d'une machine à l'autre
- observer les tables ARP des deux machines
- repérer l'adresse MAC de `john` dans la table ARP de `marcel` et vice-versa
- prouvez que l'info est correcte (que l'adresse MAC que vous voyez dans la table est bien celle de la machine correspondante)
  - une commande pour voir la MAC de `marcel` dans la table ARP de `john`
  - et une commande pour afficher la MAC de `marcel`, depuis `marcel`


ping :
```bash
john:
[user@localhost ~]$ ping 10.3.1.12
PING 10.3.1.12 (10.3.1.12) 56(84) bytes of data.
64 bytes from 10.3.1.12: icmp_seq=1 ttl=64 time=1.15 ms
64 bytes from 10.3.1.12: icmp_seq=2 ttl=64 time=1.09 ms

marcel:
[user@localhost ~]$ ping 10.3.1.11
PING 10.3.1.11 (10.3.1.11) 56(84) bytes of data.
64 bytes from 10.3.1.11: icmp_seq=1 ttl=64 time=1.52 ms
64 bytes from 10.3.1.11: icmp_seq=2 ttl=64 time=0.520 ms
```

table ARP :
```bash
john:
[user@localhost ~]$ ip neigh show
10.3.1.12 dev enp0s3 lladdr 08:00:27:be:b7:0e STALE
10.3.1.1 dev enp0s3 lladdr 0a:00:27:00:00:06 DELAY

marcel:
[user@localhost ~]$ ip neigh show
10.3.1.1 dev enp0s3 lladdr 0a:00:27:00:00:06 DELAY
10.3.1.11 dev enp0s3 lladdr 08:00:27:34:26:7e STALE
```

Adresse MAC de John : 08:00:27:34:26:7e
Adresse MAC de Marcel : 0a:00:27:00:00:06

Preuve :
```
john:
[user@localhost ~]$ ip neigh show
10.3.1.12 dev enp0s3 lladdr **08:00:27:be:b7:0e** STALE
10.3.1.1 dev enp0s3 lladdr 0a:00:27:00:00:06 DELAY

marcel:
[user@localhost ~]$ nmcli device show
GENERAL.DEVICE:                         enp0s3
GENERAL.TYPE:                           ethernet
GENERAL.HWADDR:                         **08:00:27:BE:B7:0E**
```

### 2. Analyse de trames

🌞**Analyse de trames**

- utilisez la commande `tcpdump` pour réaliser une capture de trame
- videz vos tables ARP, sur les deux machines, puis effectuez un `ping`

```
john:
[user@localhost ~]$ sudo ip -s -s neigh flush all
10.3.1.1 dev enp0s3 lladdr 0a:00:27:00:00:07 ref 1 used 11/0/11 probes 1 REACHABLE

*** Round 1, deleting 1 entries ***
10.3.1.1 dev enp0s3  ref 1 used 0/60/0 probes 4 INCOMPLETE

*** Round 2, deleting 1 entries ***
10.3.1.1 dev enp0s3  ref 1 used 0/0/0 probes 4 INCOMPLETE

*** Round 3, deleting 1 entries ***
*** Flush is complete after 3 rounds ***

[user@localhost ~]$ sudo tcpdump -i enp0s8 -c 10 -w ping.pcapng not port 22

marcel:
[user@localhost ~]$ ping 10.3.1.11
```

🦈 **Capture réseau [`ping.pcapng`](./data/ping.pcapng)** qui contient un ARP request et un ARP reply

> **Si vous ne savez pas comment récupérer votre fichier `.pcapng`** sur votre hôte afin de l'ouvrir dans Wireshark, et me le livrer en rendu, demandez-moi.

## II. Routage

Vous aurez besoin de 3 VMs pour cette partie. **Réutilisez les deux VMs précédentes.**

| Machine  | `10.3.1.0/24` | `10.3.2.0/24` |
|----------|---------------|---------------|
| `router` | `10.3.1.254`  | `10.3.2.254`  |
| `john`   | `10.3.1.11`   | no            |
| `marcel` | no            | `10.3.2.12`   |

> Je les appelés `marcel` et `john` PASKON EN A MAR des noms nuls en réseau 🌻

```schema
   john                router              marcel
  ┌─────┐             ┌─────┐             ┌─────┐
  │     │    ┌───┐    │     │    ┌───┐    │     │
  │     ├────┤ho1├────┤     ├────┤ho2├────┤     │
  └─────┘    └───┘    └─────┘    └───┘    └─────┘
```

### 1. Mise en place du routage

🌞**Activer le routage sur le noeud `router`**

> Cette étape est nécessaire car Rocky Linux c'est pas un OS dédié au routage par défaut. Ce n'est bien évidemment une opération qui n'est pas nécessaire sur un équipement routeur dédié comme du matériel Cisco.

```bash
router:
[user@localhost ~]$ sudo firewall-cmd --add-masquerade --zone=public --permanent
success
```

🌞**Ajouter les routes statiques nécessaires pour que `john` et `marcel` puissent se `ping`**

- il faut ajouter une seule route des deux côtés
- une fois les routes en place, vérifiez avec un `ping` que les deux machines peuvent se joindre

```bash
john:
[user@localhost ~]$ sudo ip route add 10.3.2.0/24 via 10.3.1.254 dev enp0s3

marcel:
[user@localhost ~]$ sudo ip route add 10.3.1.0/24 via 10.3.2.254 dev enp0s3
```

preuves (marcel POV):
```bash
[user@localhost ~]$ ping 10.3.1.11
ping: connect: Network is unreachable
[user@localhost ~]$ sudo ip route add 10.3.1.0/24 via 10.3.2.254 dev enp0s3
[user@localhost ~]$ ping 10.3.1.11
PING 10.3.1.11 (10.3.1.11) 56(84) bytes of data.
64 bytes from 10.3.1.11: icmp_seq=1 ttl=63 time=2.18 ms
64 bytes from 10.3.1.11: icmp_seq=2 ttl=63 time=2.10 ms
```

![THE SIZE](./pics/thesize.png)

### 2. Analyse de trames

🌞**Analyse des échanges ARP**

- videz les tables ARP des trois noeuds
- effectuez un `ping` de `john` vers `marcel`
- regardez les tables ARP des trois noeuds
- essayez de déduire un peu les échanges ARP qui ont eu lieu
- répétez l'opération précédente (vider les tables, puis `ping`), en lançant `tcpdump` sur `marcel`
- **écrivez, dans l'ordre, les échanges ARP qui ont eu lieu, puis le ping et le pong, je veux TOUTES les trames** utiles pour l'échange

Par exemple (copiez-collez ce tableau ce sera le plus simple) :

| ordre | type trame  | IP source | MAC source              | IP destination | MAC destination            |
|-------|-------------|-----------|-------------------------|----------------|----------------------------|
| 1     | Requête ARP | x         | `john` `AA:BB`          | x              | Broadcast `FF:FF`          |
| 2     | Réponse ARP | x         | `router` `EE:HH`        | x              | `john` `AA:BB`             |
| 3     | Requête ARP | x         | `router` `EE:HH`        | x              | Broadcast `GG:GG`          |
| 4     | Réponse ARP | x         | `marcel` `CC:DD`        | x              | `router` `EE:HH`           |
| 5     | Ping        | `10.3.1.11` `john` | x                       | `10.3.2.12` `marcel`      | x                          |
| 6     | Ping        | `10.3.2.254 ` `router` | x                       | `10.3.2.12` `marcel`      | x                          |
| 7     | Pong        | `10.3.2.12` `marcel` | x                       | `10.3.2.254` `router`      | x                          |
| 8     | Pong        | `10.3.2.12` `marcel (enfait le router)` | x                       | `10.3.1.11` `john`      | x                          |

> Vous pourriez, par curiosité, lancer la capture sur `john` aussi, pour voir l'échange qu'il a effectué de son côté.

🦈 **Capture réseau [`tp2_routage_marcel.pcapng`](./data/ping_router_marcel.pcapng)**

### 3. Accès internet

🌞**Donnez un accès internet à vos machines**

- ajoutez une carte NAT en 3ème inteface sur le `router` pour qu'il ait un accès internet
- ajoutez une route par défaut à `john` et `marcel`
  - vérifiez que vous avez accès internet avec un `ping`
  - le `ping` doit être vers une IP, PAS un nom de domaine
- donnez leur aussi l'adresse d'un serveur DNS qu'ils peuvent utiliser
  - vérifiez que vous avez une résolution de noms qui fonctionne avec `dig`
  - puis avec un `ping` vers un nom de domaine

route par défaut:
```bash
john:
[user@localhost ~]$ sudo ip route add default via 10.3.1.254 dev enp0s3
[user@localhost ~]$ ping 1.1.1.1
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=55 time=17.4 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=55 time=106 ms

marcel:
[user@localhost ~]$ sudo ip route add default via 10.3.2.254 dev enp0s3
[user@localhost ~]$ ping 1.1.1.1
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=55 time=15.0 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=55 time=19.1 ms
```

serveur DNS:
```bash
john & marcel:
[user@localhost ~]$ cat /etc/resolv.conf
nameserver 1.1.1.1
nameserver 8.8.8.8
[user@localhost ~]$ dig google.com

; <<>> DiG 9.16.23-RH <<>> google.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 40611
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;google.com.                    IN      A

;; ANSWER SECTION:
google.com.             77      IN      A       216.58.214.174

;; Query time: 19 msec
;; SERVER: 1.1.1.1#53(1.1.1.1)
;; WHEN: Tue Oct 11 20:15:16 CEST 2022
;; MSG SIZE  rcvd: 55

[user@localhost ~]$ ping google.com
PING google.com (216.58.214.78) 56(84) bytes of data.
64 bytes from fra15s10-in-f78.1e100.net (216.58.214.78): icmp_seq=1 ttl=118 time=12.8 ms
64 bytes from fra15s10-in-f78.1e100.net (216.58.214.78): icmp_seq=2 ttl=118 time=25.0 ms
^C
--- google.com ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 12.846/18.946/25.047/6.100 ms
```

🌞**Analyse de trames**

- effectuez un `ping 8.8.8.8` depuis `john`
- capturez le ping depuis `john` avec `tcpdump`
- analysez un ping aller et le retour qui correspond et mettez dans un tableau :

| ordre | type trame | IP source          | MAC source              | IP destination | MAC destination |
|-------|------------|--------------------|-------------------------|----------------|-----------------|
| 1     | ping       | `john` `10.3.1.11` | `john` `AA:BB:CC:DD:EE` | `8.8.8.8`      | `router`         | 
| 2     | pong       | `8.8.8.8`          |  `router`               | `john` `10.3.1.11` | `john` `AA:BB:CC:DD:EE`  |

🦈 **Capture réseau [`tp2_routage_internet.pcapng`](./data/ping_router_8888.pcapng)**

## III. DHCP

On reprend la config précédente, et on ajoutera à la fin de cette partie une 4ème machine pour effectuer des tests.

| Machine  | `10.3.1.0/24`              | `10.3.2.0/24` |
|----------|----------------------------|---------------|
| `router` | `10.3.1.254`               | `10.3.2.254`  |
| `john`   | `10.3.1.11`                | no            |
| `bob`    | oui mais pas d'IP statique | no            |
| `marcel` | no                         | `10.3.2.12`   |

```schema
   john               router              marcel
  ┌─────┐             ┌─────┐             ┌─────┐
  │     │    ┌───┐    │     │    ┌───┐    │     │
  │     ├────┤ho1├────┤     ├────┤ho2├────┤     │
  └─────┘    └─┬─┘    └─────┘    └───┘    └─────┘
   john        │
  ┌─────┐      │
  │     │      │
  │     ├──────┘
  └─────┘
```

### 1. Mise en place du serveur DHCP

🌞**Sur la machine `john`, vous installerez et configurerez un serveur DHCP** (go Google "rocky linux dhcp server").

- installation du serveur sur `john`
- créer une machine `bob`
- faites lui récupérer une IP en DHCP à l'aide de votre serveur

> Il est possible d'utilise la commande `dhclient` pour forcer à la main, depuis la ligne de commande, la demande d'une IP en DHCP, ou renouveler complètement l'échange DHCP (voir `dhclient -h` puis call me et/ou Google si besoin d'aide).

creation serveur:
```bash
[user@localhost ~]$ sudo cat /etc/dhcp/dhcpd.conf
#
# DHCP Server Configuration file.
#   see /usr/share/doc/dhcp-server/dhcpd.conf.example
#   see dhcpd.conf(5) man page
#
default-lease-time 900;
max-lease-time 10800;
ddns-update-style none;
authoritative;
subnet 10.3.1.0 netmask 255.255.255.0 {
  range 10.3.1.13 10.3.1.200;
  option routers 10.3.1.254;
  option subnet-mask 255.255.255.0;
  option domain-name-servers 8.8.8.8;
}
[user@localhost ~]$ sudo firewall-cmd --permanent --add-port=67/udp
success
[user@localhost ~]$ sudo systemctl enable --now dhcpd
Created symlink /etc/systemd/system/multi-user.target.wants/dhcpd.service → /usr/lib/systemd/system/dhcpd.service.
```

changer d'ip (bob POV):
```bash
[user@localhost ~]$ sudo dhclient -v -r enp0s3
[sudo] password for user:
Removed stale PID file
Internet Systems Consortium DHCP Client 4.4.2b1
Copyright 2004-2019 Internet Systems Consortium.
All rights reserved.
For info, please visit https://www.isc.org/software/dhcp/

Listening on LPF/enp0s3/08:00:27:9f:37:63
Sending on   LPF/enp0s3/08:00:27:9f:37:63
Sending on   Socket/fallback
DHCPRELEASE of 10.3.1.15 on enp0s3 to 10.3.1.11 port 67 (xid=0x9d2f0921)
```

🌞**Améliorer la configuration du DHCP**

- ajoutez de la configuration à votre DHCP pour qu'il donne aux clients, en plus de leur IP :
  - une route par défaut
  - un serveur DNS à utiliser
- récupérez de nouveau une IP en DHCP sur `marcel` pour tester :
  - `marcel` doit avoir une IP
    - vérifier avec une commande qu'il a récupéré son IP
    - vérifier qu'il peut `ping` sa passerelle
  - il doit avoir une route par défaut
    - vérifier la présence de la route avec une commande
    - vérifier que la route fonctionne avec un `ping` vers une IP
  - il doit connaître l'adresse d'un serveur DNS pour avoir de la résolution de noms
    - vérifier avec la commande `dig` que ça fonctionne
    - vérifier un `ping` vers un nom de domaine

### 2. Analyse de trames

🌞**Analyse de trames**

- lancer une capture à l'aide de `tcpdump` afin de capturer un échange DHCP
- demander une nouvelle IP afin de générer un échange DHCP
- exportez le fichier `.pcapng`

🦈 **Capture réseau `tp2_dhcp.pcapng`**