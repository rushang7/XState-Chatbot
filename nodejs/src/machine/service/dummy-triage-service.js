class TriageService {

    async upsertTriageDetails(person, triage) {
        // Nothing to return 
        console.log('Upsert Triage');
        console.log(JSON.stringify(triage));
    }

    async downloadReportForPerson(person) {

    }

    async exitProgram(person, reason) {

    }

}

module.exports = new TriageService();