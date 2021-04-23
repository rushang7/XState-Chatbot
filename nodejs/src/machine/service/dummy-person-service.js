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
        uuid: '123',
        name: 'Ajay',
        age: 34,
        gender: 'male'
      },
      {
        uuid: '456',
        name: 'Vijya',
        age: 65,
        gender: 'female'
      },
    ]
  }

}

module.exports = new PersonService();