const { assign } = require('xstate');
const dummyReceipts = require('./service/dummy-receipts');
const { INTENTION_UNKOWN } = require('./util/dialog');
const dialog = require('./util/dialog');

const receipts = {
    id: 'receipts',
    initial: 'services',
    states: {
      services: {
        id: 'services',
        onEntry: assign((context, event) => {
          context.receipts = {slots: {}};
        }),
        initial: 'question',
        states:{
          question:{
            onEntry: assign((context, event) => {
              let { services, messageBundle } = dummyReceipts.getSupportedServicesAndMessageBundle();
              let preamble = dialog.get_message(messages.services.question.preamble, context.user.locale);
              let { prompt, grammer } = dialog.constructListPromptAndGrammer(services, messageBundle, context.user.locale);
              context.grammer = grammer;
              context.chatInterface.toUser(context.user, `${preamble}${prompt}`);
            }),
            on: {
              USER_MESSAGE:'process'
            }
          },//question
          process:{
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
            }),
            always:[
              {
                target: 'error',
                cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
              },

              {
                target: '#trackreceipts',
                actions: assign((context, event) => {
                  context.receipts.slots.service = context.intention;
                }),
              }
            ]
          },// menu.process
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.services.error,context.user.locale);
              context.chatInterface.toUser(context.user, message);
            }),
            always : [
              {
                target: 'question'
              }
            ]
          } // menu.error
        }
      },//receiptsmenu
      trackreceipts:{
        id:'trackreceipts',
        initial:'start',
        states:{
          start:{
            onEntry: assign((context, event) => {
              console.log("Entered into trackreceipts");
            }),
            invoke:{
              id:'receiptstatus',
              src: (context) => dummyReceipts.findreceipts(context.user,context.receipts.slots.service),
              onDone:[
                {
                  target: '#receiptslip',
                  cond: (context, event) => {
                    return event.data.length>0;
                  },
                  actions: assign((context, event) => {
                    context.receipts.slots.personalizedreceipts = event.data;
                    console.log(context.receipts.slots.personalizedreceipts);
                  }),
                },
                {
                  target:'#mobilelinkage',
                }
    
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = dialog.get_message(messages.trackreceipts.error,context.user.locale);
                  context.chatInterface.toUser(context.user, message);
                })
              }
            }

          },
          
        },
      },
      receiptslip:{
        id:'receiptslip',
        initial:'start',
        states:{
          start:{
            onEntry: assign((context, event) => {
              console.log("Entered into receiptslip");
            }),
            invoke:{
              id: 'fetchReceiptsForParam',
              src: (context, event) => {
                let slots = context.receipts.slots;
                return dummyReceipts.fetchReceiptsForParam(context.user, slots.service, slots.searchParamOption, slots.paraminput);
              },
              onDone:[
                {
                  cond:(context,event)=>{
                    return event.data.length>0
                  },
                  target: 'listofreceipts',
                },
                {
                  target:'#noreceipts'
                },
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = messages.receiptslip.error;
                  context.chatInterface.toUser(context.user, message);
                })
              }  
            
            },
          },
          listofreceipts:{
            onEntry: assign((context, event) => {
              let receipts=context.receipts.slots.personalizedreceipts;
              let message='';
              if(receipts.length===1){
                let receipt = receipts[0];
                let message=dialog.get_message(messages.receiptslip.listofreceipts.singleRecord,context.user.locale);
                message = message.replace('{{service}}', receipt.service);
                message = message.replace('{{id}}', receipt.id);
                message = message.replace('{{secondaryInfo}}', receipt.secondaryInfo);
                message = message.replace('{{date}}', receipt.date);
                message = message.replace('{{amount}}', receipt.amount);
                message = message.replace('{{transactionNumber}}', receipt.transactionNumber);
                message = message.replace('{{paymentLink}}', receipt.paymentLink);
                context.chatInterface.toUser(context.user,message);
              }else {
                message = dialog.get_message(messages.receiptslip.listofreceipts.multipleRecordsSameService, context.user.locale);
                for(let i = 0; i < receipts.length; i++) {
                  let receipt = receipts[i];
                  let receiptTemplate = dialog.get_message(messages.receiptslip.listofreceipts.multipleRecordsSameService.receiptTemplate, context.user.locale);
                  receiptTemplate =receiptTemplate.replace('{{service}}', receipt.service);
                  receiptTemplate = receiptTemplate.replace('{{id}}', receipt.id);
                  receiptTemplate = receiptTemplate.replace('{{secondaryInfo}}', receipt.secondaryInfo);
                  receiptTemplate = receiptTemplate.replace('{{amount}}', receipt.amount);
                  receiptTemplate = receiptTemplate.replace('{{date}}', receipt.date);
                  receiptTemplate = receiptTemplate.replace('{{transactionNumber}}', receipt.transactionNumber);
                  receiptTemplate = receiptTemplate.replace('{{paymentLink}}', receipt.paymentLink);
    
                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += receiptTemplate;
                }
                context.chatInterface.toUser(context.user,message);
              }
              
            }),
            always:[
              {
                target:'#searchreceiptinitiate',
              }
            ]
          },
        },
      },
      noreceipts:{
        id:'noreceipts',
        onEntry: assign((context, event) => {
          let message = dialog.get_message(messages.receiptslip.not_found, context.user.locale);
          let optionMessage = context.receipts.slots.searchParamOption;
          let inputMessage = context.receipts.slots.paraminput;
          message = message.replace('{{searchparamoption}}', optionMessage);
          message = message.replace('{{paraminput}}', inputMessage);
          context.chatInterface.toUser(context.user, message);
        }),
        always:'#searchparams'
      },
      searchreceiptinitiate:{
        id:'searchreceiptinitiate',
        initial:'question',
        states:{
          question:{
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.searchreceiptinitiate.question, context.user.locale);
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process'
            }

          },
          process:{
            onEntry: assign( (context, event) => {
              let messageText = event.message.input;
              let parsed = parseInt(event.message.input.trim())
              let isValid = parsed === 1;
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
            }),
            always :[
              {
                target: 'error',
                cond: (context, event) => {
                  return ! context.message.isValid;
                }
              },
              {
                target:'#searchparams',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },
            ],
          },
          error: {
            onEntry: assign( (context, event) => {
              let message = dialog.get_message(messages.searchreceiptinitiate.error,context.user.locale);
              context.chatInterface.toUser(context.user, message);
            }),
            always : [
              {
                target: 'question'
              }
            ]
          },
        },
      },
      mobilelinkage:{
        id:'mobilelinkage',
        onEntry: assign((context, event) => {
          let message1=dialog.get_message(messages.mobilelinkage.notLinked,context.user.locale);
          message1 = message1.replace('{{service}}',context.receipts.slots.service);
          context.chatInterface.toUser(context.user, message1);
        }),
        always:[
          {
            target:'#searchreceiptinitiate',
          }
        ],
      },//mobilecheck
      searchparams:{
        id:'searchparams',
        initial:'question',
        states:{
          question:{
            onEntry:assign((context,event)=>{
              let { searchOptions, messageBundle } = dummyReceipts.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
              let preamble=dialog.get_message(messages.searchparams.question.preamble,context.user.locale);
              let { prompt, grammer } = dialog.constructListPromptAndGrammer(searchOptions, messageBundle, context.user.locale);
              context.grammer = grammer;
              context.chatInterface.toUser(context.user, `${preamble}${prompt}`);
            }),
            on:{
              USER_MESSAGE:'process'
            },
          },
          process:{
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
            }),
            always:[
              {
                target: 'error',
                cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
              },
              {
                target: '#paraminput',
                actions: assign((context, event) => {
                  context.receipts.slots.searchParamOption = context.intention;
                })
              }
            ],
          },
          error: {
            onEntry: assign( (context, event) => {
              let message = dialog.get_message(messages.searchparams.error,context.user.locale);
              context.chatInterface.toUser(context.user, message);
            }),
            always : [
              {
                target: '#searchparams'
              }
            ]
          },
        },
      },//serachparameter
      paraminput:{
        id:'paraminput',
        initial:'question',
        states:{
          question: {
            onEntry: assign((context, event) => {
              let { option, example } = dummyReceipts.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
              let message = dialog.get_message(messages.paraminput.question, context.user.locale);
              let optionMessage = dialog.get_message(option, context.user.locale);
              let exampleMessage = dialog.get_message(example, context.user.locale);
              message = message.replace('{{option}}', optionMessage);
              message = message.replace('{{example}}', exampleMessage);
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process:{
            onEntry: assign( (context, event) => {
              let paraminput = event.message.input;
              context.isValid = dummyReceipts.validateParamInput(context.receipts.slots.service, context.receipts.slots.searchParamOption, paraminput);
              if(context.isValid) {
                context.receipts.slots.paraminput = paraminput;
              }
            }),
            always:[
              {
                target: '#receiptsearchresults',
                cond: (context, event) => {
                  return context.isValid;
                }
              },
              {
                target:'re_enter',
              }
            ]

          },
          re_enter:{
            onEntry: assign((context, event) => {
              let { option, example } = dummyReceipts.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
              let message = dialog.get_message(messages.paraminput.re_enter, context.user.locale);
              let optionMessage = dialog.get_message(option, context.user.locale);
              message = message.replace('{{option}}', optionMessage);
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            },
          },
        },
      },//parameterinput
      receiptsearchresults:{
        id:'receiptsearchresults',
        initial:'fetch',
        states:{
          fetch:{
            onEntry: assign((context, event) => {
              console.log("Entered into receiptsearchresults");
            }),
            invoke:{
              id: 'fetchReceiptsForParam',
              src: (context, event) => {
                let slots = context.receipts.slots;
                return dummyReceipts.fetchReceiptsForParam(context.user, slots.service, slots.searchParamOption, slots.paraminput);
              },
              onDone:[
                {
                  target: 'results',
                  cond:(context,event)=>{
                    return event.data.length>0
                  },
                  actions: assign((context, event) => {
                    context.receipts.slots.searchresults = event.data;
                    console.log(context.receipts.slots.searchresults);
                  }),
                },
                {
                  target:'norecords'
                },
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = messages.receiptsearchresults.error;
                  context.chatInterface.toUser(context.user, message);
                })
              }  
            
            },
          },
          norecords:{
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.receiptsearchresults.norecords, context.user.locale);
              let optionMessage = context.receipts.slots.searchParamOption;
              let inputMessage = context.receipts.slots.paraminput;
              message = message.replace('{{searchparamoption}}', optionMessage);
              message = message.replace('{{paraminput}}', inputMessage);
              context.chatInterface.toUser(context.user, message);
            }),
            always: '#paraminputinitiate',
          },
          results:{
            onEntry: assign((context, event) => {
              let receipts=context.receipts.slots.searchresults;
              let message='';
              if(receipts.length===1){
                let receipt = receipts[0];
                let message=dialog.get_message(messages.receiptsearchresults.results.singleRecord,context.user.locale);
                message = message.replace('{{service}}', receipt.service);
                message = message.replace('{{id}}', receipt.id);
                message = message.replace('{{secondaryInfo}}', receipt.secondaryInfo);
                message = message.replace('{{date}}', receipt.date);
                message = message.replace('{{amount}}', receipt.amount);
                message = message.replace('{{transactionNumber}}', receipt.transactionNumber);
                message = message.replace('{{paymentLink}}', receipt.paymentLink);
                context.chatInterface.toUser(context.user,message);
              }else {
                message = dialog.get_message(messages.receiptsearchresults.results.multipleRecordsSameService, context.user.locale);
                for(let i = 0; i < receipts.length; i++) {
                  let receipt = receipts[i];
                  let receiptTemplate = dialog.get_message(messages.receiptslip.listofreceipts.multipleRecordsSameService.receiptTemplate, context.user.locale);
                  receiptTemplate =receiptTemplate.replace('{{service}}', receipt.service);
                  receiptTemplate = receiptTemplate.replace('{{id}}', receipt.id);
                  receiptTemplate = receiptTemplate.replace('{{secondaryInfo}}', receipt.secondaryInfo);
                  receiptTemplate = receiptTemplate.replace('{{amount}}', receipt.amount);
                  receiptTemplate = receiptTemplate.replace('{{date}}', receipt.date);
                  receiptTemplate = receiptTemplate.replace('{{transactionNumber}}', receipt.transactionNumber);
                  receiptTemplate = receiptTemplate.replace('{{paymentLink}}', receipt.paymentLink);
    
                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += receiptTemplate;
                }
                context.chatInterface.toUser(context.user,message);
              }
              
            }),
            always:[
              {
                target:'#searchreceiptinitiate',
              }
            ]
          },
        }
      },
      paraminputinitiate:{
        id:'paraminputinitiate',
        initial:'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.paraminputinitiate.question, context.user.locale);
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let messageText = event.message.input;
              let parsed = parseInt(event.message.input.trim())
              let isValid = parsed === 1;
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              };
            }),
            always: [
              {
                target: 'error',
                cond: (context, event) => {
                  return ! context.message.isValid;
                }
              },
              {
                target: '#searchparams'
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.paraminputinitiate.error,context.user.locale);
              context.chatInterface.toUser(context.user, message);
            }),
            always : 'question'
          }
        },
      },
    }//receipts.states
};

