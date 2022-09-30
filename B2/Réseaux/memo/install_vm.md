# Install VM Cours

Pour la plupart des cours on se servira de la même VM, clonée à l'infiniiiiii.

## 1. Prérequis

Un hyperviseur, j'vous conseille VirtualBox, c'est libre et opensource : https://www.virtualbox.org/

Un fichier `.iso` de l'OS qu'on va utiliser. Pour nous ce sera Rocky Linux, et c'est ici que ça se passe : https://rockylinux.org/fr/

> **Prenez la version minimale de Rocky Linux.**

é c tou.

## 2. Création de la VM dans VirtualBox

On crée un nouvelle VM dans VBox.

Pour l'installation, on va modifier quelques trucs :

- mémoire RAM 1Go
- mémoire vidéo 128Mo
- carte réseau n°1 : NAT
- on insère le `.iso` comme un CD

On boot !

## 3. Install de Rocky Linux

Les trucs à changer à l'install :

- langue : anglais
- clavier : votre clavier :) azerty la plupart du temps donc "french"
- partitionnement automatique (il faut cliquer, et appuyer sur "Done" pour valider)
- allumage de la carte réseau
- définition d'un mot de passe pour root
- création d'un utilisateur + définir un mot de passe + cocher "Faire de cet utilisateur un administrateur"
- timezone : fuseau horaire de Paris
- software selection : minimal

Toubons :)

## 4. Préparer la VM au clonage

Une fois l'install terminée, on fait un reboot.

On va mettre en place deux trois trucs dans la VM pour qu'elle soit prête à être clonée :

```
# Mise à jour du système
$ sudo dnf update -y

# Installation de paquets qu'on va souvent utiliser
$ sudo dnf install -y python3 bind-utils nmap nc tcpdump vim

# on désactive SELinux
$ sudo setenforce 0

# pour le désactiver de façon permanent, il faut modifier le fichier /etc/selinux/config
# et remplacer "enforcing" par "permissive" sur la ligne non commentée
$ sudo nano /etc/selinux/config
```

➜ **Je vous conseille aussi de déposer votre clé publique SSH sur l'utilisateur de la VM pour être peinards après les clones effectués.**

**Vous pouvez éteindre la VM, elle est prête à être clonée :)**