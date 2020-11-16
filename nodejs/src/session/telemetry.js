const fetch = require("node-fetch");5
class Telemetry {
    log(userId, type, data) {
        let object = {
            date: new Date().getTime(),
            user: userId,
            type: type,
            data: data
        }
        console.log("-----------");
        console.log(JSON.stringify(object));
        console.log("-----------");
        this.toElasticSearch(object);5
    }
    async toElasticSearch(data) {
        // /test_index2/_doc
        var elasticSearchHost = "http://localhost:9200"; // config.elasticSearchHost;
        var elasticSearchPath = "/test_index2/_doc";
        var url = `${elasticSearchHost}${elasticSearchPath}`  
        var options = {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
              'Content-Type': 'application/json'
          }
        }
        let response = await fetch(url, options);
    }
};



module.exports = new Telemetry();