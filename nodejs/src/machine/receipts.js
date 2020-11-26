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
              let message = 'Sorry, I didn\'t understand';
              context.chatInterface.toUser(context.user, message);
            }),
            always : [
              {
                target: '#services'
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
              src: (context) => dummyReceipts.findreceipts(context.user),
              onDone:[
                {
                  target: '#receiptslip',
                  cond: (context, event) => {
                    return event.data.length>0;
                  },
                  actions: assign((context, event) => {
                    context.receipts.slots.personalizedreceipts = event.data;
                  })
                },
                {
                  target:'#mobilelinkage',
                }
    
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = 'Sorry. Some error occurred on server';
                  context.chatInterface.toUser(context.user, message);
                })
              }
            }

          },
          
        },
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
              let message = 'Sorry, I didn\'t understand';
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
        initial:'mobilecheck',
        states:{
          mobilecheck:{
            onEntry: assign((context, event) => {
              let message1='It seems the mobile number you are using is not linked with <Service_Name> service. Please visit ULB to link your account number with Service_Name. Still you can avail service by searching your account information.';
              context.chatInterface.toUser(context.user, message1);
            }),
            always:[
              {
                target:'#searchreceiptinitiate',
              }
            ]
          },
        },
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
              let message = 'Sorry, I didn\'t understand';
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
                target: '#receiptslip',
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
                return dummyReceipts.fetchReceiptsForParam(context.user, slots.menu, slots.searchparams, slots.paraminput);
              },
              onDone:[
                {
                  cond:(context,event)=>{
                    return event.data.length>0
                  },
                  target: 'listofreceipts',
                },
                {
                  actions: assign((context, event) => {
                    let message = 'The ' + context.receipts.slots.searchParamOption + ': ' + context.receipts.slots.paraminput + ' is not found in our records. Please Check the details you have provided once again.';
                    context.chatInterface.toUser(context.user, message);
                  }),
                  target:'#searchparams'
                },
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = 'Sorry. Some error occurred on server';
                  context.chatInterface.toUser(context.user, message);
                })
              }  
            
            },
          },
          listofreceipts:{
            onEntry: assign((context, event) => {
              let mess1='Your Water 🚰 and Sewerage last three payments receipts for consumer number WS12654321 against property in Azad Nagar, Amritsar are given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.';
              let mess2='Last three Payment Receipt Details:\n\n1. 10/07/2019 - Rs. 630 - TRNS1234\nLink: www.mseva.gov.in/pay/tax1234\n\n2. 15/10/2019 - Rs. 580 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n3. 17/01/2020 - Rs. 620 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n';
              context.chatInterface.toUser(context.user, mess1);
              context.chatInterface.toUser(context.user, mess2);
            }),
            always:[
              {
                target:'#searchreceiptinitiate',
              }
            ]
          },
        },
      },//receipts
    }//receipts.states
};

let messages = {
  services:{
  question: {
    preamble: {
      en_IN: 'Please type and send the number of your option from the list given 👇 below:'
    },
  },
  },
  searchparams:{
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below:'
      }
    }
  },
  mobilelinkage:{
    notLinked: {
      en_IN: 'It seems the mobile number you are using is not linked with <Service_Name> service. Please visit ULB to link your account number with Service_Name. Still you can avail service by searching your account information.'
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
  searchreceiptinitiate:{
    question:{
      en_IN:'Please type and send ‘1’ to Search and View for past payments which are not linked to your mobile number.'
    },

  },
};

module.exports = receipts;
