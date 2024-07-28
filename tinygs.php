<?php
include 'constants.php';
error_reporting(E_ERROR | E_WARNING | E_PARSE);
ini_set("display_errors", 1);
//set_time_limit(15);


//curl used to fetch data from API
$ch = curl_init();
$sat = $satelliteName;
curl_setopt($ch, CURLOPT_URL, 'https://api.tinygs.com/v2/packets?satellite=' . $sat);

$headers = array(
'Accept-Language: pl,en-US;q=0.7,en;q=0.3',
'Accept: application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

curl_setopt($ch, CURLOPT_HEADER, 0); 			// return headers 0 no 1 yes
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 	// return page 1:yes
curl_setopt($ch, CURLOPT_TIMEOUT, 20); 			// http request timeout 20 seconds
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); 	// Follow redirects, need this if the url changes
curl_setopt($ch, CURLOPT_MAXREDIRS, 2); 		//if http server gives redirection responce
curl_setopt($ch, CURLOPT_USERAGENT,"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 	// false for https
$data = curl_exec($ch); 				// execute the http request
curl_close($ch); 					// close the connection


/*
Database table structure:
CREATE TABLE tb_satelite (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name STRING,
packet_id STRING UNIQUE,
packet_body STRING,
timestamp DATETIME DEFAULT DEFAULT (datetime('now','localtime'))
);

*/

$db = new SQLite3('/etc/db/satellite.db');

$data = json_decode($data, true);

        if(is_array($data['packets'])){

               foreach($data['packets'] as $key => $value){
                                        //echo $value['serverTime'].' '.$value['satellite'].' '.$value['id'].'</br>';
                                        $db->exec("INSERT OR IGNORE INTO tb_satellite (name,packet_id,packet_body) values 
('".$value['satellite']."', '".$value['id']."', '".json_encode($data['packets'][$key], true)."')");
                           }


        }


?>

