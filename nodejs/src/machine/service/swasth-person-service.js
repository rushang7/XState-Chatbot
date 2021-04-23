class PersonService {

  async createPerson(person, mobileNumber) {
    console.log('Create person: ' + JSON.stringify(person));
    let personId = '123' // Person id returned from backend service
    person.personId = personId;
    return person;
  }

  async getPersonsForMobileNumber(mobileNumber) {
    return [
      {
        personId: '123',
        name: 'Ajay',
        age: 34,
        gender: 'male'
      },
      {
        personId: '456',
        name: 'Vijya',
        age: 65,
        gender: 'female'
      },
    ]
  }

}

module.exports = new PersonService();