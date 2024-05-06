FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn add sqlite3
RUN apk add php82
RUN apk add php82-sqlite3
RUN apk add php82-curl
RUN mkdir /etc/db
RUN php database_setup.php
# RUN chmod 755 cron.txt
# COPY setup.sh /setup.sh
RUN chmod 755 ./setup.sh
# RUN chmod 755 /setup.sh
# RUN crontab cron.txt
# CMD ["bin/sh ./setup.sh"]


# ENTRYPOINT sh ./setup.sh && /bin/bash
CMD ["sh ./setup.sh","-D"]
EXPOSE 3000

