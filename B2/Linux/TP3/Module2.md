# Module 2 : Réplication de base de données

Il y a plein de façons de mettre en place de la réplication de base données de type MySQL (comme MariaDB).

MariaDB possède un mécanisme de réplication natif qui peut très bien faire l'affaire pour faire des tests comme les nôtres.

Une réplication simple est une configuration de type "master-slave". Un des deux serveurs est le *master* l'autre est un *slave*.

Le *master* est celui qui reçoit les requêtes SQL (des applications comme NextCloud) et qui les traite.

Le *slave* ne fait que répliquer les donneés que le *master* possède.

La [doc officielle de MariaDB](https://mariadb.com/kb/en/setting-up-replication/) ou encore [cet article cool](https://cloudinfrastructureservices.co.uk/setup-mariadb-replication/) expose de façon simple comment mettre en place une telle config.

Pour ce module, vous aurez besoin d'un deuxième serveur de base de données.

```bash
master:
[user@db ~]$ sudo vi /etc/my.cnf
...
[mariadb] 
server-id=1
log_bin                = /var/log/mariadb/mariadb-bin.log
max_binlog_size        = 100M
relay_log = /var/log/mariadb/mariadb-relay-bin
relay_log_index = /var/log/mariadb/mariadb-relay-bin.index
...

slave: 
[user@db ~]$ sudo vi /etc/my.cnf
...
[mariadb] 
server-id=2
log_bin                = /var/log/mariadb/mariadb-bin.log
max_binlog_size        = 100M
relay_log = /var/log/mariadb/mariadb-relay-bin
relay_log_index = /var/log/mariadb/mariadb-relay-bin.index
...

[user@db ~]$ systemctl restart mariadb
```

✨ **Bonus** : Faire en sorte que l'utilisateur créé en base de données ne soit utilisable que depuis l'autre serveur de base de données

- inspirez-vous de la création d'utilisateur avec `CREATE USER` effectuée dans le TP2

```bash
master:
MariaDB [(none)]> CREATE USER 'replication'@'10.102.1.14' identified by 'replication';
MariaDB [(none)]> GRANT REPLICATION SLAVE ON *.* TO 'replication'@'10.102.1.14';
MariaDB [(none)]> FLUSH PRIVILEGES;

slave:
MariaDB [(none)]> CHANGE MASTER TO MASTER_HOST = '10.102.1.12', MASTER_USER = 'replication', MASTER_PASSWORD = 'replication', MASTER_LOG_FILE = 'mariadb-bin.000001';
MariaDB [(none)]> START SLAVE;

# need dump of master databases there was sata before
```

✨ **Bonus** : Mettre en place un setup *master-master* où les deux serveurs sont répliqués en temps réel, mais les deux sont capables de traiter les requêtes.

```bash
master:
[user@db ~]$ sudo vi /etc/my.cnf
...
[mariadb] 
server-id=1
report_host = master
log_bin                = /var/log/mariadb/mariadb-bin.log
max_binlog_size        = 100M
relay_log = /var/log/mariadb/mariadb-relay-bin
relay_log_index = /var/log/mariadb/mariadb-relay-bin.index
...

slave: 
[user@db ~]$ sudo vi /etc/my.cnf
...
[mariadb] 
server-id=2
report_host = master2
log_bin                = /var/log/mariadb/mariadb-bin.log
max_binlog_size        = 100M
relay_log = /var/log/mariadb/mariadb-relay-bin
relay_log_index = /var/log/mariadb/mariadb-relay-bin.index
...

[user@db ~]$ systemctl restart mariadb
```

```bash
master1
MariaDB [(none)]> create user 'master'@'10.102.1.14' identified by 'master';
MariaDB [(none)]> grant replication slave on *.* to 'master'@'10.102.1.14';
MariaDB [(none)]> STOP SLAVE;
MariaDB [(none)]> CHANGE MASTER TO MASTER_HOST='10.102.1.12', MASTER_USER='master2', MASTER_PASSWORD='master', MASTER_LOG_FILE='mariadb-bin.000001';
MariaDB [(none)]> START SLAVE;

master2
MariaDB [(none)]> create user 'master2'@'10.102.1.12%' identified by 'master';
MariaDB [(none)]> grant replication slave on *.* to 'master2'@'10.102.1.12';
MariaDB [(none)]> STOP SLAVE;
MariaDB [(none)]> CHANGE MASTER TO MASTER_HOST='10.102.1.14', MASTER_USER='master', MASTER_PASSWORD='master', MASTER_LOG_FILE='mariadb-bin.000002'
MariaDB [(none)]> START SLAVE;
```

![Replication](../pics/replication.jpg)
