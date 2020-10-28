class DummyPGRService {

    // Please mark the method async if the actual app-service method would involve api calls

    async fetchCities() {
        return ["Bangalore", "Boston"];
    }
    async fetchFrequentComplaints() {
        return [
            'Streetlight not working',
            'Sewage overflow / blocked',
            'Garbage not cleared',
            'Dirty Road - needs sweeping',
            'Water Pipe broken / leaking'
        ]
    }

}

module.exports = new DummyPGRService();