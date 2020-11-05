const { assign } = require('xstate');
const receipts = {
    id: 'receipts',
    initial: 'receiptsMenu',
    states: {
      receiptsMenu: {
        id: 'receiptsMenu',
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
                target: '#Mobile',
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
                target: '#receiptsMenu'
              }
            ]
          } // menu.error
        }
      },//receiptsmenu
      Mobile:{
        id:'Mobile',
        initial:'mobilecheck',
        states:{
          mobilecheck:{
            onEntry: assign((context, event) => {
              let message1='It seems the mobile number you are using is not linked with <Service_Name> service. Please visit ULB to link your account number with <Service_Name>. Still you can avail service by searching your account information.';
              context.chatInterface.toUser(context.user, message1);
            }),
            always:[
              {
                target:'#searchparams',
              }
            ]
          },
        },
      },//mobilelinkage
      searchparams:{
        id:'searchparams',
        initial:'question',
        states:{
          question:{
            onEntry: assign((context, event) => {
              context.mobile = {slots: {}};
              let message='Please type and send the number of your option from the list given 👇 below:\n\n1. Search 🔎 using another Mobile No📱.\n\n2. Search 🔎 using Connection No.\n\n3. Search 🔎 using Consumer ID.\n\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process'
            }

          },
          process:{
            onEntry: assign( (context, event) => {
              let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0 || event.message.input.trim().localeCompare('3') === 0; 
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
              context.receipts.slots.searchparams=event.message.input;
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
      },//serachparametre
      paraminput:{
        id:'paraminput',
        initial:'question',
        states:{
          question:{
            onEntry: assign((context, event) => {
              let message='Please Enter Mobile Number to view the bill. (Condition example: Do not use +91 or 0 before mobile number)\n\n or Type and send 5 to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE:'process'
            },
          },
          process:{
            onEntry: assign( (context, event) => {
              context.receipts.slots.mobilenumber=event.message.input;
            }),
            always:[
              {
                target:'#billreceipts',
              }
            ]

          },
        },
      },//parameterinput
      billreceipts:{
        id:'billreceipts',
        initial:'bill',
        states:{
          bill:{
            onEntry: assign((context, event) => {
              let mess1='Your Water 🚰 and Sewerage last three payments receipts for consumer number WS12654321 against property in Azad Nagar, Amritsar are given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.';
              let mess2='Last three Payment Receipt Details:\n\n1. 10/07/2019 - Rs. 630 - TRNS1234\nLink: www.mseva.gov.in/pay/tax1234\n\n2. 15/10/2019 - Rs. 580 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n3. 17/01/2020 - Rs. 620 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n';
              context.chatInterface.toUser(context.user, mess1);
              context.chatInterface.toUser(context.user, mess2);
            }),
            always:[
              {
                target:'#endstate',
              }
            ]
          },
        },
      },
    }//receipts.states
};

let messages = {
  menu: {
    question: {
      en_IN : 'Please type\n\n1 for Water and Sewerage Bill.\n2 for Property Tax.\n3 for Trade License Fees.\n4 for Fire NOC Fees.\n5 for Building Plan Scrutiny Fees',
    }
  } 
};
module.exports = receipts;