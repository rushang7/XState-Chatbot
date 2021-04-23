const fetch = require("node-fetch");
const config = require('../../env-variables');

class TriageService {

  async upsertTriageDetails(person, triage) {
    var query = `
  mutation upsert_c19_triage($object: c19_triage_insert_input!) {
    insert_c19_triage_one(object: $object, on_conflict: {constraint: c19_triage_person_id_key, update_columns: [aarogya_setu_downloaded, comorbidities,caregiver_availability,space_availability,consent]}) {
      uuid
      person_id
    }
  }  
  `
    var options = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: {
          "object": {
            "aarogya_setu_downloaded": triage.aarogyaSetuDownloaded,
            "caregiver_availability": triage.caregiverAvailability,
            "comorbidities": triage.isComorbid.toString(),
            "consent": true,
            "space_availability": triage.spaceAvailability,
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

}

module.exports = new TriageService();