const getCityAndLocality = require('./util/google-maps-util');

class DummyPGRService {

    // Please mark the method async if the actual app-service method would involve api calls

    async fetchCities() {
        return ["Bangalore", "Boston"];
    }
    async fetchFrequentComplaints(locale, n) {
        return [
            'Streetlight not working',
            'Sewage overflow / blocked',
            'Garbage not cleared',
            'Dirty Road - needs sweeping',
            'Water Pipe broken / leaking'
        ]
    }
    async persistComplaint(bundle) {
        console.log(`Saving complaint ${bundle} to database`);
    }
    async getCityAndLocality(event) {
        let messageType = event.message.type;
        if(messageType !== 'location') {
            console.log('Not a geocode');
            return {};
        }
        let geocode = event.message.input;
        let latlng = geocode.substring(1, geocode.length - 1); // Remove braces
        let cityAndLocality = await getCityAndLocality(latlng);
        return cityAndLocality;
    }
}

module.exports = new DummyPGRService();