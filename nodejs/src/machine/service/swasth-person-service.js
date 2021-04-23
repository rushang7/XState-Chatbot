const fetch = require("node-fetch");
const config = require('../../env-variables');

class PersonService {

  async createPerson(person, mobileNumber) {
    var url = config.hasuraUrl;
    var query = `
    mutation insert_person($object: person_insert_input!) {
      insert_person_one(object: $object) {
        uuid
      }
    }    
    `
    var options = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: {
          "object": {
            "first_name": person.name,
            "age": person.age,
            "gender": person.gender,
            "mobile": person.mobileNumber,
            "mobile_code": "91"
          }
        },
        operationName: "insert_person"
      }),
      headers: {
        'x-hasura-admin-secret': config.hasuraAdminSecret,
      }
    }

    let response = await fetch(url, options);
    let data = await response.json()

    person.personId = data.data.insert_person_one.uuid;
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