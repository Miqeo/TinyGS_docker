var express = require('express');
var sqlite3 = require('sqlite3');

var subscribed = {}; // Active subscriptions for this connection

function RealtimeServer(spacecraft) {
    
    var router = express.Router();
    var db = new sqlite3.Database('/etc/db/satellite.db', mode=sqlite3.OPEN_READONLY);

    this.getTelemetryPoint(spacecraft, db);
    setInterval(function () {
        this.getTelemetryPoint(spacecraft, db);
    }.bind(this), 60000 * spacecraft.offsetMinuteTime);

    router.ws('/', function (ws) {
        var unlisten = spacecraft.listen(notifySubscribers);
        // var subscribed = {}; // Active subscriptions for this connection
        var handlers = { // Handlers for specific requests
                subscribe: function (id) {
                    subscribed[id] = true;
                    console.log(subscribed);
                },
                unsubscribe: function (id) {
                    delete subscribed[id];
                    console.log(subscribed);
                }
            };

        function notifySubscribers(point) {
            if (subscribed[point.id]) {
                console.log("sending for subscriber " + JSON.stringify(point));
                ws.send(JSON.stringify(point));
            }
        }

        // Listen for requests
        ws.on('message', function (message) {
            var parts = message.split(' '),
                handler = handlers[parts[0]];
            if (handler) {
                handler.apply(handlers, parts.slice(1));
            }
        });

        // Stop sending telemetry updates for this connection when closed
        ws.on('close', unlisten);
    });

    return router;
};

RealtimeServer.prototype.getTelemetryPoint = function(spacecraft, db) {

    console.log("Getting new telemetry points");
    var response = []
    var query = `
SELECT
	packet_body as value,
	cast(json_extract(packet_body,'$.serverTime') as int) as serverTime
FROM 
	tb_satellite
WHERE 
	serverTime >=
	(
		SELECT strftime('%s', 'now') * 1000
	) - (60000 * :minute)
	and name = :sat
ORDER BY 
    serverTime asc;
    `;

    query = query.replace(":sat", `"${spacecraft.name}"`);
    query = query.replace(":minute", `${spacecraft.offsetMinuteTime}`);

    db.all(query, function(err, rows) {
            
        rows.forEach(function(row) {
            response.push({
                timestamp: row.serverTime,
                value: row.value
            });
        });
        console.log("new rows " + rows.length);
        setInterval(function () {
            RealtimeServer.prototype.individualPoint(spacecraft, response);
        }.bind(this), 1000);
    });

};

RealtimeServer.prototype.individualPoint = function(spacecraft, result) {
    let currentTime = Date.now();
    let offsetTime = currentTime - 60000 * spacecraft.offsetMinuteTime;

    if (result.length == 0) {
        return;
    }

    let pointResult = JSON.parse(result[0].value);
    
    if (pointResult.serverTime < offsetTime) {

        Object.keys(subscribed).forEach( keyId => {
            console.log(keyId);
            value = spacecraft.jsonObject(keyId, pointResult);
            console.log(value);
            var state = {
                id: keyId,
                value: value,
                timestamp: pointResult.serverTime// + 60000 * spacecraft.offsetMinuteTime
            }
            spacecraft.notify(state);
        });

        
        result.shift();
    }
    else {
        var remainderMinutes = (pointResult.serverTime - offsetTime) / (60 * 1000);
        console.log(Math.floor(remainderMinutes * 100) / 100 + " min to next");
    }

    // $currentTime = (int)(time().'000');
    // $offsetTime = $currentTime - 60000 * $minute;
    // // print "next offset time " . strval($offsetTime) . "\n";

    // $pointResult = $result[0];
    // // $pointResult['serverTime'] = $pointResult['serverTime'] - 60000 * $minute;


    // // print $offsetTime . "\n";
    // // print $pointResult['serverTime'] . "\n";
    // // print "is greater or eaqual " . ($pointResult['serverTime'] >= $offsetTime ? "true" : "false") . "\n";


    // if ($pointResult['serverTime'] < $offsetTime) {
    //     print "\n";
    //     print $offsetTime . "\n";
    //     print $pointResult['serverTime'] . "\n";
    //     print "- new point that was offset, " . $pointResult['serverTime'] . "\n";

    //     $pointResult['id'] = $measurementKey;
    //     $pointResult['timestamp'] = $pointResult['serverTime'] + 60000 * $minute;
    //     // $result['value'] = rand(10,100);

    //     $content= json_encode($pointResult);
    //     $response = chr(129) . chr(strlen($content)) . $content;
    //     socket_write($client, $response);
    //     //usleep(1000000);
    //     array_shift($result);

    // }
    // else {
    //     $remainderMinutes = ($pointResult['serverTime'] - $offsetTime) / (60 * 1000);
    //     print floor($remainderMinutes * 100) / 100 . " min to next\n";
    //     sleep(1);
    //     // array_shift($result);
    // }
};

module.exports = RealtimeServer;
