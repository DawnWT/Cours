# Module 1 : Reverse Proxy

Un reverse proxy est donc une machine que l'on place devant un autre service afin d'accueillir les clients et servir d'intermédiaire entre le client et le service.

L'utilisation d'un reverse proxy peut apporter de nombreux bénéfices :

- décharger le service HTTP de devoir effectuer le chiffrement HTTPS (coûteux en performances)
- répartir la charge entre plusieurs services
- effectuer de la mise en cache
- fournir un rempart solide entre un hacker potentiel et le service et les données importantes
- servir de point d'entrée unique pour accéder à plusieurs services web

![Not sure](../pics/reverse_proxy.png)

## Sommaire

- [Module 1 : Reverse Proxy](#module-1--reverse-proxy)
  - [Sommaire](#sommaire)
- [I. Intro](#i-intro)
- [II. Setup](#ii-setup)
- [III. HTTPS](#iii-https)

# I. Intro

# II. Setup

🖥️ **VM `proxy.tp3.linux`**

**N'oubliez pas de dérouler la [📝**checklist**📝](#checklist).**

➜ **On utilisera NGINX comme reverse proxy**

- installer le paquet `nginx`
- démarrer le service `nginx`
- utiliser la commande `ss` pour repérer le port sur lequel NGINX écoute
- ouvrir un port dans le firewall pour autoriser le trafic vers NGINX
- utiliser une commande `ps -ef` pour déterminer sous quel utilisateur tourne NGINX
- vérifier que le page d'accueil NGINX est disponible en faisant une requête HTTP sur le port 80 de la machine

```bash
[user@proxy ~]$ sudo ss -alnpt | grep nginx
LISTEN 0      511          0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=11065,fd=6),("nginx",pid=11064,fd=6))
LISTEN 0      511             [::]:80           [::]:*    users:(("nginx",pid=11065,fd=7),("nginx",pid=11064,fd=7))
[user@proxy ~]$ sudo firewall-cmd --add-port=80/tcp --permanent
success
[user@proxy ~]$ sudo firewall-cmd --reload
success
[user@proxy ~]$ ps -ef | grep nginx
root       11064       1  0 10:40 ?        00:00:00 nginx: master process /usr/sbin/nginx
nginx      11065   11064  0 10:40 ?        00:00:00 nginx: worker process
user       11110    1254  0 10:44 pts/0    00:00:00 grep --color=auto nginx



PS C:\Users\mrtju\Documents\Cours> curl 10.102.1.13:80


StatusCode        : 200
StatusDescription : OK
Content           : <!doctype html>
                    <html>
                      <head>
                        <meta charset='utf-8'>
                        <meta name='viewport' content='width=device-width, initial-scale=1'>
                        <title>HTTP Server Test Page powered by: Rocky Linux</title>
```

➜ **Configurer NGINX**

- nous ce qu'on veut, c'pas une page d'accueil moche, c'est que NGINX agisse comme un reverse proxy entre les clients et notre serveur Web
- deux choses à faire :
  - créer un fichier de configuration NGINX
    - la conf est dans `/etc/nginx`
    - procédez comme pour Apache : repérez les fichiers inclus par le fichier de conf principal, et créez votre fichier de conf en conséquence
  - NextCloud est un peu exigeant, et il demande à être informé si on le met derrière un reverse proxy
    - y'a donc un fichier de conf NextCloud à modifier
    - c'est un fichier appelé `config.php`

Référez-vous à monsieur Google pour tout ça :)

Exemple de fichier de configuration minimal NGINX.:

```nginx
server {
    # On indique le nom que client va saisir pour accéder au service
    # Pas d'erreur ici, c'est bien le nom de web, et pas de proxy qu'on veut ici !
    server_name web.tp2.linux;

    # Port d'écoute de NGINX
    listen 80;

    location / {
        # On définit des headers HTTP pour que le proxying se passe bien
        proxy_set_header  Host $host;
        proxy_set_header  X-Real-IP $remote_addr;
        proxy_set_header  X-Forwarded-Proto https;
        proxy_set_header  X-Forwarded-Host $remote_addr;
        proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;

        # On définit la cible du proxying 
        proxy_pass http://<IP_DE_NEXTCLOUD>:80;
    }

    # Deux sections location recommandés par la doc NextCloud
    location /.well-known/carddav {
      return 301 $scheme://$host/remote.php/dav;
    }

    location /.well-known/caldav {
      return 301 $scheme://$host/remote.php/dav;
    }
}
```

✨ **Bonus** : rendre le serveur `web.tp2.linux` injoignable sauf depuis l'IP du reverse proxy. En effet, les clients ne doivent pas joindre en direct le serveur web : notre reverse proxy est là pour servir de serveur frontal.

```bash
[user@proxy ~]$ sudo vi /etc/nginx/nginx.conf
...
include /etc/nginx/conf.d/*.conf;
...
[user@proxy ~]$ sudo vi /etc/nginx/conf.d/tp2-proxy.conf
# copy provided config
```

```bash
# to limit access only to proxy
[user@web ~]$ sudo vi /etc/httpd/conf.d/tp2_nextcloud.conf
<VirtualHost *:80>
  DocumentRoot /var/www/tp2_nextcloud/
  ServerName  web.tp2.linux
  <Directory /var/www/tp2_nextcloud/>
    # Require all granted
    # AllowOverride All
        require ip 10.102.1.13
        Options FollowSymLinks MultiViews
    <IfModule mod_dav.c>
      Dav off
    </IfModule>
  </Directory>
</VirtualHost>
```

# III. HTTPS

Le but de cette section est de permettre une connexion chiffrée lorsqu'un client se connecte. Avoir le ptit HTTPS :)

Le principe :

- on génère une paire de clés sur le serveur `proxy.tp3.linux`
  - une des deux clés sera la clé privée : elle restera sur le serveur et ne bougera jamais
  - l'autre est la clé publique : elle sera stockée dans un fichier appelé *certificat*
    - le *certificat* est donné à chaque client qui se connecte au site
- on ajuste la conf NGINX
  - on lui indique le chemin vers le certificat et la clé privée afin qu'il puisse les utiliser pour chiffrer le trafic
  - on lui demande d'écouter sur le port convetionnel pour HTTPS : 443 en TCP

Je vous laisse Google vous-mêmes "nginx reverse proxy nextcloud" ou ce genre de chose :)
