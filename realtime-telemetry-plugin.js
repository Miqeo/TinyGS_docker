/**
 * Basic Realtime telemetry plugin using websockets.
 */
function RealtimeTelemetryPlugin() {
    return function (openmct) {
        var socket = new WebSocket(location.origin.replace('http', 'ws') + '/realtime/');
        // var socket = new WebSocket("ws://0.0.0.0:8040/websockets.php");
        var listener = {};
    
        socket.onmessage = function (event) {
            point = JSON.parse(event.data);
            console.log('new point ' + point.timestamp);
            if (listener[point.id]) {
                listener[point.id](point);
            }
        };
        
        var provider = {
            supportsSubscribe: function (domainObject) {
                return domainObject.type === 'telemetry';
            },
            subscribe: function (domainObject, callback) {
                listener[domainObject.identifier.key] = callback;
                console.log('subscribe ' + domainObject.identifier.key)
                socket.send('subscribe ' + domainObject.identifier.key);
                return function unsubscribe() {
                    delete listener[domainObject.identifier.key];
                    console.log('unsubscribe ' + domainObject.identifier.key)
                    socket.send('unsubscribe ' + domainObject.identifier.key);
                };
            }
        };
        
        openmct.telemetry.addProvider(provider);
    }
}