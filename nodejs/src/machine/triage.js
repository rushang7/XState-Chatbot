const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const { triageService } = require('./service/service-loader');

const triageFlow = {
  id: 'triageFlow',
  initial: 'personName',
  onEntry: assign((context, event) => {
    context.slots.triage = {};
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
              context.slots.triage.personName = dialog.get_input(event, false);
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => !context.validMessage,
              target: 'error'
            },
            {
              target: '#personAge'
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
                context.slots.triage.personAge = age;
                context.validMessage = true;
                return;
              }
            }
            context.validMessage = false;
          }),
          always: [
            {
              cond: (context) => !context.validMessage,
              target: 'error'
            },
            {
              target: '#personGender'
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
              actions: (context, event) => {
                context.slots.triage.personGender = context.intention;
              },
              target: '#symptoms'
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
    symptoms: {
      id: 'symptoms'
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
  }
}

module.exports = triageFlow;
