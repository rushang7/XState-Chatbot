const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const { personService, vitalsService } = require('./service/service-loader');

const selfCareFlow = {
  recordVitals: {
    id: 'recordVitals',
    initial: 'fetchPersons',
    states: {
      fetchPersons: {
        invoke: {
          src: (context) => personService.getPersonsForMobileNumber(context.user.mobileNumber),
          onDone: [
            {
              cond: (context, event) => event.data.length == 1,
              actions: assign((context, event) => {
                context.person = event.data[0];
              }),
              target: '#userConsent'
            },
            {
              cond: (context, event) => event.data.length > 1,
              actions: assign((context, event) => {
                context.persons = event.data;
              }),
              target: '#selectPerson'
            }
          ]
        }
      },
      selectPerson: {
        id: 'selectPerson',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              let grammer = [];
              for(let person of context.persons) {

              }
            })
          }
        }
      },
      userConsent: {
        id: 'userConsent'
      }
    }
  },
  downloadReport: {
    id: 'downloadReport'
  },
  exitProgram: {
    id: 'exitProgram'
  }
}

module.exports = selfCareFlow;