var express = require('express');
var sqlite3 = require('sqlite3');

function HistoryServer(spacecraft) {
    var router = express.Router();

    var db = new sqlite3.Database('/etc/db/satellite.db', mode=sqlite3.OPEN_READONLY);

    router.get('/:keyId', function (req, res) {
        var start = +req.query.start;
        var end = +req.query.end;
        var keyId = req.params.keyId;
        // var ids = req.params.pointId.split(',');
        
        var measurementJsonPath = spacecraft.jsonText(keyId);
        
        var response = []

        var query = `
select 
	cast(json_extract(packet_body,:data) as float)  as value, 
	json_extract(packet_body,'$.serverTime') as serverTime 
FROM 
    tb_satellite 
WHERE 
    serverTime < (
        SELECT strftime('%s', 'now') * 1000
    ) - (60000 * :minute)
	and
	name = :sat
ORDER BY 
	serverTime DESC limit 300
        `;

        query = query.replace(":sat", `"${spacecraft.name}"`);
        query = query.replace(":data", `"${measurementJsonPath}"`);
        query = query.replace(":minute", `${spacecraft.offsetMinuteTime}`);
        
        db.all(query, function(err, rows) {
            

            rows.forEach(function(row) {
                response.push({
                    timestamp: row.serverTime,// + 60000 * spacecraft.offsetMinuteTime,
                    value: row.value,
                    id: keyId
                })
            });

            console.log("history rows " + rows.length);
            res.status(200).json(response).end();
        });
    });

    return router;
}

module.exports = HistoryServer;

