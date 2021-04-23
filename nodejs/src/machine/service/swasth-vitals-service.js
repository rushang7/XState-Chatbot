const fetch = require("node-fetch");
const config = require('../../env-variables');

class VitalsService {
  async addVitals(vitals) {
    var query = `
    mutation insert_vitals($object: c19_vitals_insert_input!) {
      insert_c19_vitals_one(object: $object) {
        uuid
      }
    }       
    `
    var options = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: {
          "object": {
            "rt_pcr_status": false,
            "spo2": vitals.spo2.toString(),
            "temperature": vitals.temperature.toString(),
            "pulse": "",
            "person_id": vitals.person.uuid
          }
        },
        operationName: "insert_vitals"
      }),
      headers: {
        'x-hasura-admin-secret': config.hasuraAdminSecret,
      }
    }

    let response = await fetch(config.hasuraUrl, options);
    let data = await response.json()

    return data.data.insert_c19_vitals_one.uuid;
  }
}

module.exports = new VitalsService();