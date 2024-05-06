/*
 Spacecraft.js simulates a small spacecraft generating telemetry.
*/

function Spacecraft() {
    // this.state = {
    //     "prop.fuel": 77,
    //     "prop.thrusters": "OFF",
    //     "comms.recd": 0,
    //     "comms.sent": 0,
    //     "pwr.temp": 245,
    //     "pwr.c": 8.15,
    //     "pwr.v": 30
    // };
    // this.history = {};
    this.name = "GaoFen-7";
    this.offsetMinuteTime = 10;
    this.listeners = [];


    // Object.keys(this.state).forEach(function (k) {
    //     this.history[k] = [];
    // }, this);

    // setInterval(function () {
    //     this.updateState();
    //     this.generateTelemetry();
    // }.bind(this), 1000);

};

Spacecraft.prototype.jsonText = function (keyId) {
    switch (keyId) {
        case 'sat.incl':
            return '$.parsed.payload.inclination';
        case 'sat.solpwr':
            return'$.parsed.payload.tinygsSolarPower';
        case 'sat.alt':
            return '$.satPos.alt';
        case 'sat.angleX':
            return '$.parsed.payload.angleX';
        default:
            return '$.satPos.alt';
    }
};

Spacecraft.prototype.jsonObject = function (keyId, result) {
    switch (keyId) {
        case 'sat.incl':
            return result.parsed.payload.inclination;
        case 'sat.solpwr':
            return result.parsed.payload.tinygsSolarPower;
        case 'sat.alt':
            return result.satPos.alt;
        case 'sat.angleX':
            return result.parsed.payload.angleX;
        default:
            return result.parsed.payload.inclination;
    }
};

// Spacecraft.prototype.updateState = function () {
//     this.state["prop.fuel"] = Math.max(
//         0,
//         this.state["prop.fuel"] -
//             (this.state["prop.thrusters"] === "ON" ? 0.5 : 0)
//     );
//     this.state["pwr.temp"] = this.state["pwr.temp"] * 0.985
//         + Math.random() * 0.25 + Math.sin(Date.now());
//     if (this.state["prop.thrusters"] === "ON") {
//         this.state["pwr.c"] = 8.15;
//     } else {
//         this.state["pwr.c"] = this.state["pwr.c"] * 0.985;
//     }
//     this.state["pwr.v"] = 30 + Math.pow(Math.random(), 3);
// };

/**
 * Takes a measurement of spacecraft state, stores in history, and notifies 
 * listeners.
 */
Spacecraft.prototype.generateTelemetry = function () {
    var timestamp = Date.now(), sent = 0;
    Object.keys(this.state).forEach(function (id) {
        var state = { timestamp: timestamp, value: this.state[id], id: id};
        this.notify(state);
        this.history[id].push(state);
        this.state["comms.sent"] += JSON.stringify(state).length;
    }, this);
};

Spacecraft.prototype.notify = function (point) {
    this.listeners.forEach(function (l) {
        l(point);
    });
};

Spacecraft.prototype.listen = function (listener) {
    this.listeners.push(listener);
    return function () {
        this.listeners = this.listeners.filter(function (l) {
            return l !== listener;
        });
    }.bind(this);
};

module.exports = function () {
    return new Spacecraft()
};