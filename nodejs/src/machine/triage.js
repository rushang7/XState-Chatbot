const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const { personService, triageService } = require('./service/service-loader');

const triageFlow = {
  id: 'triageFlow',
  initial: 'personName',
  onEntry: assign((context, event) => {
    context.slots.triage = {};
    context.slots.triage.person = {};
  }),
  states: {
    personName: {
      id: 'personName',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.personName.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            if(event.message.type == 'text' && event.message.input.length < 100) {
              context.slots.triage.person.name = dialog.get_input(event, false);
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#personAge'
            },
            {
              target: 'error'
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.personName.error, context.user.locale), false);
          }),
          always: 'prompt'
        }
      }
    }, // personName
    personAge: {
      id: 'personAge',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.personAge.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            if(event.message.type == 'text') {
              let age = parseInt(dialog.get_input(event, false));
              if(age > 0 && age < 120) {
                context.slots.triage.person.age = age;
                context.validMessage = true;
                return;
              }
            }
            context.validMessage = false;
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#personGender'
            },
            {
              target: 'error'
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.personAge.error, context.user.locale), false);
          }),
          always: 'prompt'
        }
      }
    }, // personAge
    personGender: {
      id: 'personGender',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.personGender.options.list, messages.personGender.options.messageBundle, context.user.locale);
            context.grammer = grammer;
            let message = dialog.get_message(messages.personGender.prompt, context.user.locale) + '\n' + prompt;
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
                context.slots.triage.person.gender = context.intention;

              }),
              target: '#persistPerson'
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
    }, // personGender
    persistPerson: {
      id: 'persistPerson',
      invoke: {
        src: (context) => personService.createPerson(context.slots.triage.person, context.user.mobileNumber),
        onDone: {
          actions: assign((context, event) => {
            console.log('event.data: ' + JSON.stringify(event.data));
            context.slots.triage.person = event.data;
          }),
          target: '#symptoms'
        }
        // TODO: handle duplicate person??
      }
    },
    symptoms: {
      id: 'symptoms',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammer.binaryChoice;
            dialog.sendMessage(context, dialog.get_message(messages.symptoms.prompt, context.user.locale));
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
                context.slots.triage.symptoms = context.intention
              }),
              target: '#contactedCovidPerson'
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
    contactedCovidPerson: {
      id: 'contactedCovidPerson',
      
    }
  }
}

let messages = {
  personName: {
    prompt: {
      en_IN: 'Please enter the patient\'s name'
    },
    error: {
      en_IN: 'Please enter the name as text which is less than 100 characters.'
    }
  },
  personAge: {
    prompt: {
      en_IN: 'Please enter patient\'s age'
    },
    error: {
      en_IN: 'Please enter the age as number in the range 0-120'
    }
  },
  personGender: {
    prompt: {
      en_IN: 'Please select gender of the patient'
    },
    options: {
      list: [ 'male', 'female', 'other' ],
      messageBundle: {
        male: {
          en_IN: 'Male'
        },
        female: {
          en_IN: 'Female'
        },
        other: {
          en_IN: 'Other'
        }
      }
    }    
  },
  symptoms: {
    prompt: {
      en_IN: 'Do you have any of the following symptoms: \n1. Fever\n2. Cough\n3. Sore throat\n4. Loss of smell\n5. Loss of taste\n6. Shortness of breath\n7. Expectoration\n8. Muscle pain\n9. Runny nose\n10. Nausea & diarrhoea\n\nPlease reply with Yes/No.'
    }
  }
}

let grammer = {
  binaryChoice: [
    { intention: true, recognize: ['yes', 'y' ]},
    { intention: false, recognize: ['no', 'n' ]}
  ]
}

module.exports = triageFlow;
