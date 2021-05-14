const fetch = require("node-fetch");
const config = require('../../env-variables');
const dialog = require('../util/dialog.js');

class PersonService {

  async createPerson(person, mobileNumber) {

    person.mobile = mobileNumber;

    let encryptedPerson = await this.encryptAndHashPerson(person);

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
            "first_name": encryptedPerson.first_name,
            "age": person.age,
            "gender": person.gender,
            "mobile": encryptedPerson.mobile,
            "mobile_hash": encryptedPerson.mobile_hash,
            "mobile_code": "91"
          }
        },
        operationName: "insert_person"
      }),
      headers: {
        'x-hasura-admin-secret': config.hasuraAdminSecret,
      }
    }

    let response = await fetch(config.hasuraUrl, options);
    let data = await response.json();

    person.uuid = data.data.insert_person_one.uuid;
    return person;
  }

  async getPersonsForMobileNumber(mobileNumber) {
    let hashedMobile = await this.getHash(mobileNumber);

    var query = `
    query get_people($mobile_hash: String!) {
      person(where: {mobile_hash: {_eq: $mobile_hash}}) {
        uuid
        gender
        age
        first_name
        mobile
        mobile_hash
        mobile_code
        c19_triage {
          subscribe
        }        
      }
    }    
    `
    var options = {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        variables: {
          "mobile_hash": hashedMobile
        },
        operationName: "get_people"
      }),
      headers: {
        'x-hasura-admin-secret': config.hasuraAdminSecret,
      }
    }

    let response = await fetch(config.hasuraUrl, options);
    let data = await response.json();

    let persons = data.data.person;

    persons = await this.decryptPersons(persons);

    return persons;
  }

  async getSubscribedPeople(mobileNumber) {
    let people = await this.getPersonsForMobileNumber(mobileNumber)
    const subscribedPeople = this.filterSubscribedPeople(people);
    return subscribedPeople
  }

  filterSubscribedPeople(people) {
    const subscribedPeople = [];
    for (let i = 0; i < people.length; i++) {

      if (people[i].c19_triage && people[i].c19_triage.subscribe) {
        subscribedPeople.push(people[i])
      }
    }
    return subscribedPeople;
  }

  async getPeople(mobileNumber) {
    let people = await this.getPersonsForMobileNumber(mobileNumber)
    return people;
  }

  async encryptAndHashPerson(person) {
    let objectToEncrypt = {
      first_name: person.first_name,
      mobile: person.mobile
    }
    let url = config.services.encryptionServiceHost + config.services.encryptionServiceEncryptUrl;
    let headers = {
      'Content-Type': 'application/json',
    }
    let options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        "encryptionRequests": [
          {
            "tenantId": config.rootTenantId,
            "type": "Normal",
            "value": objectToEncrypt
          },
        ]
      })
    };

    let encryptedPerson = JSON.parse(JSON.stringify(person));
  
    let response = await fetch(url, options);
    let body = await response.json();
  
    encryptedPerson.first_name = body[0].encrypted.first_name;
    encryptedPerson.mobile = body[0].encrypted.mobile;
    encryptedPerson.mobile_hash = body[0].hashed.mobile;
  
    return encryptedPerson;
  }
  
  async decryptPersons(persons) {
    let objectToDecrypt = persons.map(person => { return { first_name: person.first_name, mobile: person.mobile }});
  
    let url = config.services.encryptionServiceHost + config.services.encryptionServiceDecryptUrl;
    let headers = {
      'Content-Type': 'application/json',
    }
    let options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(objectToDecrypt)
    };
    let response = await fetch(url, options);
    let body = await response.json();
  
    for(let i = 0; i < persons.length; i++) {
      persons[i].first_name = body[i].first_name;
      persons[i].mobile = body[i].mobile;
    }    
  
    return persons;
  }
  
  async getHash(value) {
    let url = config.services.encryptionServiceHost + config.services.encryptionServiceHashUrl;
    let headers = {
      'Content-Type': 'application/json',
    }
    let options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        value: value
      })
    };
    let response = await fetch(url, options);
    let body = await response.json();
  
    return body.value;
  }

  async validateName(context, event) {
    let message = dialog.get_input(event, false);
    if (event.message.type == 'text' && message.length < 100 && /^[ A-Za-z]+$/.test(message.trim())) {
      const subscribedPeople = this.filterSubscribedPeople(context.persons);
      const isDuplicate = subscribedPeople.find(person => person.first_name == message);
      if (isDuplicate) {
        return 'duplicate';
      } else {
        return message;
      }
    } else {
      return 'invalid';
    }
  }
  
}

module.exports = new PersonService();