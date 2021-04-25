const { Machine, assign, actions } = require('xstate');
const dialog = require('./util/dialog.js');
const triageFlow = require('./triage');
const selfCareFlow = require('./self-care');
const { personService } = require('./service/service-loader');

const chatStateMachine = Machine({
  id: 'chatMachine',
  initial: 'menuFetchPersons',
  onEntry: assign((context, event) => {
    context.slots = {}
  }),
  on: {
    USER_RESET: {
      target: '#menuFetchPersons',
      // actions: assign( (context, event) => dialog.sendMessage(context, dialog.get_message(messages.reset, context.user.locale), false))
    }
  },
  states: {
    start: {
      id: 'start',
      on: {
        USER_MESSAGE: '#menuFetchPersons'
      }
    },
    menuFetchPersons: {
      id: 'menuFetchPersons',
      invoke: {
        src: (context) => personService.getPersonsForMobileNumber(context.user.mobileNumber),
        onDone: {
          actions: assign((context, event) => {
            context.persons = event.data;
          }),
          target: '#menu'
        }
      }
    },
    menu: {
      id: 'menu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.menu.prompt.preamble, context.user.locale);
            let options;
            if(context.persons.length == 0) {
              options = messages.menu.prompt.options.newUser;
            } else {
              options = messages.menu.prompt.options.subscribedUser;
            }
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(options, messages.menu.prompt.options.messageBundle, context.user.locale);
            context.grammer = grammer;
            message += prompt;
            message += dialog.get_message(messages.menu.prompt.postscript, context.user.locale);
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
              cond: (context) => context.intention == 'worried',
              target: '#triageMenu'
            },
            {
              cond: (context) => context.intention == 'selfCare',
              target: '#selfCareMenu'
            },
            {
              cond: (context) => context.intention == 'info',
              target: '#informationFlow'
            },
            {
              target: 'error'
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
    }, // menu
    triageMenu: {
      id: 'triageMenu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.triageMenu.prompt.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.triageMenu.prompt.options.list, messages.triageMenu.prompt.options.messageBundle, context.user.locale);
            message += prompt;
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
              target: '#triageFlow',
              actions: assign((context, event) => {
                context.slots.triageMenu = context.intention;
              })
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
    }, //triageMenu
    selfCareMenu: {
      id: 'selfCareMenu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selfCareMenu.prompt.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.selfCareMenu.prompt.options.list, messages.selfCareMenu.prompt.options.messageBundle, context.user.locale);
            message += prompt;
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
              cond: (context) => context.intention == 'addPatient',
              target: '#triageFlow'
            },
            {
              cond: (context) => context.intention == 'recordVitals',
              target: '#recordVitals'
            },
            {
              cond: (context) => context.intention == 'downloadReport',
              target: '#downloadReport'
            },
            {
              cond: (context) => context.intention == 'exitProgram',
              target: '#exitProgram'
            },
            {
              target: 'error'
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
    }, // selfCareMenu
    informationFlow: {
      id: 'informationFlow',
      onEntry: assign((context, event) => {
        dialog.sendMessage(context, dialog.get_message(messages.informationFlow, context.user.locale));
      }),
      always: '#endstate'
    },
    triageFlow: triageFlow,
    recordVitals: selfCareFlow.recordVitals,
    downloadReport: selfCareFlow.downloadReport,
    exitProgram: selfCareFlow.exitProgram,
    endstate: {
      id: 'endstate',
      // onEntry: assign((context, event) => {
      //   dialog.sendMessage(context, dialog.get_message(messages.endstate, context.user.locale));
      // }),
      always: '#start'
    }
  }
});

let messages = {
  menu: {
    prompt: {
      preamble: {
        en_IN: 'Hi there! My name is Carina. I am an evolving COVID-19 chatbot created by the Swasth Digital Health Foundation to help address your COVID concerns. How can I help you?'
      },
      postscript: {
        en_IN: '\n\nYou can always get back to the main menu by sending "Reset".'
      },
      options: {
        newUser: [ 'worried', 'info' ],
        subscribedUser: [ 'worried', 'selfCare', 'info' ],
        messageBundle: {
          worried: {
            en_IN: 'I am feeling worried and have concerns regarding COVID'
          },
          selfCare: {
            en_IN: 'I want to manage my homecare program'
          },
          info: {
            en_IN: 'I want information about COVID facilities'
          }
        }
      }
    }
  },
  triageMenu: {
    prompt: {
      preamble: {
        en_IN: 'Let me try and address them! Tell me more about your concerns:'
      },
      options: {
        list: [ 'symptoms', 'contactCovid', 'doctorAdvise', 'awaitingResult' ],
        messageBundle: {
          symptoms: {
            en_IN: 'I may have COVID-19 symptoms'
          },
          contactCovid: {
            en_IN: 'I have come in contact with a COVID-19 patient'
          },
          doctorAdvise: {
            en_IN: 'My doctor has advised homecare for COVID management'
          },
          'awaitingResult': {
            en_IN: 'I am awaiting my test results'
          }
        },
      }
    }
  },
  selfCareMenu: {
    prompt: {
      preamble: {
        en_IN: 'How would you like to proceed?'
      },
      options: {
        list: [ 'addPatient', 'recordVitals', 'downloadReport', 'exitProgram' ],
        messageBundle: {
          addPatient: {
            en_IN: 'Enroll a new patient into the program'
          },
          recordVitals: {
            en_IN: 'Enter vitals'
          },
          downloadReport: {
            en_IN: 'Download vitals report'
          },
          exitProgram: {
            en_IN: 'Exit self care program'
          }
        }
      }
    }
  },
  informationFlow: {
    en_IN: 'Informational Message'
  },
  endstate: {
    en_IN: 'Goodbye. Say hi to start another conversation'
  }
}

module.exports = chatStateMachine;
