class Telemetry {
    log(userId, type, data) {
        console.log(`[Telemetry: Date: ${new Date()}, User: ${userId}, Type: ${type}, Data:<${data}>]`);
    }
}

module.exports = new Telemetry();