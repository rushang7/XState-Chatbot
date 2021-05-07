let messages = {
  personName: {
    prompt: {
      en_IN: 'Got it, please tell me your name',
      hi_IN: 'धन्यवाद | आपका शुभ नाम क्या है ?'
    },
    error: {
      en_IN: 'I am sorry, I didn\'t understand. Please enter a valid name which is less than 100 characters.',
      hi_IN: 'माफ करें, मुझे समझ में नहीं आया।   नीचे दिए गए विकल्पों में से चुनें।'
    }
  },
  personAge: {
    prompt: {
      en_IN: 'Thanks {{name}}. How old are you?',
      hi_IN: '{{name}} | आपकी उम्र क्या है ?'
    },
    error: {
      en_IN: 'I am sorry, I didn\'t understand. Please enter a valid age (between 0 and 120)',
      hi_IN: 'माफ करें, मुझे समझ में नहीं आया। कृपया 0 से 120 के बीच में अपनी आयु डालें'
    }
  },
  personGender: {
    prompt: {
      en_IN: 'Please select your gender.',
      hi_IN: 'कृपया अपना लिंग चुनें'
    },
    options: {
      list: ['male', 'female', 'other'],
      messageBundle: {
        male: {
          en_IN: 'Male',
          hi_IN: 'पुरुष '
        },
        female: {
          en_IN: 'Female',
          hi_IN: 'महिला'
        },
        other: {
          en_IN: 'Other',
          hi_IN: 'अन्य'
        }
      }
    }
  },
  specialSymptoms: {
    prompt: {
      en_IN: 'Thanks for this information {{name}}! Do you have one or more of these symptoms?: \n- Pain or pressure in the chest\n- Difficulty breathing\n- Bluish discolorations of lips/face\n- Inability to eat / drink / walk \n- Mental confusion or drowsiness\n',
      hi_IN: 'जानकारी के लिए शुक्रिया {{name}} | क्या आपको इनमें से कोई लक्षण हैं ?: \n- छाती में दर्द या दबाव \n- साँस लेने में दिक्कत \n- होठों अथवा चेहरे का रंग नीला होना \n- कुछ खाने / पीने / चल फिरने में मुश्किल \n- मानसिक उलझन या ऊंघ / झपकियाँ आना'
    }
  },
  symptoms: {
    prompt: {
      en_IN: 'That is good to know {{name}}! Do you have one or more of these complaints?: \n- Fever (>37.8 C or 100F)\n- Cough with or without spit/Sore throat\n- Loss of smell/taste\n- Runny nose\n- Muscle pain\n- Nausea & loose motions\n',
      hi_IN: 'क्या आपके पास इनमें से एक या अधिक शिकायतें हैं? \n- बुखार\n- सुखी या गीली खाँसी, गले में दर्द\n- गंध / स्वाद की हानि \n- बहती नाक\n- साँस लेने में कठिनाई / सीने में लगातार दर्द / दबाव \n- मांसपेशियों में दर्द \n- मतली या दस्त'
    }
  },
  rtpcr: {
    prompt: {
      en_IN: 'What was the result of your RT-PCR test: \n1. Positive\n2. Negative\n3. Result Awaited or Not done',
      hi_IN: 'आपके RT-PCR टेस्ट का परिणाम क्या था?\n1. पॉज़िटिव \n2. नेगेटिव \n3. रिपोर्ट मिला नहीं है या टेस्ट किया नहीं है'
    }
  },
  comorbidity: {
    prompt: {
      male: {
        en_IN: 'Do you have one or more of these conditions? \n- Diabetes\n- Hypertension (High BP)\n- Chronic lung disease\n- Immunocompromised state\n- Heart disease\n- Obesity\n',
        hi_IN: 'क्या आपको निम्नलिखित में से एक या एक से अधिक लक्षण हैं ? \n- मधुमेह(डायबिटीज) \n- उच्च रक्तचाप \n- फेफड़े सम्बंधी रोग \n- हृदय(दिल) रोग \n- मोटापा \n- गर्भवती'
      },
      female: {
        en_IN: 'Do you have one or more of these conditions? \n- Diabetes\n- Hypertension (High BP)\n- Chronic lung disease\n- Immunocompromised state\n- Heart disease\n- Obesity\n- Pregnancy\n',
        hi_IN: 'क्या आपको निम्नलिखित में से एक या एक से अधिक लक्षण हैं ? \n- मधुमेह(डायबिटीज) \n- उच्च रक्तचाप \n- फेफड़े सम्बंधी रोग \n- हृदय(दिल) रोग \n- मोटापा'
      }
    }
  },
  endFlow: {
    ageConsultDoctorEnd: {
      en_IN: '{{name}}, your age poses an additional risk factor! It would be best, if you consulted a doctor right away so that you can undergo tests if required and start the right medication. \nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network',
      hi_IN: '{{name}}, आपके उम्र के कारण आपको ज़्यादा ध्यान रखना होगा! अच्छा होगा अगर आप तुरंत डॉक्टर से मिलें ताकि वह ज़रूरी टेस्ट कराकर आपका सही इलाज शुरू कर सकें। \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहाँ उपलब्ध है https://life.coronasafe.network'
    },
    symptomComorbidConsultDoctorEnd: {
      en_IN: '*{{name}} your current symptoms along with your other medical condition(s) may need professional medical attention.* It would be best, if you consulted a doctor right away so that you can undergo the necessary tests and start the right medication.\n\nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network',
      hi_IN: '*{{name}} आपके लक्षण और सेहत की स्थिति देखकर लगता है की आपको चिकित्सा की ज़रुरत है.* कृपया तुरंत डॉक्टर की सलाह लें ताकि टेस्ट कराकर आपका सही इलाज शुरू किया जा सके. \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहां उपलब्ध है https://life.coronasafe.network'
    },
    testComorbidConsultDoctorEnd: {
      en_IN: '*{{name}} your test result along with your other medical condition(s) may need professional medical attention.* \nIt would be best if you  consulted a doctor so that you can undergo the necessary tests if required and start the right medications.\n\nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network',
      hi_IN: '*{{name}} आपके पॉजिटिव रिपोर्ट और अन्य स्वास्थ्य समस्याओं के कारण आपके सेहत को ज़्यादा खतरा है।* कृपया तुरंत डॉक्टर की सलाह लें! \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहां उपलब्ध है https://life.coronasafe.network'
    },
    precautionEnd: {
      en_IN: '*{{name}}, given your age/comorbidities you should exercise caution.* I suggest following these simple tips to stay healthy!!\n- Wear N95 mask covering both mouth and nose\n- Sleep for 7-8 hours a day\n- Drink fluids to stay hydrated\n- Avoid alcohol and smoking\n- Practise yoga and meditate\n\nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network',
      hi_IN: '*{{name}}, आपके जवाबों से लगता नहीं है की आपको COVID-19 है स्वस्थ रहने के लिए इन सुझावों का पालन करें!* \n- N95 मास्क पहनें जो मुंह और नाक दोनों को कवर करे \n- दिन में 7-8 घंटे की नींद लें \n- तरल पदार्थों का सेवन करें \n- शराब और धूम्रपान छोड़ दें \n- योग और ध्यान करें \n \n  COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहां उपलब्ध है https://life.coronasafe.network'
    },
    noCovidEnd: {
      en_IN: '*{{name}}, based on your responses, it is less likely that you are suffering from COVID-19.* I suggest following these simple tips to stay healthy!\n- Wear an N95 mask covering both mouth and nose\n- Sleep for 7-8 hrs a day\n- Drink fluids to stay hydrated.\n- Avoid alcohol and smoking.\n5. Practise yoga and meditate.\n\nMore information regarding COVID-19 and nearby care facilities is available here  https://life.coronasafe.network',
      hi_IN: '*{{name}}, आपके जवाबों से लगता नहीं है की आपको COVID-19 है स्वस्थ रहने के लिए इन सुझावों का पालन करें!* \n- N95 मास्क पहनें जो मुंह और नाक दोनों को कवर करे \n- दिन में 7-8 घंटे की नींद लें \n- तरल पदार्थों का सेवन करें \n- शराब और धूम्रपान छोड़ दें \n- योग और ध्यान करें \n\n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहां उपलब्ध है https://life.coronasafe.network'
    },
    lowSpo2End: {
      en_IN: '*{{name}}, your current oxygen level is below the normal value. Please consult a doctor right away!* \nMore information regarding COVID-19 is available here https://life.coronasafe.network',
      hi_IN: '*{{name}}, आपका वर्तमान ऑक्सीजन स्तर सामान्य मूल्य से नीचे है। कृपया तुरंत डॉक्टर से सलाह लें!* \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहाँ उपलब्ध है https://life.coronasafe.network'
    },
    noOximeterEnd: {
      en_IN: '{{name}}, your oxygen level is one of the most important parameters to gauge the severity of your condition. *Please order a pulse oximeter right away.* \nSend me a message when you have it so we can begin monitoring your vitals.',
      hi_IN: '{{name}}, आपका ऑक्सीजन स्तर आपकी स्थिति की गंभीरता का पता लगाने के लिए सबसे महत्वपूर्ण मापदंडों में से एक है। *कृपया तुरंत एक पल्स ऑक्सीमीटर की व्यवस्था करें* \n जब आपके पास यह हो तो मुझे संदेश भेजें ताकि हम आपके विटल्स की निगरानी शुरू कर सकें'
    },
    walkTestEnd: {
      en_IN: '*{{name}}, this is an unexpected reaction to the walk test.* Please consult a doctor right away. \n\nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network',
      hi_IN: '*{{name}}, यह वॉक टेस्ट की अप्रत्याशित प्रतिक्रिया है। कृपया तुरंत डॉक्टर से सलाह लें।* \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहाँ उपलब्ध है https://life.coronasafe.network'
    },
    specialSymptomsEnd: {
      en_IN: '{{name}}, current symptoms require urgent medical attention. Please get in touch with your healthcare provider or visit a hospital emergency room immediately so that you can undergo appropriate testing and start the right medication. \n\n Information regarding nearby COVID-19 care facilities is also available here: https://life.coronasafe.network',
      hi_IN: '{{name}}, आपके लक्षणों के चलते आप को तुरंत इलाज की ज़रुरत है | कृपया तुरंत अपने डॉक्टर से संपर्क करें या नज़दीकी हस्पताल के इमरजेंसी विभाग में जाएं | \n {{name}} आपके लक्षण काफी गंभीर हैं, तुरंत डॉक्टर से मिलें या नज़दीकी अस्पताल में जाए ताकि टेस्ट कराकर आपका सही इलाज शुरू किया जा सके| \n COVID-19 से सम्बंधित जानकारी और नज़दीकी देखभाल की सुविधाओं के लिए कृपया https://life.coronasafe.network वेबसाइट पर जाएं |'
    }
  },
  triageSpo2: {
    prompt: {
      preamble: {
        en_IN: 'I hope you have a pulse oximeter at home, {{name}}. Please check your SpO2 and select an option from below',
        hi_IN: 'मुझे उम्मीद है कि आपके पास घर पर एक पल्स ऑक्सीमीटर है, {{name}}। कृपया अपना SpO2 जांचें और नीचे से एक विकल्प चुनें'
      },
      options: {
        list: [ 'above95', 'below94', 'noOximeter' ],
        messageBundle: {
          above95: {
            en_IN: 'SpO2 is 95% or above',
            hi_IN: 'SpO2 95% या अधिक है'
          },
          below94: {
            en_IN: 'SpO2 is 94% or below',
            hi_IN: 'SpO2 94% या कम है'
          }, 
          noOximeter: {
            en_IN: 'Don’t have an oximeter',
            hi_IN: 'ऑक्सीमीटर नहीं है'
          }
        }
      }
    },
    normalSpo2: {
      en_IN: '*Your SpO2 is well within the normal range! This is a good sign! :)*',
      hi_IN: '*आपका SpO2 सामान्य सीमा के भीतर है! यह एक अच्छा संकेत है! :)*'
    },
  },
  triageSpo2Walk: {
    prompt: {
      preamble: {
        en_IN: '{{name}}, your SpO2 should ideally be between 95 and 99.  I want to make sure that your lungs are not getting weak. I would suggest doing a simple test right now. All you need to do is walk around alone without a mask for 6 minutes with the pulse oximeter on your finger. Keep an eye out for the SpO2 all through the 6 minutes.\nLet me know how it goes.',
        hi_IN: '{{name}}, आपका SpO2 आदर्श रूप से 95 और 99 के बीच होना चाहिए। मैं यह सुनिश्चित करना चाहता हूं कि आपके फेफड़े कमजोर नहीं हो रहे हैं। मैं अभी एक साधारण परीक्षण करने का सुझाव दूंगा। आपको बस अपनी उंगली पर पल्स ऑक्सीमीटर के साथ 6 मिनट के लिए मास्क के बिना अकेले घूमने की ज़रूरत है। इन 6 मिनट के दौरान SpO2 परनज़र रखें। मुझे बताएं कि यह कैसे जाता है।'
      },
      options: {
        list: [ 'below93', 'lightHeaded', 'breathingDifficulty', 'none' ],
        messageBundle: {
          below93: {
            en_IN: 'SpO2 fell below 93 or reduced by 3 points or more (at any point during the test)',
            hi_IN: 'SpO2 93 से नीचे गिर गया या 3 अंक या उससे कम हो गया (परीक्षण के दौरान कभी भी)'
          }, 
          lightHeaded: {
            en_IN: 'Felt light headed (at any point during the test)',
            hi_IN: 'चक्कर आने जैसा लगा (परीक्षण के दौरान कभी भी)'
          },
          breathingDifficulty: {
            en_IN: 'Difficulty breathing (at any point during the test)',
            hi_IN: 'सांस लेने मे तकलीफ (परीक्षण के दौरान कभी भी)'
          }, 
          none: {
            en_IN: 'None of the above',
            hi_IN: 'इनमे से कोई भी नहीं'
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
        en_IN: 'Thank you for sharing this information, {{name}}. Please contact a doctor so you can be prescribed medicines as needed. I will also be following up with you regularly to ensure you get better right at home by: \n- Making you check your vitals three times a day\n- Maintaining your SpO2 and temperature chart  \n- Sharing scientifically accurate health information\n- Helping you cope up with isolation \n- Supporting your family members if COVID assistance is needed\n',
        hi_IN: 'इस जानकारी को भेजने के लिए धन्यवाद, {{name}}। कृपया किसी डॉक्टर से संपर्क करें ताकि आपको आवश्यकतानुसार दवाएं दी जा सकें। {{name}}, मैं आपकी स्थिति पर निगरानी रखेंगे ताकि आप घर पर ही ठीक हो सकें \n- दिन में 3 बार अपने vitals की जाँच करें \n- अपने SpO2 और तापमान चार्ट को बनाए रखिये \n- आपको वैज्ञानिक रूप से सही स्वास्थ्य जानकारी मिले \n- आपको अकेलेपन में मदद करें \n- COVID सहायता की आवश्यकता होने पर अपने परिवार के सदस्यों का समर्थन करना'
      },
      options: {
        list: [ true, false ],
        messageBundle: {
          true: {
            en_IN: 'Let\'s do this',
            hi_IN: 'चलो इसे करते हैं'
          },
          false: {
            en_IN: 'Not now',
            hi_IN: 'अभी नहीं'
          }
        }
      }
    },
    doSubscribe: {
      en_IN: 'That\'s awesome, {{name}}! Thank you for choosing me as your aid to recovery. :) If you want any more details about my guided recovery program or want to make any modifications, please use the *Manage program* option in the main menu. I will be in touch with you again in a few hours to check on you.\n To view home isolation guide click here https://www.youtube.com/watch?v=xTvd7oAEyhs (English) https://www.youtube.com/watch?v=VfVwoNzIC1c&t=2s (Hindi) \n Additional health tips are available here https://www.youtube.com/watch?v=ejukjKIClkg and https://youtube.com/playlist?list=PLM6YFXQ-ei4bMKT_R4GSLVnrsHodCdhmX \nFor more information regarding COVID-19 and nearby care facilities click here https://life.coronasafe.network',
      hi_IN: 'बहुत अच्छा, {{name}}! हमें अपना सहयोगी बनाने के लिए धन्यवाद।. :) यदि आप मेरे निर्देशित पुनर्प्राप्ति कार्यक्रम के बारे में कोई और विवरण चाहते हैं या कोई संशोधन करना चाहते हैं, तो कृपया मुख्य मेनू में *प्रबंधित कार्यक्रम* विकल्प का उपयोग करें। मैं कुछ घंटों में फिर से आपके संपर्क में आऊंगा। कुछ घंटों बाद हम आपसे फिर संपर्क करेंगे। \n घर अलगाव गाइड यहाँ उपलब्ध है: https://www.youtube.com/watch?v=VfVwoNzIC1c&t=2s (Hindi) \n स्वस्थ रहने के लिए, इन बातों का ध्यान रखें: \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहाँ उपलब्ध है https://life.coronasafe.network'
    },
    dontSubscribe: {
      en_IN: 'Ok. You can always come back when you need help. \nMore information regarding COVID-19 and nearby care facilities is available here https://life.coronasafe.network',
      hi_IN: 'ठीक है। आपको हमेशा मदद की आवश्यकता होने पर वापस आ सकते हैं। \n COVID-19 और नज़दीकी देखभाल सुविधाओं के बारे में अधिक जानकारी यहाँ उपलब्ध है https://life.coronasafe.network'
    }
  },
}

let grammers = {
  binaryChoice: {
    prompt: {
      en_IN: '\n1. Yes\n2. No',
      hi_IN: '\n1. हाँ \n2. नहीं'
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