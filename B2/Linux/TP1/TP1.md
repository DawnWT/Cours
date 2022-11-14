# TP1 : (re)Familiaration avec un système GNU/Linux

Dans ce TP, on va passer en revue des éléments de configurations élémentaires du système.

Vous pouvez effectuer ces actions dans la première VM. On la clonera ensuite avec toutes les configurations pré-effectuées.

Au menu :

- gestion d'utilisateurs
  - sudo
  - SSH et clés
- configuration réseau
- gestion de partitions
- gestion de services

![Heyyyy](./pics/hey.jpeg)

## Sommaire

- [TP1 : (re)Familiaration avec un système GNU/Linux](#tp1--refamiliaration-avec-un-système-gnulinux)
  - [Sommaire](#sommaire)
  - [0. Préparation de la machine](#0-préparation-de-la-machine)
  - [I. Utilisateurs](#i-utilisateurs)
    - [1. Création et configuration](#1-création-et-configuration)
    - [2. SSH](#2-ssh)
  - [II. Partitionnement](#ii-partitionnement)
    - [1. Préparation de la VM](#1-préparation-de-la-vm)
    - [2. Partitionnement](#2-partitionnement)
  - [III. Gestion de services](#iii-gestion-de-services)
  - [1. Interaction avec un service existant](#1-interaction-avec-un-service-existant)
  - [2. Création de service](#2-création-de-service)
    - [A. Unité simpliste](#a-unité-simpliste)
    - [B. Modification de l'unité](#b-modification-de-lunité)

## 0. Préparation de la machine

> **POUR RAPPEL** pour chacune des opérations, vous devez fournir dans le compte-rendu : comment réaliser l'opération ET la preuve que l'opération a été bien réalisée

🌞 **Setup de deux machines Rocky Linux configurées de façon basique.**

- **un accès internet (via la carte NAT)**
  - carte réseau dédiée
  - route par défaut

- **un accès à un réseau local** (les deux machines peuvent se `ping`) (via la carte Host-Only)
  - carte réseau dédiée (host-only sur VirtualBox)
  - les machines doivent posséder une IP statique sur l'interface host-only

- **vous n'utilisez QUE `ssh` pour administrer les machines**

- **les machines doivent avoir un nom**
  - référez-vous au mémo
  - les noms que doivent posséder vos machines sont précisés dans le tableau plus bas

- **utiliser `1.1.1.1` comme serveur DNS**
  - référez-vous au mémo
  - vérifier avec le bon fonctionnement avec la commande `dig`
    - avec `dig`, demander une résolution du nom `ynov.com`
    - mettre en évidence la ligne qui contient la réponse : l'IP qui correspond au nom demandé
    - mettre en évidence la ligne qui contient l'adresse IP du serveur qui vous a répondu

- **les machines doivent pouvoir se joindre par leurs noms respectifs**
  - fichier `/etc/hosts`
  - assurez-vous du bon fonctionnement avec des `ping <NOM>`

- **le pare-feu est configuré pour bloquer toutes les connexions exceptées celles qui sont nécessaires**
  - commande `firewall-cmd`

Pour le réseau des différentes machines (ce sont les IP qui doivent figurer sur les interfaces host-only):

| Name               | IP            |
|--------------------|---------------|
| 🖥️ `node1.tp1.b2` | `10.101.1.11` |
| 🖥️ `node2.tp1.b2` | `10.101.1.12` |
| Votre hôte         | `10.101.1.1`  |

## I. Utilisateurs

[Une section dédiée aux utilisateurs est dispo dans le mémo Linux.](../../cours/memos/commandes.md#gestion-dutilisateurs).

### 1. Création et configuration

🌞 **Ajouter un utilisateur à la machine**, qui sera dédié à son administration

- précisez des options sur la commande d'ajout pour que :
  - le répertoire home de l'utilisateur soit précisé explicitement, et se trouve dans `/home`
  - le shell de l'utilisateur soit `/bin/bash`
- prouvez que vous avez correctement créé cet utilisateur
  - et aussi qu'il a le bon shell et le bon homedir

```bash
[user@node1 ~]$ sudo useradd -m -s /bin/bash admin
[user@node1 ~]$ sudo passwd admin 
# admin
# admin
```

```bash
[user@node1 ~]$ su - admin
Password:
Last failed login: Mon Nov 14 21:14:38 CET 2022 on pts/0
There were 6 failed login attempts since the last successful login.
[admin@node1 ~]$ echo $SHELL
/bin/bash
[admin@node1 ~]$ pwd
/home/admin
```

🌞 **Créer un nouveau groupe `admins`** qui contiendra les utilisateurs de la machine ayant accès aux droits de `root` *via* la commande `sudo`.

Pour permettre à ce groupe d'accéder aux droits `root` :

- il faut modifier le fichier `/etc/sudoers`
- on ne le modifie jamais directement à la main car en cas d'erreur de syntaxe, on pourrait bloquer notre accès aux droits administrateur
- la commande `visudo` permet d'éditer le fichier, avec un check de syntaxe avant fermeture
- ajouter une ligne basique qui permet au groupe d'avoir tous les droits (inspirez vous de la ligne avec le groupe `wheel`)

```bash
[user@node1 ~]$ sudo groupadd admins
[user@node1 ~]$ sudo visudo
%admins ALL=(ALL)     ALL
```

🌞 **Ajouter votre utilisateur à ce groupe `admins`**

> Essayez d'effectuer une commande avec `sudo` peu importe laquelle, juste pour tester que vous avez le droit d'exécuter des commandes sous l'identité de `root`. Vous pouvez aussi utiliser `sudo -l` pour voir les droits `sudo` auquel votre utilisateur courant a accès.

---

1. Utilisateur créé et configuré
2. Groupe `admins` créé
3. Groupe `admins` ajouté au fichier `/etc/sudoers`
4. Ajout de l'utilisateur au groupe `admins`

```bash
[user@node1 ~]$ sudo usermod -aG admins admin
```

### 2. SSH

[Une section dédiée aux clés SSH existe dans le cours.](../../cours/SSH/README.md)

Afin de se connecter à la machine de façon plus sécurisée, on va configurer un échange de clés SSH lorsque l'on se connecte à la machine.

🌞 **Pour cela...**

- il faut générer une clé sur le poste client de l'administrateur qui se connectera à distance (vous :) )
  - génération de clé depuis VOTRE poste donc
  - avec la commande `ssh-keygen` (avec des options)
- déposer la clé dans le fichier `/home/<USER>/.ssh/authorized_keys` de la machine que l'on souhaite administrer
  - vous utiliserez l'utilisateur que vous avez créé dans la partie précédente du TP
  - on peut le faire à la main (voir le cours SSH)
  - ou avec la commande `ssh-copy-id` (dispo uniquement dans `git bash` si vous êtes sous Windows)


```bash
PS C:\Users\mrtju\Documents\Cours\B2\Linux\TP1> ssh-keygen -t rsa -b 4096

sudo vi /home/admin/.ssh/authorized_keys # > copy public key
```

🌞 **Assurez vous que la connexion SSH est fonctionnelle**, sans avoir besoin de mot de passe.

```bash
PS C:\Users\mrtju\Documents\Cours\B2\Linux\TP1> ssh admin@10.101.1.11
Last login: Mon Nov 14 21:15:07 2022
[admin@node1 ~]$
```

## II. Partitionnement

[Il existe une section dédiée au partitionnement dans le cours](../../cours/part/)

### 1. Préparation de la VM

⚠️ **Uniquement sur `node1.tp1.b2`.**

Ajout de deux disques durs à la machine virtuelle, de 3Go chacun.

### 2. Partitionnement

⚠️ **Uniquement sur `node1.tp1.b2`.**

🌞 **Utilisez LVM** pour...

- agréger les deux disques en un seul *volume group*
- créer 3 *logical volumes* de 1 Go chacun
- formater ces partitions en `ext4`
- monter ces partitions pour qu'elles soient accessibles aux points de montage `/mnt/part1`, `/mnt/part2` et `/mnt/part3`.

```bash
[user@node1 ~]$ sudo vgcreate group /dev/sdb
  Volume group "group" successfully created
[user@node1 ~]$ sudo vgextend group /dev/sdc
  Volume group "group" successfully extended
[user@node1 ~]$ sudo vgs
  Devices file sys_wwid t10.ATA_____VBOX_HARDDISK___________________________VB590cf3bd-1d3370c3_ PVID 7ZBQH6OX1Rr6pf9tnf81Feu4JnaPsgRf last seen on /dev/sda2 not found.
  VG    #PV #LV #SN Attr   VSize VFree
  group   2   0   0 wz--n- 5.99g 5.99g
[user@node1 ~]$ sudo lvcreate -L 1G group -n vol1
  Logical volume "vol1" created.
[user@node1 ~]$ sudo lvcreate -L 1G group -n vol2
  Logical volume "vol2" created.
[user@node1 ~]$ sudo lvcreate -L 1G group -n vol3
  Logical volume "vol3" created.
[user@node1 ~]$ sudo lvs
  Devices file sys_wwid t10.ATA_____VBOX_HARDDISK___________________________VB590cf3bd-1d3370c3_ PVID 7ZBQH6OX1Rr6pf9tnf81Feu4JnaPsgRf last seen on /dev/sda2 not found.
  LV   VG    Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  vol1 group -wi-a----- 1.00g
  vol2 group -wi-a----- 1.00g
  vol3 group -wi-a----- 1.00g
[user@node1 ~]$ sudo mkfs -t ext4 /dev/group/vol1
mke2fs 1.46.5 (30-Dec-2021)
Creating filesystem with 262144 4k blocks and 65536 inodes
Filesystem UUID: 07f00de6-0d7d-47b3-9952-ab589b759c67
Superblock backups stored on blocks:
        32768, 98304, 163840, 229376

Allocating group tables: done
Writing inode tables: done
Creating journal (8192 blocks): done
Writing superblocks and filesystem accounting information: done

[user@node1 ~]$ sudo mkfs -t ext4 /dev/group/vol2
mke2fs 1.46.5 (30-Dec-2021)
Creating filesystem with 262144 4k blocks and 65536 inodes
Filesystem UUID: b6468e27-5cf8-4b81-aac6-a2dcca17f382
Superblock backups stored on blocks:
        32768, 98304, 163840, 229376

Allocating group tables: done
Writing inode tables: done
Creating journal (8192 blocks): done
Writing superblocks and filesystem accounting information: done

[user@node1 ~]$ sudo mkfs -t ext4 /dev/group/vol3
mke2fs 1.46.5 (30-Dec-2021)
Creating filesystem with 262144 4k blocks and 65536 inodes
Filesystem UUID: a3b5d4b5-7a03-4f32-9a49-3d2824a23d6f
Superblock backups stored on blocks:
        32768, 98304, 163840, 229376

Allocating group tables: done
Writing inode tables: done
Creating journal (8192 blocks): done
Writing superblocks and filesystem accounting information: done

[user@node1 ~]$ sudo mkdir /mnt/part1
[user@node1 ~]$ sudo mkdir /mnt/part2
[user@node1 ~]$ sudo mkdir /mnt/part3
[user@node1 ~]$ sudo mount /dev/group/vol1 /mnt/part1
[user@node1 ~]$ sudo mount /dev/group/vol2 /mnt/part2
[user@node1 ~]$ sudo mount /dev/group/vol3 /mnt/part3
```

🌞 **Grâce au fichier `/etc/fstab`**, faites en sorte que cette partition soit montée automatiquement au démarrage du système.

```bash
[user@node1 ~]$ sudo vi /etc/fstab

# /dev/group/vol1         /mnt/part1      ext4    defaults        0 0
# /dev/group/vol2         /mnt/part2      ext4    defaults        0 0
# /dev/group/vol3         /mnt/part3      ext4    defaults        0 0
```

✨**Bonus** : amusez vous avez les options de montage. Quelques options intéressantes :

- `noexec`
- `ro`
- `user`
- `nosuid`
- `nodev`
- `protect`

## III. Gestion de services

Au sein des systèmes GNU/Linux les plus utilisés, c'est *systemd* qui est utilisé comme gestionnaire de services (entre autres).

Pour manipuler les services entretenus par *systemd*, on utilise la commande `systemctl`.

On peut lister les unités `systemd` actives de la machine `systemctl list-units -t service`.

**Référez-vous au mémo pour voir les autres commandes `systemctl` usuelles.**

## 1. Interaction avec un service existant

⚠️ **Uniquement sur `node1.tp1.b2`.**

Parmi les services système déjà installés sur Rocky, il existe `firewalld`. Cet utilitaire est l'outil de firewalling de Rocky.

🌞 **Assurez-vous que...**

- l'unité est démarrée
- l'unitée est activée (elle se lance automatiquement au démarrage)

```bash
[user@node1 ~]$ sudo systemctl status firewalld
[sudo] password for user:
● firewalld.service - firewalld - dynamic firewall daemon
     Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2022-11-14 21:43:47 CET; 22min ago
       Docs: man:firewalld(1)
   Main PID: 660 (firewalld)
      Tasks: 2 (limit: 5907)
     Memory: 42.5M
        CPU: 380ms
     CGroup: /system.slice/firewalld.service
             └─660 /usr/bin/python3 -s /usr/sbin/firewalld --nofork --nopid

Nov 14 21:43:46 node1.tp1.b2 systemd[1]: Starting firewalld - dynamic firewall daemon...
Nov 14 21:43:47 node1.tp1.b2 systemd[1]: Started firewalld - dynamic firewall daemon.
```

## 2. Création de service

![Création de service systemd](./pics/create_service.png)

### A. Unité simpliste

⚠️ **Uniquement sur `node1.tp1.b2`.**

🌞 **Créer un fichier qui définit une unité de service** 

- le fichier `web.service`
- dans le répertoire `/etc/systemd/system`

Déposer le contenu suivant :

```
[Unit]
Description=Very simple web service

[Service]
ExecStart=/usr/bin/python3 -m http.server 8888

[Install]
WantedBy=multi-user.target
```

Le but de cette unité est de lancer un serveur web sur le port 8888 de la machine. **N'oubliez pas d'ouvrir ce port dans le firewall.**

Une fois l'unité de service créée, il faut demander à *systemd* de relire les fichiers de configuration :

```bash
$ sudo systemctl daemon-reload
```

Enfin, on peut interagir avec notre unité :

```bash
$ sudo systemctl status web
$ sudo systemctl start web
$ sudo systemctl enable web
```

```bash
[user@node1 ~]$ sudo firewall-cmd --permanent --add-port 8888/tcp
success
[user@node1 ~]$ sudo systemctl restart firewalld
[user@node1 ~]$ sudo systemctl restart web
```

🌞 **Une fois le service démarré, assurez-vous que pouvez accéder au serveur web**

- avec un navigateur depuis votre PC
- ou la commande `curl` depuis l'autre machine (je veux ça dans le compte-rendu :3)
- sur l'IP de la VM, port 8888

```bash
[user@node2 ~]$ curl 10.101.1.11:8888
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Directory listing for /</title>
</head>
<body>
<h1>Directory listing for /</h1>
<hr>
<ul>
<li><a href="afs/">afs/</a></li>
<li><a href="bin/">bin@</a></li>
<li><a href="boot/">boot/</a></li>
<li><a href="dev/">dev/</a></li>
<li><a href="etc/">etc/</a></li>
<li><a href="home/">home/</a></li>
<li><a href="lib/">lib@</a></li>
<li><a href="lib64/">lib64@</a></li>
<li><a href="media/">media/</a></li>
<li><a href="mnt/">mnt/</a></li>
<li><a href="opt/">opt/</a></li>
<li><a href="proc/">proc/</a></li>
<li><a href="root/">root/</a></li>
<li><a href="run/">run/</a></li>
<li><a href="sbin/">sbin@</a></li>
<li><a href="srv/">srv/</a></li>
<li><a href="sys/">sys/</a></li>
<li><a href="tmp/">tmp/</a></li>
<li><a href="usr/">usr/</a></li>
<li><a href="var/">var/</a></li>
</ul>
<hr>
</body>
</html>
```

### B. Modification de l'unité

🌞 **Préparez l'environnement pour exécuter le mini serveur web Python**

- créer un utilisateur `web`
- créer un dossier `/var/www/meow/`
- créer un fichier dans le dossier `/var/www/meow/` (peu importe son nom ou son contenu, c'est pour tester)
- montrez à l'aide d'une commande les permissions positionnées sur le dossier et son contenu

```bash
[web@node1 ~]$ ls -lR /var/www/
/var/www/:
total 0
drwxr-xr-x. 2 web root 18 Nov 14 22:43 meow

/var/www/meow:
total 4
-rw-r--r--. 1 web web 5 Nov 14 22:43 test
```

> Pour que tout fonctionne correctement, il faudra veiller à ce que le dossier et le fichier appartiennent à l'utilisateur `web` et qu'il ait des droits suffisants dessus.

🌞 **Modifiez l'unité de service `web.service` créée précédemment en ajoutant les clauses**

- `User=` afin de lancer le serveur avec l'utilisateur `web` dédié
- `WorkingDirectory=` afin de lancer le serveur depuis le dossier créé au dessus : `/var/www/meow/`
- ces deux clauses sont à positionner dans la section `[Service]` de votre unité

```bash
[user@node1 ~]$ sudo vi /etc/systemd/system/web.service

[Unit]
Description=Very simple web service

[Service]
User=web
WorkingDirectory=/var/www/meow
ExecStart=/usr/bin/python3 -m http.server 8888

[Install]
WantedBy=multi-user.target
```

🌞 **Vérifiez le bon fonctionnement avec une commande `curl`**

```bash
[user@node2 ~]$ curl 10.101.1.11:8888
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Directory listing for /</title>
</head>
<body>
<h1>Directory listing for /</h1>
<hr>
<ul>
<li><a href="test">test</a></li>
</ul>
<hr>
</body>
</html>
[user@node2 ~]$
```