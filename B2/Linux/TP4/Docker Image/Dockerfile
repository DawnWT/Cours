FROM debian

RUN apt update -y 
RUN apt install -y apache2
RUN mkdir /etc/apache2/logs

COPY apache2.conf /etc/apache2
COPY index.html /var/www/html

CMD ["apache2", "-DFOREGROUND"]
