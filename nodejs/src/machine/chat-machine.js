const { Machine, assign, actions } = require('xstate');
const dialog = require('./util/dialog.js');
const triageFlow = require('./triage');
const selfCareFlow = require('./self-care');

const chatStateMachine = Machine({
  id: 'chatMachine',
  initial: 'menu',
  on: {
    USER_RESET: {
      target: '#menu',
      // actions: assign( (context, event) => dialog.sendMessage(context, dialog.get_message(messages.reset, context.user.locale), false))
    }
  },
  states: {
    start: {
      id: 'start',
      onEntry: assign((context, event) => {
        context.slots = {}
      }),
      on: {
        USER_MESSAGE: '#menu'
      }
    },
    menu: {
      id: 'menu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammer.menu.prompt;
            dialog.sendMessage(context, dialog.get_message(messages.menu.prompt, context.user.locale));
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
            context.grammer = grammer.triageMenu.prompt;
            dialog.sendMessage(context, dialog.get_message(messages.triageMenu.prompt, context.user.locale));
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
            context.grammer = grammer.selfCareMenu.prompt;
            dialog.sendMessage(context, dialog.get_message(messages.selfCareMenu.prompt, context.user.locale));
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
      id: 'informationFlow'
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
      en_IN: 'Welcome to XYZ. Please let me know how can we help:\n1. I am feeling worried\n2. Manage self care\n3. Please give me information about COVID facilities\n\nYou can always get back to the main menu by sending "Reset".'
    }
  },
  triageMenu: {
    prompt: {
      en_IN: '1. I think I have symptoms\n2. I am awaiting my test results\n3. I came in contact with a COVID positive person!!! \n4. I have been advised self care by my doctor'
    }
  },
  selfCareMenu: {
    prompt: {
      en_IN: '1. Add new patient\n2. Please record my vitals\n3. Download my report\n4. Exit self care program'
    }
  },
  endstate: {
    en_IN: 'Goodbye. Say hi to start another conversation'
  }
}

let grammer = {
  menu: {
    prompt: [
      { intention: 'worried', recognize: ['1'] },
      { intention: 'selfCare', recognize: ['2'] },
      { intention: 'info', recognize: ['3'] }
    ]
  },
  triageMenu: {
    prompt: [
      { intention: 'symptoms', recognize: ['1']},
      { intention: 'awaitingTestResults', recognize: ['2']},
      { intention: 'contactedCovidPerson', recognize: ['3']},
      { intention: 'advisedByDoctor', recognize: ['4']},
    ]
  },
  selfCareMenu: {
    prompt: [
      { intention: 'addPatient', recognize: ['1']},
      { intention: 'recordVitals', recognize: ['2']},
      { intention: 'downloadReport', recognize: ['3']},
      { intention: 'exitProgram', recognize: ['4']},
    ]
  }
}

module.exports = chatStateMachine;
