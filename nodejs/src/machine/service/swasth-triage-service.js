const fetch = require("node-fetch");
const config = require('../../env-variables');

class TriageService {

  async upsertTriageDetails(person, triage) {
    var query = `
  mutation upsert_c19_triage($object: c19_triage_insert_input!) {
    insert_c19_triage_one(object: $object, on_conflict: {constraint: c19_triage_person_id_key, update_columns: [symptoms, comorbidities,rt_pcr_status,spo2,subscribe]}) {
      uuid
      person_id
    }
  }`
    var options = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: {
          "object": {
            "symptoms": triage.symptoms.toString(),
            "rt_pcr_status": triage.rtpcr,
            "comorbidities": triage.isComorbid.toString(),
            "subscribe": triage.subscribe,
            "spo2": triage.spo2,
            "person_id": person.uuid
          }
        },
        operationName: "upsert_c19_triage"
      }),
      headers: {
        'x-hasura-admin-secret': config.hasuraAdminSecret,
      }
    }

    let response = await fetch(config.hasuraUrl, options);
    let data = await response.json()

    return data.data.insert_c19_triage_one.uuid;
  }

  async exitProgram(person, reason) {
    var query = `
    mutation update_c19_triage($person_id: uuid!, $subscribe: Boolean!) {
      update_c19_triage(_set: {subscribe: $subscribe}, where: {person_id: {_eq: $person_id}}) {
        affected_rows
        returning {
          person_id
        }
      }
    }
    `
    var options = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: {
          "subscribe": false,
          "person_id": person.uuid
        },
        operationName: "update_c19_triage"
      }),
      headers: {
        'x-hasura-admin-secret': config.hasuraAdminSecret,
      }
    }
    let response = await fetch(config.hasuraUrl, options);
    let data = await response.json()
    return data.data.update_c19_triage.affected_rows;
  }

}

module.exports = new TriageService();