let messages = {
  personName: {
    prompt: {
      en_IN: 'Got it, please tell me your/patient’s name'
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
      en_IN: 'Thanks for this information {{name}}! Do you have one or more of these complaints?: \n- Fever\n- Cough\n- Sore throat\n- Loss of smell\n- Loss of taste\n- Shortness of breath\n- Expectoration\n- Muscle pain\n- Runny nose\n- Nausea & diarrhoea\n'
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
        en_IN: 'Do you have one or more of these conditions? \n- Diabetes\n- Hypertension\n- Chronic lung disease\n- Immunocompromised state\n- Ischemic heart disease\n- Obesity\n',
      },
      female: {
        en_IN: 'Do you have one or more of these conditions? \n- Diabetes\n- Hypertension\n- Chronic lung disease\n- Immunocompromised state\n- Ischemic heart disease\n- Obesity\n- Pregnancy\n'
      }
    }
  },
  endFlow: {
    ageConsultDoctorEnd: {
      en_IN: '{{name}}, your age poses an additional risk factor! It would be best, if you consulted a doctor right away so that you can undergo a few tests and start the right medication at the right time. To consult a doctor click <here>. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    symptomComorbidConsultDoctorEnd: {
      en_IN: '{{name}} your current symptoms along with your other medical condition(s) are making the situation risky. It would be best, if you consulted a doctor right away so that you can undergo a few tests and start the right medication.\n\nTo consult a doctor click <here>. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    testComorbidConsultDoctorEnd: {
      en_IN: '{{name}} your test result along with your other medical condition(s) are making the situation risky. \nIt would be best, if you  consulted a doctor right away so that you can undergo a few tests and start the right medication at the right time.\n\nTo consult a doctor click here. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    precautionEnd: {
      en_IN: '{{name}}, based on your responses,  your chances of getting COVID-19  is higher than that of the  average population. I suggest that you exercise caution and strictly follow these simple tips to stay healthy!\n1. Stay home  \n2. Wear an n95 mask \n3. Wash your hands with soap frequently\n4. Exercise indoors, meditate\n5. Sleep 7-8 hours hours a day and consume a balanced diet\n\nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    noCovidEnd: {
      en_IN: '{{name}}, based on your responses, it is less likely that you are suffering from COVID-19 at this time. I suggest following these simple tips to stay healthy!\n1. Wear a triple layer medical mask appropriately (covering both mouth and nose and well fitted to the face)\n2. Take adequate rest 7-8 hrs a day and drink a lot of fluids to maintain adequate hydration.\n3. Eat a healthy low carbohydrate, high protein diet, with three meals per day,containing adequate vegetables and fruits.\n4. Avoid alcohol intake, quit smoking if the patient has any habits.\n5. Exercise, meditate or practise yoga.\n\nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    lowSpo2End: {
      en_IN: '{{name}}, your current oxygen level is well  below the normal value. I suggest you consult a doctor right away! Besides medications, you may need some additional oxygen support. \n\nTo consult a doctor click here. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    noOximeterEnd: {
      en_IN: '{{name}}, checking your oxygen levels is one of the most important parameters to gauge the severity of your condition. My advice is please order a pulse oximeter right away from your local medical store. \nSend me a message when you have it so we can begin monitoring your vitals.'
    },
    walkTestEnd: {
      en_IN: '{{name}}, this is an unexpected reaction to the walk test. I suggest you consult a doctor right away! Besides medications, you may need some additional oxygen support. \n\nTo consult a doctor click here. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    }
  },
  triageSpo2: {
    prompt: {
      preamble: {
        en_IN: 'I hope you have a pulse oximeter at home, {{name}}. Check your SpO2. (For more information about a pulse oximeter and to learn how to use an oximeter click <here>)'
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
      en_IN: 'Your SpO2 is well within the normal range! This is a good sign! :) \nI suggest speaking to a doctor so that you can start a few medications to feel better. \nBesides that follow these 5  steps to rid this infection sooner!\n\n1. Take adequate rest 7-8 hrs a day and drink a lot of fluids to maintain adequate hydration.\n2. Eat a healthy low carbohydrate, high protein diet, with three meals per day,containing adequate vegetables and fruits.\n3. Avoid alcohol intake, quit smoking if the patient has any habits.\n4. Exercise, meditate or practise yoga\n5. Exercise your lungs by trying these breathing exercises\n\nClick <here> to know what more you can do to speed up your recovery'
    },
  },
  triageSpo2Walk: {
    prompt: {
      preamble: {
        en_IN: '{{name}}, your SpO2 should ideally be between 95 and 99. I just want to make sure that your lungs are not getting weak. I would suggest doing a simple test right now. All you need to do is walk around inside your room for 6 minutes with the pulse oximeter on your finger. Keep an eye out for the SpO2 all through the 6 minutes.\nLet me know how it goes.'
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
        en_IN: '{{name}}, I will be following up with you to ensure you get better right at home by:\n- Reminding you to track your vitals regularly\n- Maintaining your SpO2 chart for you (which can be shared with your doctor easily) \n- Sharing scientifically accurate health tips\n- Helping you cope with isolation \n- Extending my support to anyone in your home who also needs COVID-19 care assistance\n'
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
      en_IN: 'That\'s awesome, {{name}}! Thank you for choosing me as your aid to recovery. If you want any more details about my recovery program or want to make any modifications, please use the Manage program option in the main menu. I will be in touch with you again in a few hours to check on you. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    },
    dontSubscribe: {
      en_IN: 'Click here to know how to effectively manage mild cases of COVID-19 at home\nYou can always come back if you want my help. Just say the word, any word!:)'
    }
  },
}

let grammers = {
  binaryChoice: {
    prompt: {
      en_IN: '\n1. Yes\n2. No'
    },
    grammer: [
      { intention: true, recognize: ['yes', 'y', '1'] },
      { intention: false, recognize: ['no', 'n', '2'] }
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