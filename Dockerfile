FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn add sqlite3
RUN apk add php82
RUN apk add php82-sqlite3
RUN apk add php82-curl
RUN mkdir /etc/db
RUN php database_setup.php
RUN chmod 755 /app/setup.sh
RUN crontab cron.txt
CMD /bin/sh /app/setup.sh
EXPOSE 8080