let messages = {
  services:{
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below:'
      },
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },
  },
  trackreceipts:{
    error:{
      en_IN: 'Sorry. Some error occurred on server!'
    },
  },
  receiptslip:{
    not_found:{
      en_IN:'The {{searchparamoption}} :   {{paraminput}}   is not found in our records. Please Check the details you have provided once again.'
    },
    error:{
      en_IN:'Sorry. Some error occurred on server.'
    },
    listofreceipts:{
      singleRecord: {
        en_IN:'Your {{service}} payment receipt for consumer number {{id}} against property in  {{secondaryInfo}} is given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.\n\n {{date}} - Rs.  {{amount}} -  {{transactionNumber}}\nPayment Link: {{paymentLink}}\n\n'
      },
      multipleRecordsSameService: {
        en_IN: 'Following Receipts found:',
        receiptTemplate: {
          en_IN: ' {{service}} - {{id}} - {{secondaryInfo}} \n {{date}} - Rs.  {{amount}} -  {{transactionNumber}} \nPayment Link: {{paymentLink}}'
        }
      }
    },
  },
  searchreceiptinitiate:{
    question:{
      en_IN:'Please type and send ‘1’ to Search and View for past payments which are not linked to your mobile number.'
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },


  },
  mobilelinkage:{
    notLinked: {
      en_IN: 'It seems the mobile number you are using is not linked with {{service}} service. Please visit ULB to link your account number with Service_Name. Still you can avail service by searching your account information.'
    },
  },
  searchparams:{
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below:'
      }
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },

  },
  paraminput: {
    question: {
      en_IN: 'Please Enter {{option}} to view the bill. {{example}}\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.'
    },
    re_enter: {
      en_IN: 'Sorry, the value you have provided is incorrect.\nPlease re-enter the {{option}} again to fetch the bills.\n\nOr Type and send \'mseva\' to Go ⬅️ Back to main menu.'
    }
  },
  receiptsearchresults:{
    error:{
      en_IN:'Sorry. Some error occurred on server.'
    },
    norecords:{
      en_IN:'The {{searchparamoption}} :   {{paraminput}}   is not found in our records. Please Check the details you have provided once again.'
    },
    results:{
      singleRecord: {
        en_IN:'Your {{service}} payment receipt for consumer number {{id}} against property in  {{secondaryInfo}} is given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.\n\n {{date}} - Rs.  {{amount}} -  {{transactionNumber}}\nPayment Link: {{paymentLink}}\n\n'
      },
      multipleRecordsSameService: {
        en_IN: 'Following Receipts found:',
        receiptTemplate: {
          en_IN: ' {{service}} - {{id}} - {{secondaryInfo}} \n\n {{date}} - Rs.  {{amount}} -  {{transactionNumber}} \nPayment Link: {{paymentLink}}'
        }
      }
    },
  },
  paraminputinitiate: {
    question: {
      en_IN: 'Please type and send ‘1’ to search using other parameter Or ‘mseva’ to Go ⬅️ Back to main menu.'
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },

  }
  
};

module.exports = receipts;
