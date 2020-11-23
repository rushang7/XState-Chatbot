const fetch = require("node-fetch");5
class Telemetry {
    async log(userId, type, data) {
        let object = {
            date: new Date().getTime(),
            user: userId,
            type: type,
            data: data
        }

        var elasticSearchHost = "http://localhost:9200"; // config.elasticSearchHost;
        var elasticSearchPath = "/test_index2/_doc";
        var url = `${elasticSearchHost}${elasticSearchPath}` ;
        try {
            let response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(object),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch(error) {
            console.error(error);
        }
    }
};



module.exports = new Telemetry();