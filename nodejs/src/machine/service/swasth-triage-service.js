const fetch = require("node-fetch");
const config = require('../../env-variables');
const pdfCreator = require('pdf-creator-node');
const fs = require('fs');
const path = require("path");

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
            "symptoms": triage.symptoms ? triage.symptoms.toString() : '',
            "rt_pcr_status": triage.rtpcr,
            "comorbidities": triage.isComorbid ? triage.isComorbid.toString() : '',
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

  async getTriageDetailsForPerson(person) {
    //TODO: Create a helper function for graphql API calls
    var query = `
    query GetTriageDetailsForPerson($uuid: uuid!) {
      person(where: {uuid: {_eq: $uuid}}) {
        uuid
        c19_triage {
          created_at
          comorbidities
          rt_pcr_status
          symptoms
        }
        c19_vitals {
          created_at
          spo2
          temperature
          pulse
          breathing_rate
        }
      }
    }`
    var options = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: {
          "uuid": person.uuid
        },
      }),
      headers: {
        'x-hasura-admin-secret': config.hasuraAdminSecret,
      }
    }

    let response = await fetch(config.hasuraUrl, options);
    let data = await response.json()

    return data.data.person;
  }

  async downloadReportForPerson(person, locale) {
      const html = fs.readFileSync(path.resolve(__dirname, "../../../resources/pdf-template-download-report.html")).toString()

      const options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        header: {
          height: "45mm",
          contents: '<div style="text-align: center;">Vitals</div>'
        }
      };

      let userData = await this.getTriageDetailsForPerson(person);

      if (!userData || !userData.length) {
        return;
      }

      userData = userData[0];

      const c19_vitals = JSON.parse(JSON.stringify(userData.c19_vitals));
      c19_vitals.forEach(vital => {
        vital.created_date = new Date(vital.created_at).toDateString();
        vital.created_time = new Date(vital.created_at).toLocaleTimeString()
      });

      let hasComorbities = 'NA';
      let hasSymptoms = 'NA';
      let createdAt = 'NA';
      
      if (userData.c19_triage) {
        hasComorbities = userData.c19_triage.comorbidities == 'true' ? 'Yes' : 'No';
        hasSymptoms = userData.c19_triage.symptoms == 'true' ? 'Yes' : 'No';
        createdAt = userData.c19_triage.created_at;
      }

      const variables = {
        person: {
          first_name: person.first_name,
          gender: person.gender,
          age: person.age
        },
        c19_triage: { 
          ...userData.c19_triage,
          'hasComorbidities': hasComorbities,
          'hasSymptoms': hasSymptoms,
          'created_date': createdAt ? new Date(createdAt).toDateString() : 'NA'
        },
        c19_vitals: c19_vitals
      };

      const today = new Date().toDateString();
      const filePath = `${config.dynamicMediaPath}/${person.first_name}-vitals-report-${today}.pdf`;
      const document = {
        html: html,
        data: variables,
        path: path.resolve(__dirname, `../../../${filePath}`),
        type: "pdf",
      };

      await pdfCreator.create(document, options)
      return filePath;
  }

  async exitProgram(person, exitSlots) {
    var query = `
    mutation update_c19_triage($person_id: uuid!, $subscribe: Boolean!, $exit_reason: String, $exit_feedback: String) {
      update_c19_triage(_set: {subscribe: $subscribe, exit_reason: $exit_reason, exit_feedback: $exit_feedback}, where: {person_id: {_eq: $person_id}}) {
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
          "person_id": person.uuid,
          "exit_reason": exitSlots.exitReason,
          "exit_feedback": exitSlots.exitFeedback
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