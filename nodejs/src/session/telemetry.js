class Telemetry {
    log(userId, type, data) {
        console.log(`${userId}, ${type}, ${data}`);
    }
}

module.exports = new Telemetry();