const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const mediaUtil = require('./util/media');
const { personService, triageService } = require('./service/service-loader');
const { messages, grammers } = require('./messages/triage');
const config = require('../../src/env-variables');

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
          invoke: {
            src: (context, event) => personService.validateName(context, event),
            onDone: [
              {
                cond: (context, event) => event.data == 'invalid',
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.personName.error, context.user.locale));
                }),
                target: 'waitForUserInput'
              },
              {
                cond: (context, event) => event.data == 'duplicate',
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.personName.duplicateError, context.user.locale));
                }),
                target: 'waitForUserInput'
              },
              {
                cond: (context, event) => event.data,
                actions: assign((context, event) => {
                  context.slots.triage.person.first_name = event.data;
                }),
                target: '#personAge'
              },
            ]
          },
          // 2
        },
        waitForUserInput: {
          on: {
            USER_MESSAGE: 'process'
          }
        }
      }
    }, // personName
    personAge: {
      id: 'personAge',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.personAge.prompt, context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              let age = parseInt(dialog.get_input(event, false));
              if (age > 0 && age < 120) {
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
            context.intention = dialog.get_intention(context.grammer, event, true);
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
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
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
            context.slots.triage.person = event.data;
          }),
          target: '#specialSymptoms'
        }
        // TODO: handle duplicate person??
      }
    },
    specialSymptoms: {
      id: 'specialSymptoms',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.specialSymptoms.prompt, context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            message += dialog.get_message(grammers.binaryChoice.prompt, context.user.locale);
            context.grammer = grammers.binaryChoice.grammer;
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
              cond: (context) => context.intention === true,
              actions: assign((context, event) => {
                  context.slots.triage.symptoms = context.intention
                  let message = dialog.get_message(messages.endFlow.specialSymptomsEnd, context.user.locale);
                  message = message.replace('{{name}}', context.slots.triage.person.first_name);
                  dialog.sendMessage(context, message);
                }),
              target: '#upsertTriageDetails'
            },
            {
              cond: (context) => context.intention === false,
              target: '#triageSpo2'
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
    symptoms: {
      id: 'symptoms',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.symptoms.prompt, context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            message += dialog.get_message(grammers.binaryChoice.prompt, context.user.locale);
            context.grammer = grammers.binaryChoice.grammer;
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
                context.slots.triage.symptoms = context.intention
              }),
              target: '#rtpcr'
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
    rtpcr: {
      id: 'rtpcr',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammers.rtpcrTest;
            dialog.sendMessage(context, dialog.get_message(messages.rtpcr.prompt, context.user.locale));
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
                context.slots.triage.rtpcr = context.intention
              }),
              target: '#triageEvaluator1'
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
    triageEvaluator1: {
      id: 'triageEvaluator1',
      onEntry: assign((context, event) => {
        let triage = context.slots.triage;
        if(triage.person.age >= 60 && (triage.symptoms || triage.rtpcr == 'positive')) {
          context.slots.triage.conclusion = 'ageConsultDoctorEnd'
        }
      }),
      always: [
        {
          cond: (context) => context.slots.triage.conclusion == 'ageConsultDoctorEnd',
          actions: assign((context, event) => {
            let message = dialog.get_message(messages.endFlow.ageConsultDoctorEnd, context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            dialog.sendMessage(context, message);
          }),
          target: '#upsertTriageDetails'
        },
        {
          target: '#comorbidity'
        }
      ]
    },
    comorbidity: {
      id: 'comorbidity',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammers.binaryChoice.grammer;
            let message = '';
            if (context.slots.triage.person.gender == 'female')
              message = dialog.get_message(messages.comorbidity.prompt.female, context.user.locale);
            else
              message = dialog.get_message(messages.comorbidity.prompt.male, context.user.locale);
            message += dialog.get_message(grammers.binaryChoice.prompt, context.user.locale);
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
                context.slots.triage.isComorbid = context.intention;
              }),
              target: '#triageEvaluator2'
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
    triageEvaluator2: {
      id: 'triageEvaluator2',
      onEntry: assign((context, event) => {
        let triage = context.slots.triage;
        if(triage.symptoms && triage.isComorbid) {
          context.slots.triage.conclusion = 'symptomComorbidConsultDoctorEnd';
        } else if(triage.rtpcr == 'positive' && triage.isComorbid) {
          context.slots.triage.conclusion = 'testComorbidConsultDoctorEnd';
        } else if(triage.isComorbid) {
          context.slots.triage.conclusion = 'precautionEnd';
        } else if(!triage.symptoms && !triage.isComorbid && triage.rtpcr != 'positive') {
          context.slots.triage.conclusion = 'noCovidEnd';
        }
      }),
      always: [
        {
          cond: (context) => (context.slots.triage.symptoms || context.slots.triage.rtpcr == 'positive'),
          target: '#subscribe'
        },
        {
          cond: (context) => context.slots.triage.conclusion,
          actions: assign((context, event) => {
            let message = dialog.get_message(messages.endFlow[context.slots.triage.conclusion], context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            dialog.sendMessage(context, message);

            if (context.slots.triage.conclusion == 'noCovidEnd' && (context.user.locale == 'en_IN' || context.user.locale == 'hi_IN')) {
              const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/home_isolation_todo`, 'jpeg', context.user.locale);
              dialog.sendMessage(context, mediaMessage);
            }
          }),
          target: '#upsertTriageDetails'
        }
      ]
    },
    triageSpo2: {
      id: 'triageSpo2',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            if (context.user.locale == 'en_IN' || context.user.locale == 'hi_IN') {
              const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/pulse_oximeter`, 'jpeg', context.user.locale);
              dialog.sendMessage(context, mediaMessage);
            }

            let message = dialog.get_message(messages.triageSpo2.prompt.preamble, context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.triageSpo2.prompt.options.list, messages.triageSpo2.prompt.options.messageBundle, context.user.locale);
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
            context.intention = dialog.get_intention(context.grammer, event, true);
          }),
          always: [
            {
              cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
              target: 'error'
            },
            {
              cond: (context) => context.intention == 'above95',
              actions: assign((context, event) => {
                context.slots.triage.spo2 = context.intention;
                // dialog.sendMessage(context, dialog.get_message(messages.triageSpo2.normalSpo2, context.user.locale), false);
              }),
              target: '#symptoms'
            },
            {
              cond: (context) => context.intention == 'below94',
              actions: assign((context, event) => {
                context.slots.triage.spo2 = context.intention;
                context.slots.triage.conclusion = 'lowSpo2End'
                let message = dialog.get_message(messages.endFlow.lowSpo2End, context.user.locale);
                message = message.replace('{{name}}', context.slots.triage.person.first_name);
                dialog.sendMessage(context, message);
              }),
              target: '#upsertTriageDetails'
            },
            {
              cond: (context) => context.intention = 'noOximeter',
              actions: assign((context, event) => {
                context.slots.triage.spo2 = context.intention;
                context.slots.triage.conclusion = 'noOximeterEnd';
                let message = dialog.get_message(messages.endFlow.noOximeterEnd, context.user.locale)
                message = message.replace('{{name}}', context.slots.triage.person.first_name);
                dialog.sendMessage(context, message);
              }),
              target: '#upsertTriageDetails'
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
    triageSpo2Walk: {
      id: 'triageSpo2Walk',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.triageSpo2Walk.prompt.preamble, context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.triageSpo2Walk.prompt.options.list, messages.triageSpo2Walk.prompt.options.messageBundle, context.user.locale);
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
            context.intention = dialog.get_intention(context.grammer, event, true);
          }),
          always: [
            {
              cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
              target: 'error'
            },
            {
              cond: (context) => context.intention == 'none',
              actions: assign((context, event) => {
                context.slots.triage.spo2Walk = context.intention;
                dialog.sendMessage(context, dialog.get_message(messages.triageSpo2Walk.normalSpo2, context.user.locale), false);
              }),
              target: '#subscribe'
            },
            {
              actions: assign((context, event) => {
                context.slots.triage.spo2Walk = context.intention;
                let message = dialog.get_message(messages.endFlow.walkTestEnd, context.user.locale);
                message = message.replace('{{name}}', context.slots.triage.person.first_name);
                dialog.sendMessage(context, message);
              }),
              target: '#upsertTriageDetails'
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
    subscribe: {
      id: 'subscribe',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.subscribe.prompt.preamble, context.user.locale);
            message = message.replace('{{name}}', context.slots.triage.person.first_name);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.subscribe.prompt.options.list, messages.subscribe.prompt.options.messageBundle, context.user.locale);
            message += prompt;
            context.grammer = grammer;
            dialog.sendMessage(context, message);

            if (context.user.locale == 'en_IN' || context.user.locale == 'hi_IN') {
              const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/ways_to_use_chat_bot`, 'jpeg', context.user.locale);
              dialog.sendMessage(context, mediaMessage);
            }
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
                context.slots.triage.subscribe = context.intention;
                let message;
                if(context.intention == true) {
                  message = dialog.get_message(messages.subscribe.doSubscribe, context.user.locale);
                  message = message.replace('{{name}}', context.slots.triage.person.first_name);
                } else {
                  message = dialog.get_message(messages.subscribe.dontSubscribe, context.user.locale);
                }
                dialog.sendMessage(context, message);
              }),
              target: '#upsertTriageDetails'
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
    upsertTriageDetails: {
      id: 'upsertTriageDetails',
      invoke: {
        src: (context) => triageService.upsertTriageDetails(context.slots.triage.person, context.slots.triage),
        onDone: {
          target: '#endstate'
        }
      }
    }
  }
}

module.exports = triageFlow;
