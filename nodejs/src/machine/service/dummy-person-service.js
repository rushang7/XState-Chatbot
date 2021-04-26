class PersonService {

  async createPerson(person, mobileNumber) {
    console.log('Create person: ' + JSON.stringify(person));
    let uuid = '123' // Person id returned from backend service
    person.uuid = uuid;
    return person;
  }

  async getPersonsForMobileNumber(mobileNumber) {
    return [
      {
        "uuid": "366cb14e",
        "gender": "",
        "age": null,
        "first_name": "asd",
        "mobile": "9123123123",
        "mobile_code": "91"
      },
      {
        "uuid": "9f9896c6",
        "gender": "female",
        "age": 12,
        "first_name": "ads",
        "mobile": "9123123123",
        "mobile_code": "91"
      }
    ];
  }

  async getSubscribedPeople(mobileNumber) {
    return await this.getPersonsForMobileNumber(mobileNumber);
  }

}


module.exports = new PersonService();