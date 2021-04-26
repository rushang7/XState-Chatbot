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
      en_IN: 'Please look for the oximeter, put it on your finger and let the number stabilize. Now tell me what your pulse oximeter says? \n\n1. SpO2 is 95 and above \n2. SpO2 is between 90 and 94% \n3. SpO2 is below 90%'
    }
  },
  vitalsSpo2Bad: {
    en_IN: '{{name}}, your current oxygen level  is  well  below the normal value. I suggest you consult a doctor right away! Besides medications, you may need some additional oxygen support. \n\nTo consult a doctor click here. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
  },
  vitalsSpo2Walk: {
    prompt: {
      en_IN: '{{name}}, your SpO2 should ideally be between 95 and 99.  I just want to make sure that your lungs are not getting weak. I would suggest doing a simple test right now. All you need to do is walk around inside your room for 6 minutes with the pulse oximeter on your finger. Keep an eye out for the SpO2 all through the 6 minutes. \nLet me know how it goes. \n\n1. SpO2 fell below 93 or reduced by 3 points or more (at any point during the test)\n2.  Felt light headed (at any point during the test)\n3. Difficulty breathing (at any point during the test)\n4. None of the above'
    }
  },
  vitalsSpo2WalkBad: {
    prompt: {
      en_IN: '{{name}}, this reaction to the walk test is not normal. I suggest you consult a doctor right away! Besides medications, you may need some additional oxygen support. \n\n To consult a doctor click here. \nMore information regarding COVID-19 is available here https://life.coronasafe.network'
    }
  },
  vitalsTemperature: {
    prompt: {
      en_IN: 'Your oxygen level is looking good. Now let\'s check your temperature with your thermometer.\n\n1. 98 and below \n2. 99 and above'
    }
  },
  vitalsRecordedSuccesfully: {
    en_IN: 'Your vitals have been recorded successfully'
  },
  consentdenied: {
    en_IN: 'Consent Denied'
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
    { intention: 'good', recognize: ['1'] },
    { intention: 'bad', recognize: ['2'] }
  ],
  vitalsSpo2Walk: [
    { intention: 'bad', recognize: ['1', '2', '3'] },
    { intention: 'good', recognize: ['4'] }
  ],
  exitReason: [
    { intention: 'NoCovid', recognize: ['1'] },
    { intention: 'TooManyMessages', recognize: ['2'] },
    { intention: 'EscalationRequired', recognize: ['3'] }
  ]
}

module.exports.messages = messages;
module.exports.grammer = grammer;