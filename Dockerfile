FROM php:8.2-apache

RUN apt-get update && apt-get install -y libsqlite3-dev

RUN docker-php-ext-install pdo_sqlite pdo

RUN a2enmod rewrite

RUN printf '<VirtualHost *:80>\n\tDocumentRoot /var/www/html\n\t<Directory /var/www/html>\n\t\tOptions Indexes FollowSymLinks\n\t\tAllowOverride All\n\t\tRequire all granted\n\t</Directory>\n</VirtualHost>\n' \
    > /etc/apache2/sites-available/000-default.conf

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html/database && \
    chmod -R 775 /var/www/html/database

EXPOSE 80
