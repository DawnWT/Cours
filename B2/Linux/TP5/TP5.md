# Spotyfy

## Description

Spotyfy est une plateforme de streaming musicale

## Installation

Spotyfy peut etre installé de 2 manieres :

Sur 1 seul machine :

- il faut installer [docker](http://docker.com)
- cloner le repository de [Spotyfy](https://github.com/DawnWT/Spotyfy)
- executer la commande `docker compose -f docker-compose.global.yaml up -d`
- Spotyfy est desormais utilisable a l'adresse `localhost`, ou l'adresse de la machine sur laquelle il est installé

sur plusieurs machine :

- il faut installer [docker](http://docker.com)
- cloner le repository de [Spotyfy](https://github.com/DawnWT/Spotyfy) sur chacune des machines
- executer la commande `docker compose -f docker-compose.mysql.yaml up -d` et ouvrir le port 3306 sur la machine qui contiendra la base de données
- remplacer par les bonnes ip les morceaux indiqué dans `docker-compose.koel.yaml` et `nginx.koel.conf`
- executer la commande `docker compose -f docker-compose.koel.yaml up -d` et ouvrir le port 8080 sur la machine qui contiendra Spotyfy
- executer la commande `docker compose -f docker-compose.nginx.yaml up -d` sur la machine qui contiendra le nginx
- Spotyfy est désormais utilisable a l'adresse de la machine sur laquelle est installé le nginx