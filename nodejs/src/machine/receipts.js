const { assign } = require('xstate');
const receipts = {
    id: 'receipts',
    initial: 'receiptsMenu',
    states: {
      receiptsMenu: {
        id: 'receiptsMenu',
        onEntry: assign((context, event) => {
          console.log("onEntry");
          context.receipts = {slots: {}};
          let mess='Please type\n\n1 for Water and Sewerage Bill.\n2 for Property Tax.\n3 for Trade License Fees.\n4 for Fire NOC Fees.\n5 for Building Plan Scrutiny Fees';
          context.chatInterface.toUser(context.user, mess);
        }),
        on: {
          USER_MESSAGE:'process'
        }
        // always: '#sevamenu'
      },
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
          // let message = 'Your response is recorded and respective details will be sent to u soon';
          // context.chatInterface.toUser(context.user, message);
        }),

        always:[
          {
            target: 'error',
            cond: (context, event) => {
              return ! context.message.isValid;
            }
          },
          {
            target: 'WaterandSewerageBill',
            cond: (context, event) => {
              return context.message.messageContent.localeCompare('1') === 0;
            }
          },
          {
            target: 'PropertyTax',
            cond: (context, event) => {
              return context.message.messageContent.localeCompare('2') === 0;
            }
          },
          {
            target: 'TradeLicenseFees',
            cond: (context, event) => {
              return context.message.messageContent.localeCompare('3') === 0;
            }
          },
          {
            target: 'FireNOCFees',
            cond: (context, event) => {
              return context.message.messageContent.localeCompare('4') === 0;
            }
          },
          {
            target: 'BuildingPlanScrutinyFees',
            cond: (context, event) => {
              return context.message.messageContent.localeCompare('5') === 0;
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
            target: 'receiptsMenu'
          }
        ]
      }, // menu.error
      WaterandSewerageBill:{
        onEntry: assign((context, event) => {
          let message1='Your Water 🚰 and Sewerage last three bills and payments details for consumer number WS12654321 against property in Azad Nagar, Amritsar are given 👇 below:\n';
          let message2='Click on the link to view and download a copy of bill or payment receipt\n'
          context.chatInterface.toUser(context.user, message1);
          context.chatInterface.toUser(context.user, message2);
        }),
        always:'#sevamenu'

      },//Water and Sewerage Bill
      PropertyTax:{
        onEntry: assign((context, event) => {
          let message='Last three Payment Receipt Details:\n\n1. 10/07/2019 - Rs. 630 - TRNS1234\nLink: www.mseva.gov.in/pay/tax1234\n\n2. 15/10/2019 - Rs. 580 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n3. 17/01/2020 - Rs. 620 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n';
          context.chatInterface.toUser(context.user, message);
        }),
        always:'#sevamenu'
        

      },//Property Tax
      TradeLicenseFees:{
        onEntry: assign((context, event) => {
          let message='Last three Payment Receipt Details:\n\n1. 10/07/2019 - Rs. 630 - TRNS1234\nLink: www.mseva.gov.in/pay/tax1234\n\n2. 15/10/2019 - Rs. 580 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n3. 17/01/2020 - Rs. 620 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n';
          context.chatInterface.toUser(context.user, message);
        }),
        always:'#sevamenu'

      },//Trade License Fees
      FireNOCFees:{
        onEntry: assign((context, event) => {
          let message='Last three Payment Receipt Details:\n\n1. 10/07/2019 - Rs. 630 - TRNS1234\nLink: www.mseva.gov.in/pay/tax1234\n\n2. 15/10/2019 - Rs. 580 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n3. 17/01/2020 - Rs. 620 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n';
          context.chatInterface.toUser(context.user, message);
        }),
        always:'#sevamenu'

      },//Fire NOC Fees
      BuildingPlanScrutinyFees:{
        onEntry: assign((context, event) => {
          let message='Last three Payment Receipt Details:\n\n1. 10/07/2019 - Rs. 630 - TRNS1234\nLink: www.mseva.gov.in/pay/tax1234\n\n2. 15/10/2019 - Rs. 580 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n3. 17/01/2020 - Rs. 620 - TRNS8765\nLink: www.mseva.gov.in/pay/tax1234\n\n';
          context.chatInterface.toUser(context.user, message);
        }),
        always:'#sevamenu'

      }//BuildingPlanScrutinyFees
    }
};

let messages = {
  menu: {
    question: {
      en_IN : 'Please type\n\n1 for Water and Sewerage Bill.\n2 for Property Tax.\n3 for Trade License Fees.\n4 for Fire NOC Fees.\n5 for Building Plan Scrutiny Fees',
    }
  } 
};
module.exports = receipts;