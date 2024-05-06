function HistoricalTelemetryPlugin() {
    return function install (openmct) {
        var provider = {
            supportsRequest: function (domainObject) {
                return domainObject.type === 'telemetry';
            },
            request: function (domainObject, options) {
                var url = '/history/' + domainObject.identifier.key +
                    '?start=' + options.start +
                    '&end=' + options.end;
                // var url = 'http://localhost:8000/history.php' + '?key=' + domainObject.identifier.key;
    
                return http.get(url)
                    .then(function (resp) {
                        console.log(resp.data);
                        return resp.data;
                    });
            }
        };
    
        openmct.telemetry.addProvider(provider);
    }
}