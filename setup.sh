#!/bin/sh

/usr/bin/php -f tinygs.php
/usr/sbin/crond
/bin/date > /etc/db/cron.log
npm start
