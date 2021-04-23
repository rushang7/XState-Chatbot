const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const { personService, vitalsService, triageService } = require('./service/service-loader');

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
          src: (context) => personService.getPersonsForMobileNumber(context.user.mobileNumber),
          onDone: [
            {
              cond: (context, event) => event.data.length == 0,
              target: '#noUserFound'
            },
            {
              cond: (context, event) => event.data.length == 1,
              actions: assign((context, event) => {
                context.slots.vitals.person = event.data[0];
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
              for (let i = 0; i < persons.length; i++) {
                let person = persons[i];
                let grammerItem = { intention: person.uuid, recognize: [(i + 1).toString()] };
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
                  context.slots.vitals.person = person;
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
                cond: (context) => context.intention == true,
                target: '#vitalsSpo2'
              },
              {
                target: '#consentDenied'
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
      vitalsSpo2: {
        id: 'vitalsSpo2',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.vitalsSpo2.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let spo2 = parseInt(dialog.get_input(event));
              if (spo2 > 0 && spo2 <= 100) {
                context.validMessage = true;
                context.slots.vitals.spo2 = spo2;
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
                cond: (context) => context.slots.vitals.spo2 > 95,
                target: '#vitalsTemperature'
              },
              {
                cond: (context) => context.slots.vitals.spo2 <= 95 && context.slots.vitals.spo2 >= 90,
                target: '#vitalsSpo2Walk'
              },
              {
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.covidfyLinkBedAvailability, context.user.locale), false);
                }),
                target: '#addVitals'
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
      vitalsSpo2Walk: {
        id: 'vitalsSpo2Walk',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.vitalsSpo2Walk.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let spo2 = parseInt(dialog.get_input(event));
              if (spo2 > 0 && spo2 <= 100) {
                context.validMessage = true;
                context.slots.vitals.spo2Walk = spo2;
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
                cond: (context) => context.slots.vitals.spo2Walk > 95,
                target: '#vitalsTemperature'
              },
              {
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.covidfyLinkPhysicalConsult, context.user.locale), false);
                }),
                target: '#addVitals'
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
      vitalsTemperature: {
        id: 'vitalsTemperature',
        initial: 'prompt',
        states: {
          prompt: {
            onEntry: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.vitalsTemperature.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let temperature = parseFloat(dialog.get_input(event));
              if (temperature > 92 && temperature <= 108) {
                context.validMessage = true;
                context.slots.vitals.temperature = temperature;
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
                cond: (context) => context.slots.vitals.temperature <= 98,
                target: '#addVitals'
              },
              {
                cond: (context) => context.slots.vitals.temperature > 98 && context.slots.vitals.temperature <= 102,
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.adviseParacetamol, context.user.locale), false);
                }),
                target: '#addVitals'
              },
              {
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.covidfyLinkBedAvailability, context.user.locale), false);
                }),
                target: '#addVitals'
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
      addVitals: {
        id: 'addVitals',
        invoke: {
          src: (context) => vitalsService.addVitals(context.slots.vitals),
          onDone: {
            target: '#vitalsRecordedSuccesfully'
          }
        }
      },
      vitalsRecordedSuccesfully: {
        id: 'vitalsRecordedSuccesfully',
        onEntry: assign((context, event) => {
          dialog.sendMessage(context, dialog.get_message(messages.vitalsRecordedSuccesfully, context.user.locale));
        }),
        always: '#endstate'
      },
      consentDenied: {
        id: 'consentDenied',
        onEntry: assign((context, event) => {
          dialog.sendMessage(context, dialog.get_message(messages.consentdenied, context.user.locale));
        }),
        always: '#endstate'
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
          src: (context) => personService.getPersonsForMobileNumber(context.user.mobileNumber),
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
              let message = dialog.get_message(messages.selectPerson.prompt, context.user.locale);
              let persons = context.persons;
              let grammer = [];
              for (let i = 0; i < persons.length; i++) {
                let person = persons[i];
                let grammerItem = { intention: person.uuid, recognize: [(i + 1).toString()] };
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
                  context.slots.report.person = person;
                }),
                target: '#showReport'
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
      showReport: {
        id: 'showReport',
        invoke: {
          src: (context) => triageService.downloadReportForPerson(context.slots.report.person),
          onDone: {
            actions: assign((context, event) => {
              dialog.sendMessage(context, '_Report_');
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
          src: (context) => personService.getPersonsForMobileNumber(context.user.mobileNumber),
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
              let message = dialog.get_message(messages.selectPerson.prompt, context.user.locale);
              let persons = context.persons;
              let grammer = [];
              for (let i = 0; i < persons.length; i++) {
                let person = persons[i];
                let grammerItem = { intention: person.uuid, recognize: [(i + 1).toString()] };
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
                  context.slots.exitProgram.person = person;
                }),
                target: '#exitReason'
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
              context.intention = dialog.get_intention(context.grammer, event);
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
                target: '#unsubscribePerson'
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
      unsubscribePerson: {
        id: 'unsubscribePerson',
        invoke: {
          src: (context) => triageService.exitProgram(context.slots.exitProgram.person, context.slots.exitProgram.exitReason),
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
  },
  vitalsSpo2: {
    prompt: {
      en_IN: 'Please enter your blood oxygen level.'
    }
  },
  vitalsSpo2Walk: {
    prompt: {
      en_IN: 'Could you please walk for 6 minutes and re-measure the oxygen level?'
    }
  },
  vitalsTemperature: {
    prompt: {
      en_IN: 'Please enter your temperature'
    }
  },
  vitalsRecordedSuccesfully: {
    en_IN: 'Your vitals have been recorded successfully'
  },
  consentdenied: {
    en_IN: 'Consent Denied'
  },
  covidfyLinkPhysicalConsult: {                 // Duplicacy with message in triage file
    en_IN: 'CovidfyLinkPhysicalConsult'
  },
  covidfyLinkBedAvailability: {                 // Duplicacy with message in triage file
    en_IN: 'CovidfyLinkBedAvailability Message'
  },
  adviseParacetamol: {
    en_IN: 'Advise Paracetamol'
  },
  exitProgram: {
    exitReason: {
      prompt: {
        en_IN: 'Why are you exiting the program: \n1. Patient no longer has CoVID\n2. Too many WhatsApp Messages\n3. Escalation Required'
      }
    },
    unsubscribedSuccessfully: {
      en_IN: 'You have successfully unsubscribed from the program'
    }
  }
}

let grammer = {
  binaryChoice: [
    { intention: true, recognize: ['yes', 'y'] },
    { intention: false, recognize: ['no', 'n'] }
  ],
  exitReason: [
    { intention: 'NoCovid', recognize: ['1'] },
    { intention: 'TooManyMessages', recognize: ['2'] },
    { intention: 'EscalationRequired', recognize: ['3'] }
  ]
}

module.exports = selfCareFlow;