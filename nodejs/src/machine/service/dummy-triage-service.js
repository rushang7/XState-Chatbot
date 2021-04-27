class TriageService {

    async upsertTriageDetails(person, triage) {
        // Nothing to return 
        console.log('Upsert Triage');
        console.log(JSON.stringify(triage));
    }

    async downloadReportForPerson(person) {

    }

    async exitProgram(person, exitSlots) {

    }

}

module.exports = new TriageService();