const { assign } = require('xstate');
const dummyReceipts = require('./service/dummy-receipts');

const receipts = {
    id: 'receipts',
    initial: 'services',
    states: {
      services: {
        id: 'services',
        initial: 'question',
        states:{
          question:{
            onEntry: assign((context, event) => {
              console.log("onEntry");
              context.receipts = {slots: {}};
              let mess='Please type and send the number of your option from the list given 👇 below:\n\n1 for Water and Sewerage Bill.\n2 for Property Tax.\n3 for Trade License Fees.\n4 for Fire NOC Fees.\n5 for Building Plan Scrutiny Fees';
              context.chatInterface.toUser(context.user, mess);
            }),
            on: {
              USER_MESSAGE:'process'
            }
          },//question
          process:{
            onEntry: assign( (context, event) => {
              let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 || event.message.input.trim().localeCompare('3') === 0 || event.message.input.trim().localeCompare('4') === 0 || event.message.input.trim().localeCompare('5') === 0; 
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              if(isValid) {
                context.receipts.slots.menu = event.message.input;
              }
            }),
    
            always:[
              {
                target: 'error',
                cond: (context, event) => {
                  return ! context.message.isValid;
                }
              },

              {
                target: '#trackreceipts',
                cond: (context, event) => {
                  return context.message.isValid;
                }
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
              let message='Please type and send ‘1’ to Search and View for past payments which are not linked to your mobile number.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process'
            }

          },
          process:{
            onEntry: assign( (context, event) => {
              let isValid = event.message.input.trim().localeCompare('1') === 0 ;
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
        initial:'respectiveparams',
        states:{
          respectiveparams:{
            always:[
              {
                target:'question1',
                cond:(context,event)=>{
                  return context.receipts.slots.menu==='1'
                }
              },
              {
                target:'question2',
                cond:(context,event)=>{
                  return context.receipts.slots.menu==='2'
                }
              },
              {
                target:'question3',
                cond:(context,event)=>{
                  return context.receipts.slots.menu==='3'
                }
              },
              {
                target:'question4',
                cond:(context,event)=>{
                  return context.receipts.slots.menu==='4'
                }
              },
              {
                target:'question5',
                cond:(context,event)=>{
                  return context.receipts.slots.menu==='5'
                }
              },
            ], 
          },
          question1:{
            onEntry: assign((context, event) => {
              context.mobile = {slots: {}};
              let message='Please type and send the number of your option from the list given 👇 below:\n\n1. Search 🔎 using another Mobile No📱.\n\n2. Search 🔎 using Connection No.\n\n3. Search 🔎 using Consumer ID/Consumer Number.\n\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process1'
            }

          },
          process1:{
            onEntry: assign( (context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 || event.message.input.trim().localeCompare('3') === 0; 
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              if(isValid) {
                var searchParamOption = ''
                if(parsedInput === 1)
                  searchParamOption = 'Mobile Number'
                else if(parsedInput === 2)
                  searchParamOption = 'Connection Number'
                else
                  searchParamOption = 'Consumer ID'
                context.receipts.slots.searchParamOption = searchParamOption;
                context.receipts.slots.searchparams=event.message.input;
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
                target:'#paraminput',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },

            ]
    
          },
          question2:{
            onEntry: assign((context, event) => {
              context.mobile = {slots: {}};
              let message='Please type and send the number of your option from the list given 👇 below:\n\n1. Search 🔎 using another Mobile No📱.\n\n2. Search 🔎 using Property ID.\n\n3. Search 🔎 using Consumer ID/Consumer Number.\n\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process2'
            }

          },
          process2:{
            onEntry: assign( (context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 || event.message.input.trim().localeCompare('3') === 0; 
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              if(isValid) {
                var searchParamOption = ''
                if(parsedInput === 1)
                  searchParamOption = 'Mobile Number'
                else if(parsedInput === 2)
                  searchParamOption = 'property ID'
                else
                  searchParamOption = 'Consumer ID'
                context.receipts.slots.searchParamOption = searchParamOption;
                context.receipts.slots.searchparams=event.message.input;
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
                target:'#paraminput',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },

            ]
    
          },
          question3:{
            onEntry: assign((context, event) => {
              context.mobile = {slots: {}};
              let message='Please type and send the number of your option from the list given 👇 below:\n\n1. Search 🔎 using another Mobile No📱.\n\n2. Search 🔎 using TL Application Number.\n\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process3'
            }

          },
          process3:{
            onEntry: assign( (context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 ; 
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              if(isValid) {
                var searchParamOption = ''
                if(parsedInput === 1)
                  searchParamOption = 'Mobile Number'
                else
                  searchParamOption = 'TL Application number'
                context.receipts.slots.searchParamOption = searchParamOption;
                context.receipts.slots.searchparams=event.message.input;
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
                target:'#paraminput',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },

            ]
    
          },
          question4:{
            onEntry: assign((context, event) => {
              context.mobile = {slots: {}};
              let message='Please type and send the number of your option from the list given 👇 below:\n\n1. Search 🔎 using another Mobile No📱.\n\n2. Search 🔎 using NOC Application Number.\n\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process4'
            }

          },
          process4:{
            onEntry: assign( (context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 ; 
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              if(isValid) {
                var searchParamOption = ''
                if(parsedInput === 1)
                  searchParamOption = 'Mobile Number'
                else
                  searchParamOption = 'NOC Application Number'
                context.receipts.slots.searchParamOption = searchParamOption;
                context.receipts.slots.searchparams=event.message.input;
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
                target:'#paraminput',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },

            ]
    
          },
          question5:{
            onEntry: assign((context, event) => {
              context.mobile = {slots: {}};
              let message='Please type and send the number of your option from the list given 👇 below:\n\n1. Search 🔎 using another Mobile No📱.\n\n2. Search 🔎 using BPA Application Number.\n\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process5'
            }

          },
          process5:{
            onEntry: assign( (context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 ; 
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              if(isValid) {
                var searchParamOption = ''
                if(parsedInput === 1)
                  searchParamOption = 'Mobile Number'
                else
                  searchParamOption = 'BPA Application number'
                context.receipts.slots.searchParamOption = searchParamOption;
                context.receipts.slots.searchparams=event.message.input;
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
                target:'#paraminput',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },

            ]
    
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
          question:{
            onEntry: assign((context, event) => {
              let message='Please Enter  '+ context.receipts.slots.searchParamOption +'  to view the bill. (Condition example: Do not use +91 or 0 before mobile number)\n\n or Type and send 5 to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process'
            },
          },
          process:{
            onEntry: assign( (context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              let isValid = event.message.input.length ===10 ;
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              if(isValid) {
                context.receipts.slots.paraminput =parsedInput;
              }
            }),

            always:[
              {
                target: 'error',
                cond: (context, event) => {
                  return ! context.message.isValid;
                }
              },
              {
                target:'#receiptslip',
              }
            ]

          },
          error: {
            onEntry: assign( (context, event) => {
              let message = 'Invalid Entry , \nPlease try again!!';
              context.chatInterface.toUser(context.user, message);
            }),
            always : [
              {
                target: 'question'
              }
            ]
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
  menu: {
    question: {
      en_IN : 'Please type\n\n1 for Water and Sewerage Bill.\n2 for Property Tax.\n3 for Trade License Fees.\n4 for Fire NOC Fees.\n5 for Building Plan Scrutiny Fees',
    }
  } 
};

// let messages = {
//   menu: {
//     question: {
//       en_IN : 'Please type\n\n1 for Water and Sewerage Bill.\n2 for Property Tax.\n3 for Trade License Fees.\n4 for Fire NOC Fees.\n5 for Building Plan Scrutiny Fees',
//     }
// }
// };

module.exports = receipts;

