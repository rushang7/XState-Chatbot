const pdfCreator = require('pdf-creator-node');
const fs = require('fs');
const path = require("path");
const config = require('../../env-variables');

class TriageService {

    async upsertTriageDetails(person, triage) {
        // Nothing to return 
        console.log('Upsert Triage');
        console.log(JSON.stringify(triage));
    }

    async getTriageDetailsForPerson(person) {
        const userData = {
            "uuid": "9f9896c6-1e9f-4d8b-ac5a-0163670f0bf8",
            "c19_triage": {
                "created_at": "2021-04-23T17:04:16.978548+00:00",
                "comorbidities": "true",
                "rt_pcr_status": null,
                "symptoms": null
            },
            "c19_vitals": [
                {
                "created_at": "2021-04-23T17:28:16.359211+00:00",
                "spo2": "good",
                "temperature": "bad"
                },
                {
                "created_at": "2021-04-27T15:01:21.462757+00:00",
                "spo2": "bad",
                "temperature": "good"
                }
            ]
        }
        return userData;
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

        const userData = await this.getTriageDetailsForPerson(person);

        const c19_vitals = JSON.parse(JSON.stringify(userData.c19_vitals));
        c19_vitals.forEach(vital => {
            vital.created_date = new Date(vital.created_at).toDateString();
            vital.created_time = new Date(vital.created_at).toLocaleTimeString()
        });
            
        const variables = {
                person: {
                    first_name: person.first_name,
                    gender: person.gender,
                    age: person.age
                },
                c19_triage: { 
                    ...userData.c19_triage,
                    'hasComorbidities': userData.c19_triage.comorbidities == 'true' ? 'Yes' : 'No',
                    'hasSymptoms': userData.c19_triage.symptoms == 'true' ? 'Yes' : 'No',
                    'created_date': new Date(userData.c19_triage.created_at).toDateString() 
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

    }

}

module.exports = new TriageService();