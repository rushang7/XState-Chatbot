let messages = {
  personName: {
    prompt: {
      en_IN: 'Got it, please tell me your name'
    },
    error: {
      en_IN: 'I am sorry, I didn\'t understand. Please enter a valid name which is less than 100 characters.'
    }
  },
  personAge: {
    prompt: {
      en_IN: 'Thanks {{name}}. How old are you?'
    },
    error: {
      en_IN: 'I am sorry, I didn\'t understand. Please enter a valid age (between 0 and 120)'
    }
  },
  personGender: {
    prompt: {
      en_IN: 'Please select your gender.'
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
      en_IN: 'Thanks for this information {{name}}! Do you have one or more of these complaints?: \n- Fever\n- Cough with or without spit/Sore throat\n- Loss of smell/taste\n- Runny nose\n- Difficulty breathing/Persistent pain/pressure in the chest\n- Muscle pain\n- Nausea & loose motions\n- Bluish discolorations of lips/face\n- Inability to eat / drink / walk\n'
    }
  },
  rtpcr: {
    prompt: {
      en_IN: 'What was the result of your RT-PCR test: \n1. Positive\n2. Negative\n3. Result Awaited or Not done'
    }
  },
  comorbidity: {
    prompt: {
      male: {
        en_IN: 'Do you have one or more of these conditions? \n- Diabetes\n- Hypertension\n- Chronic lung disease\n- Immunocompromised state\n- Heart disease\n- Obesity\n',
      },
      female: {
        en_IN: 'Do you have one or more of these conditions? \n- Diabetes\n- Hypertension\n- Chronic lung disease\n- Immunocompromised state\n- Heart disease\n- Obesity\n- Pregnancy\n'
      }
    }
  },
  endFlow: {
    ageConsultDoctorEnd: {
      en_IN: '{{name}}, your age poses an additional risk factor! It would be best, if you consulted a doctor right away so that you can undergo tests if required and start the right medication. \nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network'
    },
    symptomComorbidConsultDoctorEnd: {
      en_IN: '{{name}} your current symptoms along with your other medical condition(s) are making the situation risky. It would be best, if you consulted a doctor right away so that you can undergo a few tests and start the right medication.\n\nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    testComorbidConsultDoctorEnd: {
      en_IN: '{{name}} your test result along with your other medical condition(s) are making the situation risky. \nIt would be best, if you  consulted a doctor right away so that you can undergo tests and start the right medication.\n\nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    precautionEnd: {
      en_IN: '{{name}}, based on your responses,  your chances of getting COVID-19 are higher than that of the  average population. I suggest following these simple tips to stay healthy!!\n- Wear N95 mask covering both mouth and nose\n- Take adequate rest 7-8 hours a day\n- Drink a lot of fluids to stay hydrated\n- Eat a healthy low carbohydrate, high protein diet\n- Avoid alcohol intake and quite smoking\n- Exercise , practise yoga and meditate\n\nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    noCovidEnd: {
      en_IN: '{{name}}, based on your responses, it is less likely that you are suffering from COVID-19. I suggest following these simple tips to stay healthy!\n1. Wear N95 mask covering both mouth and nose\n2. Take adequate rest 7-8 hrs a day and drink a lot of fluids to stay hydrated.\n3. Eat a healthy low carbohydrate, high protein diet.\n4. Avoid alcohol intake and quit smoking.\n5. Exercise, practise yoga and meditate.\n\nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    lowSpo2End: {
      en_IN: '{{name}}, your current oxygen level is below the normal value. Please consult a doctor right away! \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    noOximeterEnd: {
      en_IN: '{{name}}, your oxygen level is one of the most important parameters to gauge the severity of your condition. Please order a pulse oximeter right away. \nSend me a message when you have it so we can begin monitoring your vitals.'
    },
    walkTestEnd: {
      en_IN: '{{name}}, this is an unexpected reaction to the walk test. Please consult a doctor right away. \n\nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network'
    }
  },
  triageSpo2: {
    prompt: {
      preamble: {
        en_IN: 'I hope you have a pulse oximeter at home, {{name}}. Plese check your SpO2 and select an option from below'
      },
      options: {
        list: [ 'above95', '90to94', 'below90', 'noOximeter' ],
        messageBundle: {
          above95: {
            en_IN: 'SpO2 is 95% or above'
          },
          '90to94': {
            en_IN: 'SpO2 is between 90 and  94%'
          }, 
          below90: {
            en_IN: 'SpO2 is below 90%'
          }, 
          noOximeter: {
            en_IN: 'Don’t have an oximeter'
          }
        }
      }
    },
    normalSpo2: {
      en_IN: 'Your SpO2 is well within the normal range! This is a good sign! :)'
    },
  },
  triageSpo2Walk: {
    prompt: {
      preamble: {
        en_IN: '{{name}}, your SpO2 should ideally be between 95 and 99.  I want to make sure that your lungs are not getting weak. I would suggest doing a simple test right now. All you need to do is walk around alone without a mask for 6 minutes with the pulse oximeter on your finger. Keep an eye out for the SpO2 all through the 6 minutes.\nLet me know how it goes.'
      },
      options: {
        list: [ 'below93', 'lightHeaded', 'breathingDifficulty', 'none' ],
        messageBundle: {
          below93: {
            en_IN: 'SpO2 fell below 93 or reduced by 3 points or more (at any point during the test)'
          }, 
          lightHeaded: {
            en_IN: 'Felt light headed (at any point during the test)'
          },
          breathingDifficulty: {
            en_IN: 'Difficulty breathing (at any point during the test)'
          }, 
          none: {
            en_IN: 'None of the above'
          }
        }
      }
    },
    normalSpo2: {
      en_IN: 'Your current oxygen levels are good.'
    }
  },
  subscribe: {
    prompt: {
      preamble: {
        en_IN: '{{name}}, I will be following up with you to ensure you get better right at home by:\n- Making you check your vitals regularly\n- Maintaining your SpO2 and temperature chart  \n- Sharing scientifically accurate health information\n- Helping you cope with isolation \n- Supporting your family members if COVID assistance is needed\n'
      },
      options: {
        list: [ true, false ],
        messageBundle: {
          true: {
            en_IN: 'Let\'s do this'
          },
          false: {
            en_IN: 'Not now'
          }
        }
      }
    },
    doSubscribe: {
      en_IN: 'That\'s awesome, {{name}}! Thank you for choosing me as your aid to recovery. If you want any more details about my guided recovery program or want to make any modifications, please use the Manage program option in the main menu. I will be in touch with you again in a few hours to check on you. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    dontSubscribe: {
      en_IN: 'Ok. You can always come back when you need help. \nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network'
    }
  },
}

let grammers = {
  binaryChoice: {
    prompt: {
      en_IN: '\n1. Yes\n2. No'
    },
    grammer: [
      { intention: true, recognize: ['1'] },
      { intention: false, recognize: ['2'] }
    ],
  },
  rtpcrTest: [
    { intention: 'positive', recognize: ['1'] },
    { intention: 'negative', recognize: ['2'] },
    { intention: 'na', recognize: ['3'] },
  ],
}

module.exports.messages = messages;
module.exports.grammers = grammers;