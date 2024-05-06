<?php

$db = new SQLite3('/etc/db/satellite.db');

$db->query("
CREATE TABLE tb_satellite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name STRING,
    packet_id STRING UNIQUE,
    packet_body STRING,
    saved_stamp DATETIME DEFAULT  (datetime('now','localtime'))
);
    ");