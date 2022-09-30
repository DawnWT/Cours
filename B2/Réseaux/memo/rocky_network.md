# Mémo réseau Rocky

Vous trouverez ici quelques mini-procédures pour réaliser certaines opérations récurrentes. Ce sera évidemment principalement utilisé pour notre cours de réseau, mais peut-être serez-vous amenés à le réutiliser plus tard.  

**Ces mini-procédures sont écrites pour un système Rocky Linux**. Elles ne sont pas forcément applicables à d'autres distributions. C'est toujours le même concept, peu importe l'OS, mais parfois des façons différentes de faire.

La plupart des éléments sont directement transposables à d'autres OS de la famille RedHat (CentOS, Fedora, entre autres).

# Sommaire

<!-- vim-markdown-toc GitLab -->

- [Mémo réseau Rocky](#mémo-réseau-rocky)
- [Sommaire](#sommaire)
- [Définir une IP statique](#définir-une-ip-statique)
- [Définir une IP dynamique (DHCP)](#définir-une-ip-dynamique-dhcp)
- [Supprimer manuellement une IP d'une carte](#supprimer-manuellement-une-ip-dune-carte)
- [Afficher la table de routage](#afficher-la-table-de-routage)
- [Ajouter une route statique](#ajouter-une-route-statique)
- [Changer son nom de domaine](#changer-son-nom-de-domaine)
- [Editer le fichier hosts](#editer-le-fichier-hosts)
- [Interagir avec le firewall](#interagir-avec-le-firewall)
- [Gérer sa table ARP](#gérer-sa-table-arp)
- [Configurer l'utilisation d'un serveur DNS](#configurer-lutilisation-dun-serveur-dns)
- [`tcpdump`](#tcpdump)
- [Activation du routage](#activation-du-routage)

<!-- vim-markdown-toc -->

---

# Définir une IP statique
**1. Repérer le nom de l'interface dont on veut changer l'IP**
```
ip a
```
**2. Modifier le fichier correspondant à l'interface**
* il se trouve dans `/etc/sysconfig/network-scripts`
* il porte le nom `ifcfg-<NOM_DE_L'INTERFACE>`
* on peut le créer s'il n'existe pas
* exemple de fichier minimaliste qui assigne `192.168.1.19/24` à l'interface `enp0s8`
  * c'est donc le fichier `/etc/sysconfig/network-scripts/ifcfg-enp0s8`
```
DEVICE=enp0s8

BOOTPROTO=static
ONBOOT=yes

IPADDR=192.168.1.19
NETMASK=255.255.255.0

# La suite est optionnelle
GATEWAY=192.168.1.254
DNS1=1.1.1.1
```
**3. Redémarrer l'interface**
```
sudo systemctl restart NetworkManager
```

# Définir une IP dynamique (DHCP)
**1. Repérer le nom de l'interface dont on veut changer l'IP**
```
ip a
```
**2. Modifier le fichier correspondant à l'interface**
* il se trouve dans `/etc/sysconfig/network-scripts`
* il porte le nom `ifcfg-<NOM_DE_L'INTERFACE>`
* on peut le créer s'il n'existe pas
* exemple de fichier minimaliste qui assigne `192.168.1.19/24` à l'interface `enp0s8`
  * c'est donc le fichier `/etc/sysconfig/network-scripts/ifcfg-enp0s8`
```
NAME=enp0s8
DEVICE=enp0s8

BOOTPROTO=dhcp
ONBOOT=yes
```
**3. Redémarrer l'interface**
```
sudo systemctl restart NetworkManager
```

# Supprimer manuellement une IP d'une carte

```bash
ip addr del 10.1.1.1/24 dev enp0s8
```

# Afficher la table de routage

Pour afficher la table de routage :
```bash
ip route show
# ou, plus court
ip r s
```

# Ajouter une route statique

* **temporairement**
  * `sudo ip route add <NETWORK_ADDRESS> via <IP_GATEWAY> dev <LOCAL_INTERFACE_NAME>`
  * par exemple `sudo ip route add 10.2.0.0/24 via 10.2.0.254 dev eth0`
  * ce changement sera effacé après `reboot` ou `systemctl restart NetworkManager`

* **définitivement**
  * comme toujours, afin de rendre le changement permanent, on va l'écrire dans un fichier
  * il peut exister un fichier de route par interface
  * les fichiers de routes :
    * sont dans `/etc/sysconfig/network-scripts/`
    * sont nommés `route-<INTERFACE_NAME>`
    * par exemple `/etc/sysconfig/network-scripts/route-enp0s8`
    * contiennent la même ligne que `ip route add` : 
```
10.2.0.0/24 via 10.2.0.254 dev eth0
10.1.0.0/24 via 10.1.0.254 dev eth0
```

* **pour vérifier**
  * `ip route show`
  
**Ajouter une route par défaut**
* temporaire : `ip route add default via <GATEWAY> dev <DEVICE>`
  * par exemple `ip route add default via 10.2.0.254 dev enp0s8`
* permanent : ajout de la ligne `GATEWAY=<GATEWAY>` dans `/etc/sysconfig/network`
  * par exemple :

```
$ cat /etc/sysconfig/network
GATEWAY=10.2.0.254

# redémarrer le réseau après avoir effectué la modif
$ sudo systemctl restart NetworkManager
```

# Changer son nom de domaine

**1. Changer le nom d'hôte immédiatement** (temporaire)
```
# commande hostname
sudo hostname <NEW_HOSTNAME>
# par exemple
sudo hostname vm1.tp3.b1
```
**2. Définir un nom d'hôte quand la machine s'allume** (permanent)
* écriture du nom d'hôte dans le fichier (avec `nano`) : `sudo nano /etc/hostname`
* **OU** en une seule commande `echo 'vm1.tp1.b3' | sudo tee /etc/hostname`

**3. Pour consulter votre nom d'hôte actuel**
```
hostname
```

# Editer le fichier hosts

Le fichier `hosts` se trouve au chemin `/etc/hosts`. Sa structure est la suivante :
* une seule IP par ligne
* une ligne est une correspondance entre une IP et un (ou plusieurs) noms (nom d'hôte)
* on peut définir des commentaires avec `#`  

Par exemple, pour faire correspondre l'IP `192.168.1.19` aux noms `monpc` et `monpc.chezmoi` :
```
192.168.1.19  monpc monpc.chezmoi
```
* on peut tester le fonctionnement avec un `ping`
```
ping monpc.chezmoi
```

# Interagir avec le firewall

Rocky Linux est aussi équipé d'un pare-feu. Par défaut, il bloque tout, à part quelques services comme `ssh`. Le firewall de Rocky Linux s'appelle `firewalld`.

> `firewalld` peut autoriser/bloquer des ports ou des "services". Les "services" sont juste des alias pour des ports. Par exemple le "service" SSH c'est le port 22/tcp. 

Pour manipuler le firewall de Rocky Linux, on utilise la commande `firewall-cmd` :
* `sudo firewall-cmd --list-all` pour lister toutes les règles actives actuellement
* `sudo firewall-cmd --add-port=80/tcp --permanent` pour autoriser les connexions sur le port TCP 80 
* `sudo firewall-cmd --remove-port=80/tcp --permanent` pour supprimer une règle qui autorisait les connexions sur le port TCP 80 
* `sudo firewall-cmd --reload` permet aux modifications effectuées de prendre effet

# Gérer sa table ARP

On utilise encore la commande `ip` pour ça. Pour la table ARP, c'est le mot-clé `neighbour` (on peut l'abréger `neigh`) :
* voir sa table ARP 
  * `ip neigh show`
  * pour une interface spécifique : `ip neigh show dev enp0s8`
* voir la ligne correspondant à une IP spécifique :
  * `ip neigh show 10.0.1.1`
* ajouter une ligne permanente
  * `sudo ip neigh add 10.0.1.10 lladdr de:4d:b3:3f:de:4d dev enp0s8 nud permanent`
* changer une ligne
  * `sudo ip neigh change 10.0.1.10 lladdr aa:bb:cc:dd:ee:ff dev enp0s8`
* supprimer une ligne
  * `sudo ip neigh del 10.0.1.10 lladdr aa:bb:cc:dd:ee:ff dev enp0s8 nud permanent`
* vider la table ARP
  * `sudo ip neigh flush all`

# Configurer l'utilisation d'un serveur DNS

Un serveur DNS est un serveur capable de traduire des noms de domaines en adresses IP.  

Souvent, toutes les machines d'un parc connaissent un serveur DNS à qui poser leurs questions.  

Sous GNU/Linux c'est le fichier `/etc/resolv.conf` qui est utilisé pour renseigner l'adresse du serveur DNS à interroger si besoin. On peut le modifier à volonté. 

Exemple d'utilisation de `1.1.1.1` (serveur DNS public de CloudFlare) comme serveur DNS :
```
# Contenu du fichier
$ sudo cat /etc/resolv.conf
nameserver 1.1.1.1

# Tester le bon fonctionnement
## En effectuant une requête HTTP vers un nom de domaine avec curl
$ curl gitlab.com

## En effectuant directement une requête DNS avec dig
$ dig gitlab.com
```

Il est aussi possible d'ajouter `DNS1=1.1.1.1` dans le fichier de configuration d'interface `/etc/sysconfig/network-scripts/ifcfg-<INTERFACE_NAME>`. [Voir la section dédiée](#définir-une-ip-statique).

# `tcpdump`

`tcpdump` permet de capturer les trames qui passent par une interface réseau, et les enregistrer dans un ficher au format `.pcap`. 

Ce fichier peut ensuite être ouvert dans Wireshark pour une analyse plus approfondie.

```bash
# Capturer le trafic de l'interface enp0s8
$ sudo tcpdump -i enp0s8

# Capturer uniquement 10 trames de l'interface enp0s8
$ sudo tcpdump -i enp0s8 -c 10

# Idem, en enregistrant la capture dans un fichier .pcap
$ sudo tcpdump -i enp0s8 -c 10 -w mon_fichier.pcap

# Idem, mais en excluant le trafic SSH (pour rappel, SSH passe par le port 22)
$ sudo tcpdump -i enp0s8 -c 10 -w mon_fichier.pcap not port 22
```

# Activation du routage

Pour activer le routage, il faut simplement autoriser la machine à traiter des paquets IP qui ne lui sont pas destinés (normal, ils sont destinés pour un autre réseau, puisqu'on parle d'un routeur :) ).

Pour ce faire :

```bash
# On repère la zone utilisée par firewalld, généralement 'public' si vous n'avez pas fait de conf spécifique
$ sudo firewall-cmd --list-all
$ sudo firewall-cmd --get-active-zone

# Activation du masquerading
$ sudo firewall-cmd --add-masquerade --zone=public
$ sudo firewall-cmd --add-masquerade --zone=public --permanent
```
