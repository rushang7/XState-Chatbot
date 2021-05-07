let messages = {
  noUserFound: {
    en_IN: 'No patients found against your mobile number.',
    hi_IN: 'इस मोबाइल नंबर से जुड़ा कोई मरीज नहीं मिला।'
  },
  selectPerson: {
    prompt: {
      en_IN: 'Please select the patient whose vitals you want to add:\n\n',
      hi_IN: 'कृपया उस रोगी का चयन करें, जिसके वाइटल्स आप जोड़ना चाहते हैं: \n\n'
    }
  },
  reportSelectPerson: {
    prompt: {
      en_IN: 'Please select the patient whose reports you want to download:\n\n',
      hi_IN: 'कृपया उस रोगी का चयन करें, जिसके रिनपोर्ट्स आप डाउनलोड करना चाहते हैं: \n\n'
    }
  },
  vitalsSpo2: {
    prompt: {
      en_IN: '{{name}}! Please look for the oximeter, put it on your finger and let the number stabilize. Now tell me what your pulse oximeter says? \n\n1. SpO2 is 95 and above \n2. SpO2 is 94% or below',
      hi_IN: 'मुझे उम्मीद है कि आपके पास घर पर एक पल्स ऑक्सीमीटर है, {{name}}। कृपया अपना SpO2 जांचें और नीचे से एक विकल्प चुनें \n\n1. SpO2 95% या अधिक है \n2. SpO2 94%या कम है'
    }
  },
  vitalsPulse: {
    prompt: {
      en_IN: 'What is your pulse? (Also seen on the pulse oximeter)',
      hi_IN: 'आपकी पल्स संख्या क्या है? (पल्स ऑक्सीमीटर पर देखें)'
    }
  },
  vitalsBreathing: {
    prompt: {
      en_IN: 'What is your breathing rate?',
      hi_IN: 'आपकी सांस लेने की दर क्या है?'
    }
  },
  vitalsSpo2Bad: {
    en_IN: '*{{name}}, your current oxygen level  is  well  below the normal value. I suggest you consult a doctor right away!* Besides medications, you may need some additional oxygen support. \n\nTo consult a doctor click here. \nMore information regarding COVID-19 is available here https://life.coronasafe.network',
    hi_IN: '*{{name}}, आपका वर्तमान ऑक्सीजन स्तर सामान्य मूल्य से नीचे है। कृपया तुरंत डॉक्टर से सलाह लें!* \nCOVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहां उपलब्ध है https://life.coronasafe.network'
  },
  vitalsSpo2Walk: {
    prompt: {
      en_IN: '{{name}}, your SpO2 should ideally be between 95 and 99.  I just want to make sure that your lungs are not getting weak. I would suggest doing a simple test right now. All you need to do is walk around inside your room for 6 minutes with the pulse oximeter on your finger. Keep an eye out for the SpO2 all through the 6 minutes. \nLet me know how it goes. \n\n1. SpO2 fell below 93 or reduced by 3 points or more (at any point during the test)\n2.  Felt light headed (at any point during the test)\n3. Difficulty breathing (at any point during the test)\n4. None of the above'
    }
  },
  vitalsSpo2WalkBad: {
    prompt: {
      en_IN: '*{{name}}, this is an unexpected reaction to the walk test.* Please consult a doctor right away.'
    }
  },
  vitalsTemperature: {
    prompt: {
      en_IN: '*Now let\'s check your temperature with your thermometer.* \n\n1. 99 and above \n2. 98 and below',
      hi_IN: 'अब अपने थर्मामीटर से अपने तापमान की जांच करते हैं। \n1. 99 और ऊपर \n-2. 98 और नीचे'
    }
  },
  temperatureGood: {
    en_IN: 'Your vitals have been recorded. *No fever! Your SpO2 and your temperature are both normal!* Let’s keep it that way. I will check up on you again in a few hours to see how you are feeling!',
    hi_IN: 'आपके वाइटल्स रिकॉर्ड किए गए हैं। आपको बुखार नहीं है! आपका SpO2 और आपका तापमान दोनों सामान्य हैं! अपना ख्याल रखें। आप कैसा महसूस कर रहे हैं, यह जानने के लिए कुछ घंटों बाद हम आपसे फिर संपर्क करेंगे!'
  },
  temperatureBad: {
    en_IN: 'Your vitals have been recorded. *Looks like you have a fever.* You will need to take medication to bring the temperature back down. Please contact your doctor and I will check up on you again in a few hours to see how you are feeling.\n\n More information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network',
    hi_IN: 'आपके वाइटल्स रिकॉर्ड किए गए हैं। लगता है, आपको बुखार है। तापमान को वापस लाने के लिए आपको दवा लेने की आवश्यकता होगी। कृपया अपने डॉक्टर से संपर्क करें और हम आपको कुछ घंटों में फिर से देखेंगे कि आप कैसा महसूस कर रहे हैं। \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहाँ उपलब्ध है https://life.coronasafe.network'
  },
  exitProgram: {
    exitPersonSelection: {
      prompt: {
        en_IN: 'Please select the patient whose program you want to end:\n\n',
        hi_IN: 'कृपया जिस व्यक्ति की सदस्यता का अंत करना है उसका नाम चुनें'
      }
    },
    exitReason: {
      prompt: {
        en_IN: 'Please tell me why you want to exit the self management program? \n1. I have recovered now\n2. My doctor’s recommendation\n3. I didn’t find the program useful',
        hi_IN: ' कृपया हमें बताएं कि आप self management कार्यक्रम का अंत क्यों करना चाहते हैं? \n1. मैं अब ठीक हो गया हूँ \n2. मेरे डॉक्टर की सलाह पर \n3. मुझे इस कार्यक्रम से सहायता नहीं मिली'
      }
    },
    exitFeedback: {
      prompt: {
        en_IN: 'Please share if you have any other feedback that can help me serve you better.',
        hi_IN: 'यदि इस सुविधा को सुधारने में आपके कोई सुझाव हो, तो हमें ज़रूर बताएँ'
      }
    },
    unsubscribedSuccessfully: {
      en_IN: 'I have removed you from the program now. You can always come and join the program again and please do remember to contact me for any concerns.\n\nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network/',
      hi_IN: 'मैंने आपकी सदस्यता अब समाप्त कर दी है। आप कभी भी दोबारा आकर फिर से इस कार्यक्रम से जुड़ सकते हैं और किसी भी जानकारी के लिए मुझसे संपर्क अवश्य करें । COVID-19 और नजदीकी देखभाल केंद्रों से संबंधित जानकारी यहाँ प्राप्त कर सकते हैं  https://life.coronasafe.network'
    }
  }
}

let grammer = {
  vitalsSpo2: [
    { intention: 'good', recognize: ['1'] },
    { intention: 'bad', recognize: ['2'] }
  ],
  vitalsTemperature: [
    { intention: 'bad', recognize: ['1'] },
    { intention: 'good', recognize: ['2'] }
  ],
  vitalsSpo2Walk: [
    { intention: 'bad', recognize: ['1', '2', '3'] },
    { intention: 'good', recognize: ['4'] }
  ],
  exitReason: [
    { intention: 'recovered', recognize: ['1'] },
    { intention: 'doctorRecommendation', recognize: ['2'] },
    { intention: 'notUseful', recognize: ['3'] }
  ]
}

module.exports.messages = messages;
module.exports.grammer = grammer;