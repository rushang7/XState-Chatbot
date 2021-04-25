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
                target: '#vitalsSpo2'
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
              context.grammer = grammer.vitalsSpo2;
              dialog.sendMessage(context, dialog.get_message(messages.vitalsSpo2.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event);
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
                cond: (context) => context.slots.vitals.spo2 == 'recheck',
                target: '#vitalsSpo2Walk'
              },
              {
                cond: (context) => context.slots.vitals.spo2 == 'bad',
                target: '#vitalsSpo2Walk'
              },
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
              context.intention = dialog.get_intention(context.grammer, event);
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
              context.grammer = grammer.vitalsTemperature;
              dialog.sendMessage(context, dialog.get_message(messages.vitalsTemperature.prompt, context.user.locale));
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event);
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
                  dialog.sendMessage(context, dialog.get_message(messages.temperatureGood, context.user.locale), false);
                }),
                target: '#addVitals'
              },
              {
                cond: (context) => context.slots.vitals.temperature == 'bad',
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.temperatureBad, context.user.locale), false);
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
      en_IN: 'Please select the patient whose vitals you want to add:\n\n'
    }
  },
  userConsent: {
    prompt: {
      en_IN: 'Consent Message'
    }
  },
  vitalsSpo2: {
    prompt: {
      en_IN: 'Please look for the oximeter, put it on your finger and let the number stabilize. Now tell me what your pulse oximeter says? \n\n1.SpO2 is 95 and above \n2.SpO2 is between 90 and 94% \n3.SpO2 is below 90%'
    }
  },
  vitalsSpo2Bad: {
    en_IN: '{{name}}, your current oxygen level  is  well  below the normal value. I suggest you consult a doctor right away! Besides medications, you may need some additional oxygen support. \n\nTo consult a doctor click here. For more information regarding COVID-19 click here'
  },
  vitalsSpo2Walk: {
    prompt: {
      en_IN: '{{name}}, your SpO2 should ideally be between 95 and 99.  I just want to make sure that your lungs are not getting weak. I would suggest doing a simple test right now. All you need to do is walk around inside your room for 6 minutes with the pulse oximeter on your finger. Keep an eye out for the SpO2 all through the 6 minutes. \nLet me know how it goes. \n\n1. SpO2 fell below 93 (at any point during the test)\n2. SpO2 fell by 3 points (at any point during the test)\n3.  Felt light headed (at any point during the test)\n4. Difficulty breathing (at any point during the test)\n5. None of the above'
    }
  },
  vitalsSpo2WalkBad: {
    prompt: {
      en_IN: '{{name}}, this reaction to the walk test is not normal. I suggest you consult a doctor right away! Besides medications, you may need some additional oxygen support. \n\n To consult a doctor click here. For more information regarding COVID-19 click here'
    }
  },
  vitalsTemperature: {
    prompt: {
      en_IN: 'Your oxygen level is looking good. Now let\'s check your temperature with your thermometer.\n\n 1. 99 and above \n 2. 98 and below'
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
  temperatureGood: {
    en_IN: 'No fever! Your SpO2 and your temperature are both normal! Let’s keep it that way. I will check up on you again in a few hours to see how you are feeling!'
  },
  temperatureBad: {
    en_IN: 'Looks like you have a fever. You will need  to take antipyretic to bring the temperature back down. Please contact your doctor so that you can take the right medication. \nI will check up on you again in a few hours to see how you are feeling!'
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
  vitalsSpo2: [
    { intention: 'good', recognize: ['1'] },
    { intention: 'recheck', recognize: ['2'] },
    { intention: 'bad', recognize: ['3'] }
  ],
  vitalsTemperature: [
    { intention: 'bad', recognize: ['1'] },
    { intention: 'good', recognize: ['2'] }
  ],
  vitalsSpo2Walk: [
    { intention: 'bad', recognize: ['1', '2', '3', '4'] },
    { intention: 'good', recognize: ['5'] }
  ],
  exitReason: [
    { intention: 'NoCovid', recognize: ['1'] },
    { intention: 'TooManyMessages', recognize: ['2'] },
    { intention: 'EscalationRequired', recognize: ['3'] }
  ]
}

module.exports = selfCareFlow;