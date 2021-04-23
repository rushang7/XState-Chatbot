const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const { personService, vitalsService } = require('./service/service-loader');
const { context } = require('./chat-machine.js');

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
              cond: (context, event) => event.data.length == 0,
              target: '#noUserFound'
            },
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
      noUserFound: {
        id: 'noUserFound',
        onEntry: assign((context, event) => {
          dialog.sendMessage(context, dialog.get_message(messages.noUserFound, context.user.locale), false);
        }),
        always: '#selfCareMenu'
      },
      selectPerson: {
        id: 'selectPerson',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.selectPerson.prompt, context.user.locale);
              let persons = context.persons;
              let grammer = [];
              for(let i = 0; i < persons.length; i++) {
                let person = persons[i];
                let grammerItem = { intention: person.uuid, recognize: [ (i + 1).toString() ] };
                grammer.push(grammerItem);
                message += '\n' + (i + 1) + '. ' + person.name;
              }
              context.grammer = grammer;
              dialog.sendMessage(context, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event);
            }),
            always: [
              {
                cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                target: 'error'
              },
              {
                actions: assign((context, event) => {
                  let personUuid = context.intention;
                  let personIndex = context.persons.findIndex(person => person.uuid.includes(personUuid));
                  let person = context.persons[personIndex];
                  context.person = person;
                  console.log(context.person);
                }),
                target: '#userConsent'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      userConsent: {
        id: 'userConsent',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              context.grammer = grammer.binaryChoice;
              dialog.sendMessage(context, dialog.get_message(messages.userConsent.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event);
            }),
            always: [
              {
                cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                target: 'error'
              },
              {
                cond: (context) => context.intention == 'yes',
                target: ''
              },
              {
                target: ''
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
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

let messages = {
  noUserFound: {
    en_IN: 'No patients found against your mobile number.'
  },
  selectPerson: {
    prompt: {
      en_IN: 'Please select a patient: '
    }
  },
  userConsent: {
    prompt: {
      en_IN: 'Consent Message'
    }
  }
}

let grammer = {
  binaryChoice: [
    { intention: true, recognize: ['yes', 'y' ]},
    { intention: false, recognize: ['no', 'n' ]}
  ],
}

module.exports = selfCareFlow;