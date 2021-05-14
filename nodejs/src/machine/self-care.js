const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const mediaUtil = require('./util/media');
const { personService, vitalsService, triageService } = require('./service/service-loader');
const { messages, grammer } = require('./messages/self-care');
const config = require('../../src/env-variables');

const selfCareFlow = {
  recordVitals: {
    id: 'recordVitals',
    initial: 'fetchPersons',
    onEntry: assign((context, event) => {
      context.slots.vitals = {};
    }),
    states: {
      fetchPersons: {
        invoke: {
          src: (context) => personService.getPeople(context.user.mobileNumber),
          onDone: [
            {
              cond: (context, event) => event.data.length == 0,
              actions: assign((context, event) => {
                context.persons = event.data;
              }),
              target: '#noUserFound'
            },
            {
              cond: (context, event) => event.data.length == 1,
              actions: assign((context, event) => {
                context.slots.vitals.person = event.data[0];
              }),
              target: '#vitalsSpo2'
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
              for (let i = 0; i < persons.length; i++) {
                let person = persons[i];
                let grammerItem = { intention: person.uuid, recognize: [(i + 1).toString()] };
                grammer.push(grammerItem);
                message += '\n' + (i + 1) + '. ' + person.first_name;
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
              context.intention = dialog.get_intention(context.grammer, event, true);
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
                  context.slots.vitals.person = person;
                }),
                target: '#vitalsSpo2'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      vitalsSpo2: {
        id: 'vitalsSpo2',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              context.grammer = grammer.vitalsSpo2;
              let message = dialog.get_message(messages.vitalsSpo2.prompt, context.user.locale);
              message = message.replace('{{name}}', context.slots.vitals.person.first_name);
              dialog.sendMessage(context, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
              context.slots.vitals.spo2 = context.intention
            }),
            always: [
              {
                cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                target: 'error'
              },
              {
                cond: (context) => context.intention == 'bad',
                actions: assign((context, event) => {
                  let message = dialog.get_message(messages.vitalsSpo2Bad, context.user.locale);
                  message = message.replace('{{name}}', context.slots.vitals.person.first_name);
                  dialog.sendMessage(context, message);
                }),
                target: '#addVitals'
              },
              {
                target: '#vitalsPulse'
              },
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      vitalsPulse: {
        id: 'vitalsPulse',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              context.grammer = grammer.vitalsPulse;
              dialog.sendMessage(context, dialog.get_message(messages.vitalsPulse.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              if (event.message.type == 'text') {
                let pulse = parseInt(dialog.get_input(event, false));
                context.slots.vitals.pulse = pulse;
                context.validMessage = true;
                return;
              }
              context.validMessage = false;
            }),
            always: [
              {
                cond: (context) => context.slots.vitals.pulse,
                target: '#vitalsBreathing'
              },
              {
                target: 'error'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      vitalsBreathing: {
        id: 'vitalsBreathing',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              context.grammer = grammer.vitalsBreathing;
              dialog.sendMessage(context, dialog.get_message(messages.vitalsBreathing.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              if (event.message.type == 'text') {
                let breathing_rate = parseInt(dialog.get_input(event, false));
                context.slots.vitals.breathing_rate = breathing_rate;
                context.validMessage = true;
                return;
              }
              context.validMessage = false;
            }),
            always: [
              {
                cond: (context) => context.slots.vitals.breathing_rate,
                target: '#vitalsTemperature'
              },
              {
                target: 'error'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      vitalsSpo2Walk: {
        id: 'vitalsSpo2Walk',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              context.grammer = grammer.vitalsSpo2Walk;
              let message = dialog.get_message(messages.vitalsSpo2Walk.prompt, context.user.locale);
              message = message.replace('{{name}}', context.slots.vitals.person.first_name);
              dialog.sendMessage(context, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
              context.slots.vitals.spo2 = context.intention
            }),
            always: [
              {
                cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                target: 'error'
              },
              {
                cond: (context) => context.slots.vitals.spo2 == 'good',
                target: '#vitalsTemperature'
              },
              {
                cond: (context) => context.slots.vitals.spo2 == 'bad',
                actions: assign((context, event) => {
                  let message = dialog.get_message(messages.vitalsSpo2WalkBad.prompt, context.user.locale);
                  message = message.replace('{{name}}', context.slots.vitals.person.first_name);
                  dialog.sendMessage(context, message);
                }),
                target: '#unsubscribePerson'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      vitalsTemperature: {
        id: 'vitalsTemperature',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              context.grammer = grammer.vitalsTemperature;
              dialog.sendMessage(context, dialog.get_message(messages.vitalsTemperature.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
              context.slots.vitals.temperature = context.intention
            }),
            always: [
              {
                cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                target: 'error'
              },
              {
                cond: (context) => context.slots.vitals.temperature == 'good',
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.temperatureGood, context.user.locale));
                }),
                target: '#addVitals'
              },
              {
                cond: (context) => context.slots.vitals.temperature == 'bad',
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.temperatureBad, context.user.locale));
                }),
                target: '#addVitals'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      addVitals: {
        id: 'addVitals',
        invoke: {
          src: (context) => vitalsService.addVitals(context.slots.vitals),
          onDone: {
            target: '#endstate'
          }
        }
      }
    }
  },
  downloadReport: {
    id: 'downloadReport',
    initial: 'reportFetchPersons',
    onEntry: assign((context, event) => {
      context.slots.report = {};
    }),
    states: {
      reportFetchPersons: {
        invoke: {
          src: (context) => personService.getSubscribedPeople(context.user.mobileNumber),
          // TODO: Need to update this: do no include people who have not completed traige flow
          // src: (context) => personService.getPeople(context.user.mobileNumber),
          onDone: [
            {
              cond: (context, event) => event.data.length == 0,
              target: '#reportNoUserFound'
            },
            {
              cond: (context, event) => event.data.length == 1,
              actions: assign((context, event) => {
                context.slots.report.person = event.data[0];
              }),
              target: '#showReport'
            },
            {
              cond: (context, event) => event.data.length > 1,
              actions: assign((context, event) => {
                context.persons = event.data;
              }),
              target: '#reportSelectPerson'
            }
          ]
        }
      },
      reportNoUserFound: {
        id: 'reportNoUserFound',
        onEntry: assign((context, event) => {
          dialog.sendMessage(context, dialog.get_message(messages.noUserFound, context.user.locale), false);
        }),
        always: '#selfCareMenu'
      },
      reportSelectPerson: {
        id: 'reportSelectPerson',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.reportSelectPerson.prompt, context.user.locale);
              let persons = context.persons;
              let grammer = [];
              for (let i = 0; i < persons.length; i++) {
                let person = persons[i];
                let grammerItem = { intention: person.uuid, recognize: [(i + 1).toString()] };
                grammer.push(grammerItem);
                message += '\n' + (i + 1) + '. ' + person.first_name;
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
              context.intention = dialog.get_intention(context.grammer, event, true);
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
                  context.slots.report.person = person;
                }),
                target: '#showReport'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      showReport: {
        id: 'showReport',
        invoke: {
          src: (context) => triageService.downloadReportForPerson(context.slots.report.person),
          onDone: {
            actions: assign((context, event) => {
              const media = event.data;
              const split = media.split('/');
              const fileName = split[split.length - 1];
              const message =  {
                "type": "media",
                "output": media,
                "caption": fileName
              }
              dialog.sendMessage(context, message);
            }),
            target: '#endstate'
          }
        }
      }
    }
  },
  exitProgram: {
    id: 'exitProgram',
    initial: 'exitProgramFetchPersons',
    onEntry: assign((context, event) => {
      context.slots.exitProgram = {};
    }),
    states: {
      exitProgramFetchPersons: {
        invoke: {
          src: (context) => personService.getSubscribedPeople(context.user.mobileNumber),
          onDone: [
            {
              cond: (context, event) => event.data.length == 0,
              target: '#exitProgramNoUserFound'
            },
            {
              cond: (context, event) => event.data.length == 1,
              actions: assign((context, event) => {
                context.slots.exitProgram.person = event.data[0];
              }),
              target: '#exitReason'
            },
            {
              cond: (context, event) => event.data.length > 1,
              actions: assign((context, event) => {
                context.persons = event.data;
              }),
              target: '#exitProgramSelectPerson'
            }
          ]
        }
      },
      exitProgramNoUserFound: {
        id: 'exitProgramNoUserFound',
        onEntry: assign((context, event) => {
          dialog.sendMessage(context, dialog.get_message(messages.noUserFound, context.user.locale), false);
        }),
        always: '#selfCareMenu'
      },
      exitProgramSelectPerson: {
        id: 'exitProgramSelectPerson',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.exitProgram.exitPersonSelection.prompt, context.user.locale);
              let persons = context.persons;
              let grammer = [];
              for (let i = 0; i < persons.length; i++) {
                let person = persons[i];
                let grammerItem = { intention: person.uuid, recognize: [(i + 1).toString()] };
                grammer.push(grammerItem);
                message += '\n' + (i + 1) + '. ' + person.first_name;
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
              context.intention = dialog.get_intention(context.grammer, event, true);
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
                  context.slots.exitProgram.person = person;
                }),
                target: '#exitReason'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      exitReason: {
        id: 'exitReason',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              context.grammer = grammer.exitReason;
              dialog.sendMessage(context, dialog.get_message(messages.exitProgram.exitReason.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
            }),
            always: [
              {
                cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                target: 'error'
              },
              {
                actions: assign((context, event) => {
                  context.slots.exitProgram.exitReason = context.intention
                }),
                target: '#exitFeedback'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
            }),
            always: 'prompt'
          }
        }
      },
      exitFeedback: {
        id: 'exitFeedback', 
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.exitProgram.exitFeedback.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.slots.exitProgram.exitFeedback = dialog.get_input(event, false);
            }),
            always: '#unsubscribePerson'
          }
        }
      },
      unsubscribePerson: {
        id: 'unsubscribePerson',
        invoke: {
          src: (context) => {
            let person = context.slots.exitProgram.person;
            return triageService.exitProgram(person, context.slots.exitProgram)
          },
          onDone: {
            actions: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.exitProgram.unsubscribedSuccessfully, context.user.locale));
            }),
            target: '#endstate'
          }
        }
      }
    }
  }
}

module.exports = selfCareFlow;