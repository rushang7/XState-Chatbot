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
          let message = 'Your response is recorded and respective details will be sent to u soon';
          context.chatInterface.toUser(context.user, message);
        }),
      }
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