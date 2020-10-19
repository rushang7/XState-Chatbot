class DummyPGRService {

    // Please mark the method async if the actual app-service method would involve api calls

    async fetchCities() {
        return ["Bangalore", "Boston"];
    }

}

module.exports = new DummyPGRService();