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
            if (event.message.type == 'text' && event.message.input.length < 100) {
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
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammer.binaryChoice;
            dialog.sendMessage(context, dialog.get_message(messages.contactedCovidPerson.prompt, context.user.locale));
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
                context.slots.triage.contactedCovidPerson = context.intention;
              }),
              target: '#rtpcr'
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
    rtpcr: {
      id: 'rtpcr',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammer.rtpcrTest;
            dialog.sendMessage(context, dialog.get_message(messages.rtpcr.prompt, context.user.locale));
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
                context.slots.triage.rtpcr = context.intention
              }),
              target: '#triageEvaluator1'
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
    triageEvaluator1: {
      id: 'triageEvaluator1',
      onEntry: assign((context, event) => {
        let triage = context.slots.triage;
        if (triage.symptoms == false && triage.contactedCovidPerson == false && (triage.rtpcr == 'negative' || triage.rtpcr == 'na')) {
          context.slots.triage.conclusion = 'NoCovid'
        }
      }),
      always: [
        {
          cond: (context) => context.slots.triage.conclusion == 'NoCovid',
          target: '#nonPharmacologicalInterventions'
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
            context.grammer = grammer.binaryChoice;
            let message = '';
            if (context.slots.triage.person.gender == 'female')
              message = dialog.get_message(messages.comorbidity.prompt.female, context.user.locale);
            else
              message = dialog.get_message(messages.comorbidity.prompt.male, context.user.locale);
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
                context.slots.triage.isComorbid = context.intention;
              }),
              target: '#triageEvaluator2'
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
    triageEvaluator2: {
      id: 'triageEvaluator2',
      always: [
        {
          cond: (context) => context.slots.triage.person.age > 60 || context.slots.triage.isComorbid,
          target: '#covidfyLinkPhysicalConsult'
        },
        {
          target: '#triageSpo2'
        }
      ]
    },
    triageSpo2: {
      id: 'triageSpo2',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.triageSpo2.prompt, context.user.locale));
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
              context.slots.triage.spo2 = spo2;
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
              cond: (context) => context.slots.triage.spo2 > 95,
              actions: assign((context, event) => {
                context.slots.triage.conclusion = 'self-care'
              }),
              target: '#spaceAvailability'         // TODO: Replace with initial consult state name (triage details haven't been upserted. the details are present in context.slots.triage)
            },
            {
              cond: (context) => context.slots.triage.spo2 <= 95 && context.slots.triage.spo2 >= 90,
              target: '#triageSpo2Walk'
            },
            {
              actions: assign((context, event) => {
                context.slots.triage.conclusion = 'CovidfyLinkBedAvailability'
              }),
              target: '#covidfyLinkBedAvailability'
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
    triageSpo2Walk: {
      id: 'triageSpo2Walk',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.triageSpo2Walk.prompt, context.user.locale));
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
              context.slots.triage.spo2Walk = spo2;
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
              cond: (context) => context.slots.triage.spo2Walk > 95,
              actions: assign((context, event) => {
                context.slots.triage.conclusion = 'self-care'
              }),
              target: '#spaceAvailability'         // TODO: Replace with initial consult state name (triage details haven't been upserted. the details are present in context.slots.triage) 
            },
            {
              target: '#covidfyLinkPhysicalConsult'
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
    spaceAvailability: {
      id: 'spaceAvailability',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammer.binaryChoice;
            dialog.sendMessage(context, dialog.get_message(messages.spaceAvailability.prompt, context.user.locale));
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
                context.slots.triage.spaceAvailability = context.intention
              }),
              target: '#caregiverAvailability'
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
    caregiverAvailability: {
      id: 'caregiverAvailability',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammer.binaryChoice;
            dialog.sendMessage(context, dialog.get_message(messages.caregiverAvailability.prompt, context.user.locale));
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
                context.slots.triage.caregiverAvailability = context.intention
              }),
              target: '#aarogyaSetuDownloaded'
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
    aarogyaSetuDownloaded: {
      id: 'aarogyaSetuDownloaded',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            console.log(context)
            context.grammer = grammer.binaryChoice;
            dialog.sendMessage(context, dialog.get_message(messages.aarogyaSetuDownloaded.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event);
            context.slots.triage.aarogyaSetuDownloaded = context.intention
          }),
          always: [
            {
              cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
              target: 'error'
            },
            {
              cond: (context) => context.slots.triage.spaceAvailability == false || context.slots.triage.caregiverAvailability == false,
              actions: assign((context, event) => {
                context.slots.triage.conclusion = 'covidfyLinkBedAvailability'
              }),
              target: '#covidfyLinkBedAvailability'
            },
            {
              actions: assign((context, event) => {
                context.slots.triage.conclusion = 'pharmacologicalInterventions'
              }),
              target: '#pharmacologicalInterventions'         // TODO: Replace with initial consult state name (triage details haven't been upserted. the details are present in context.slots.triage) 
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
    pharmacologicalInterventions: {
      id: 'pharmacologicalInterventions',
      onEntry: assign((context, event) => {
        context.slots.triage.conclusion = 'NoCovid';
        dialog.sendMessage(context, dialog.get_message(messages.pharmacologicalInterventions, context.user.locale));
      }),
      always: '#infectionControl'
    },
    infectionControl: {
      id: 'infectionControl',
      onEntry: assign((context, event) => {
        context.slots.triage.conclusion = 'NoCovid';
        dialog.sendMessage(context, dialog.get_message(messages.infectionControl, context.user.locale));
      }),
      always: '#nonPharmacologicalInterventions'
    },
    nonPharmacologicalInterventions: {
      id: 'nonPharmacologicalInterventions',
      onEntry: assign((context, event) => {
        context.slots.triage.conclusion = 'NoCovid';
        dialog.sendMessage(context, dialog.get_message(messages.nonPharmacologicalInterventions, context.user.locale));
      }),
      always: '#upsertTriageDetails'
    },
    covidfyLinkPhysicalConsult: {
      id: 'covidfyLinkPhysicalConsult',
      onEntry: assign((context, event) => {
        context.slots.triage.conclusion = 'CovidfyLinkPhysicalConsult';
        dialog.sendMessage(context, dialog.get_message(messages.covidfyLinkPhysicalConsult, context.user.locale));
      }),
      always: '#upsertTriageDetails'
    },
    covidfyLinkBedAvailability: {
      id: 'covidfyLinkBedAvailability',
      onEntry: assign((context, event) => {
        context.slots.triage.conclusion = 'CovidfyLinkBedAvailability';
        dialog.sendMessage(context, dialog.get_message(messages.covidfyLinkBedAvailability, context.user.locale));
      }),
      always: '#upsertTriageDetails'
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
      list: ['male', 'female', 'other'],
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
  },
  contactedCovidPerson: {
    prompt: {
      en_IN: 'Have you came in contact with any Covid-19 positive person?'
    }
  },
  rtpcr: {
    prompt: {
      en_IN: 'What is your RT-PCR test result: \n1. Covid-19 Prositive\n2. Covid-19 Negative\n3. Haven\'t taken RT-PCR test'
    }
  },
  comorbidity: {
    prompt: {
      male: {
        en_IN: 'Do you have any of the following comorbities: \n1. Diabetes\n2. Hypertension\n3. Chronic lung disease\n4. Immunocompromised state\n5. Ischemic heart disease\n6. Obesity\n\nPlease reply with Yes/No.',
      },
      female: {
        en_IN: 'Do you have any of the following comorbities: \n1. Diabetes\n2. Hypertension\n3. Chronic lung disease\n4. Immunocompromised state\n5. Ischemic heart disease\n6. Obesity\n7. Pregnancy\n\nPlease reply with Yes/No.'
      }
    }
  },
  triageSpo2: {
    prompt: {
      en_IN: 'Please enter your blood oxygen level.'
    }
  },
  triageSpo2Walk: {
    prompt: {
      en_IN: 'Could you please walk for 6 minutes and re-measure the oxygen level?'
    }
  },
  spaceAvailability: {
    prompt: {
      en_IN: 'Do you have a separate room and bathroom?\nPlease reply with Yes/No.'
    }
  },
  caregiverAvailability: {
    prompt: {
      en_IN: 'Do you have a caregiver available who is between 20-60 years of age?\nPlease reply with Yes/No.'
    }
  },
  aarogyaSetuDownloaded: {
    prompt: {
      en_IN: 'Have you downloaded the Aarogya Setu app?\nPlease reply with Yes/No.'
    }
  },
  nonPharmacologicalInterventions: {
    en_IN: 'Non Pharmacological Interventions Message'
  },
  pharmacologicalInterventions: {
    en_IN: 'Pharmacological Interventions Message'
  },
  infectionControl: {
    en_IN: 'Infection control home measures Message'
  },
  covidfyLinkPhysicalConsult: {
    en_IN: 'CovidfyLinkPhysicalConsult'
  },
  covidfyLinkBedAvailability: {
    en_IN: 'CovidfyLinkBedAvailability Message'
  }
}

let grammer = {
  binaryChoice: [
    { intention: true, recognize: ['yes', 'y'] },
    { intention: false, recognize: ['no', 'n'] }
  ],
  rtpcrTest: [
    { intention: 'positive', recognize: ['1'] },
    { intention: 'negative', recognize: ['2'] },
    { intention: 'na', recognize: ['3'] },
  ]
}

module.exports = triageFlow;
