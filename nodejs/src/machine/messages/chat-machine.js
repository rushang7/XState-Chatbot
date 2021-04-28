let messages = {
  menu: {
    prompt: {
      preamble: {
        en_IN: 'Hi there! I am an evolving COVID-19 chatbot created by the Swasth Alliance to help address your COVID concerns. How can I help you?'
      },
      postscript: {
        en_IN: '\n\nYou can always get back to the main menu by sending "Reset".\n\nBy continuing to use our chat facility, you agree to our Terms & Conditions of use https://www.swasth.app/swasth_terms_wb.pdf'
      },
      options: {
        newUser: [ 'worried', 'info' ],
        subscribedUser: [ 'worried', 'selfCare', 'info' ],
        messageBundle: {
          worried: {
            en_IN: 'I am feeling worried and have COVID related concerns'
          },
          selfCare: {
            en_IN: 'I want to manage my self-monitoring program'
          },
          info: {
            en_IN: 'I want information about COVID facilities'
          }
        }
      }
    }
  },
  triageMenu: {
    prompt: {
      preamble: {
        en_IN: 'Let me try and address them! Tell me more about your concerns:'
      },
      options: {
        list: [ 'symptoms', 'contactCovid', 'doctorAdvise', 'awaitingResult' ],
        messageBundle: {
          symptoms: {
            en_IN: 'I may have COVID-19 symptoms'
          },
          contactCovid: {
            en_IN: 'I have come in contact with a COVID-19 patient'
          },
          doctorAdvise: {
            en_IN: 'My doctor has advised homecare for COVID management'
          },
          'awaitingResult': {
            en_IN: 'I am awaiting my test results'
          }
        },
      }
    }
  },
  selfCareMenu: {
    prompt: {
      preamble: {
        en_IN: 'How would you like to proceed?'
      },
      options: {
        list: [ 
          'addPatient', 
          'recordVitals', 
          // 'downloadReport', 
          'exitProgram' 
        ],
        messageBundle: {
          addPatient: {
            en_IN: 'Enroll a new patient into the program'
          },
          recordVitals: {
            en_IN: 'Enter vitals'
          },
          // downloadReport: {
          //   en_IN: 'Download vitals report'
          // },
          exitProgram: {
            en_IN: 'Exit self care program'
          }
        }
      }
    }
  },
  informationFlow: {
    en_IN: 'You can find more information regarding COVID-19 and nearby care facilities here https://life.coronasafe.network. Please follow these simple tips to stay healthy and safe!\n\n- Wear a N95 mask covering both mouth and nose\n- Sleep 7-8 hours a day\n- Drink a lot of fluids to stay hydrated\n- Eat a healthy low carbohydrate, high protein diet\n- Avoid alcohol intake and smoking\n- Exercise, practise yoga and meditate\n'
  },
  endstate: {
    en_IN: 'Goodbye. Say hi to start another conversation'
  }
}

module.exports.messages = messages;