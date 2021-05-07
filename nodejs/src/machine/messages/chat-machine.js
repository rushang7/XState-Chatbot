let messages = {
  selectLanguage: {
    prompt: {
      preamble: {
        en_IN: 'Hi there! Welcome to the Swasth Alliance COVID-19 Chat! I am  going to be your Swasth Sakhi. Swasth is a not for profit powered by India’s leading healthcare and technology companies as a public interest initiative. (For more information on Swasth click here https://www.swasth.app/home) The good folks at Swasth set me up to assist you with your COVID-19 questions and concerns. Please select your preferred language.',
        hi_IN: 'नमस्ते, Swasth Alliance (स्वस्थ संस्था) के COVID-19 चैट सुविधा में आपका स्वागत है। मैं हूँ आपकी स्वस्थ सखी । स्वस्थ संस्था को जन हित के लिए भारत की श्रेष्ठ स्वास्थ्य सेवा और टेक्नोलॉजी कंपनियों के लोगों ने मिलकर स्थापित किया है। (स्वस्थ संस्था के बारे में अधिक जानकारी के लिए https://www.swasth.app/home) COVID-19 से जुड़ी समस्याओं को सुलझाने में यह चैट सुविधा आपकी मदद कर सकती है। कृपया अपनी भाषा चुनें'
      },
      options: {
        list: [ 'hi_IN', 'en_IN' ],
        messageBundle: {
          en_IN: {
            en_IN: 'English'
          },
          hi_IN: {
            en_IN: 'हिंदी'
          }
        }
      }
    },
  },
  menu: {
    prompt: {
      preamble: {
        en_IN: 'What do you need help with right now?',
        hi_IN: 'बताइये, आज हम आपकी क्या सहायता कर सकते हैं?'
      },
      postscript: {
        en_IN: '\n\nYou can always get back to the main menu by sending "Reset".\n\nBy continuing to use our chat facility, you agree to our Terms & Conditions of use https://www.swasth.app/swasth_terms_wb.pdf',
        hi_IN: '\n\n "Reset " टाइप करके भेजने पर आप मेन मेनू पर वापस आ सकते हैं \n\nहमारे चैट सुविधा का उपयोग करके आप हमारे नियमों और उपयोग के शर्तों का पालन करने के लिए सहमति दे रहे हैं https://www.swasth.app/swasth_terms_wb.pdf'
      },
      options: {
        newUser: [ 'worried', 'info' ],
        subscribedUser: [ 'worried', 'selfCare', 'info' ],
        messageBundle: {
          worried: {
            en_IN: 'I am feeling worried and have COVID related concerns',
            hi_IN: 'मैं COVID-19 को लेकर बहुत चिंतित हूँ'
          },
          selfCare: {
            en_IN: 'I want to manage my self-monitoring program',
            hi_IN: 'मैं अपने आप ही COVID-19 संक्रमण पर ध्यान रखना चाहता/चाहती हूं'
          },
          info: {
            en_IN: 'I want information about COVID facilities',
            hi_IN: 'मुझे COVID-19 सुविधाओं के बारे में जानकारी चाहिए'
          }
        }
      }
    }
  },
  triageMenu: {
    prompt: {
      preamble: {
        en_IN: 'Let me try and address them! Tell me more about your concerns...',
        hi_IN: 'आप हमें अपनी समस्याओं के बारे में बताएं, हम आपकी चिंता दूर करने की कोशिश करेंगे'
      },
      options: {
        list: [ 'symptoms', 'contactCovid', 'doctorAdvise' ],
        messageBundle: {
          symptoms: {
            en_IN: 'I may have COVID-19 symptoms',
            hi_IN: 'मुझमें शायद COVID-19 के लक्षण हैं'
          },
          contactCovid: {
            en_IN: 'I have come in contact with a COVID-19 patient',
            hi_IN: 'मैं COVID-19 से संक्रमित व्यक्ति के संपर्क में आई/आया था'
          },
          doctorAdvise: {
            en_IN: 'My doctor has advised homecare for COVID management',
            hi_IN: 'डॉक्टर ने मुझे घर पर ही COVID-19 के देखभाल की सलाह दी है'
          }
        },
      }
    }
  },
  selfCareMenu: {
    prompt: {
      preamble: {
        en_IN: 'How would you like to proceed?',
        hi_IN: 'आप किस प्रकार शुरू करना चाहेंगे?'
      },
      options: {
        newUser: {
          list: [ 
            'addPatient', 
            'recordVitals', 
            'downloadReport', 
            'exitProgram' 
          ],
          messageBundle: {
            addPatient: {
              en_IN: 'Enroll a new patient into the program',
              hi_IN: 'कार्यक्रम में एक नए रोगी को भर्ती करें'
            },
            recordVitals: {
              en_IN: 'Enter vitals',
              hi_IN: 'वाइटल्स दर्ज करें'
            },
            downloadReport: {
              en_IN: 'Download vitals report',
              hi_IN: 'वाइटल्स रिपोर्ट डाउनलोड करें'
            },
            exitProgram: {
              en_IN: 'Exit self care program',
              hi_IN: 'आत्म देखभाल प्रोग्राम से बाहर निकलें'
            }
          }
        },
        enrolledUser: {
          list: [ 
            'addPatient', 
            'downloadReport', 
          ],
          messageBundle: {
            addPatient: {
              en_IN: 'Enroll a new patient into the program',
              hi_IN: 'कार्यक्रम में एक नए रोगी को भर्ती करें'
            },
            downloadReport: {
              en_IN: 'Download vitals report',
              hi_IN: 'वाइटल्स रिपोर्ट डाउनलोड करें'
            },
          }
        }
      }
    }
  },
  informationFlow: {
    en_IN: 'You can find more information regarding COVID-19 and nearby care facilities here https://life.coronasafe.network. Please follow these simple tips to stay healthy and safe!\n\n- Wear a N95 mask covering both mouth and nose\n- Sleep 7-8 hours a day\n- Drink a lot of fluids to stay hydrated\n- Avoid alcohol intake and smoking\n- Exercise, practise yoga and meditate\n',
    hi_IN: 'COVID-19 और नजदीकी देखभाल केंद्रों से संबंधित जानकारी यहाँ प्राप्त कर सकते हैं https://life.coronasafe.network. कृपया स्वस्थ और सुरक्षित रहने के लिए निम्न का पालन करें - अपने मुँह और नाक के ऊपर N95 मास्क पहनें \n- 7-8 घंटों की नींद अवश्य लें \n- अधिक से अधिक तरल पदार्थों का सेवन करें \n- धूम्रपान और नशीले पदार्थों का सेवन न करें \n- व्यायाम, योग और ध्यान करें'
  },
  endstate: {
    en_IN: 'Goodbye. Say hi to start another conversation',
    hi_IN: 'अलविदा!  बातचीत फिर शुरू करने के लिए "hi" टाइप करके भेजें'
  }
}

module.exports.messages = messages;