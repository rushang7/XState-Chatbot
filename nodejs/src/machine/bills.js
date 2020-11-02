const { assign } = require('xstate');
const { billService } = require('./service/service-loader');


const bills = {
    id: 'bills',
    initial: 'start',
    states: {
      start: {
        onEntry: assign((context, event) => {
          console.log("onEntry");
          context.bills = { slots: {} };
        }),
        invoke: {
          id: 'fetchBillsFor',
          src: (context) => billService.fetchBillsFor(context.user),
          onDone: [
            {
              target: 'personalBills',
              cond: (context, event) => {
                return event.data.pendingBills;
              },
              actions: assign((context, event) => {
                context.bills.pendingBills = event.data.pendingBills;
              })
            },
            {
              target: 'noBills',
              actions: assign((context, event) => {
                context.totalBills = event.data.totalBills;
              })
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
      personalBills: {
        id: 'personalBills',
        onEntry: assign((context, event) => {
          let message = 'Two bills found against your number:\n1. Water & Sewerage I Rs. 630 I Due on 25/06/20\nPayment Link: www.mseva.gov.in/cpay/WSbill/WS123456\n\n2. Property Tax I Rs. 1200 I Due on 30/09/20\nPayment Link: www.mseva.gov.in/cpay/tax/PT123456';
          context.chatInterface.toUser(context.user, message);
        }),
        always: 'searchBillInitiate'
      },
      searchBillInitiate: {
        id: 'searchBillInitiate',
        initial: 'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              let message = 'Please type and send ‘1’ to Search and Pay for other bills or fees which are not linked with your mobile number. \nOr \'mseva\' to Go ⬅️ Back to the main menu.';
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
                target: '#billServices'
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              let message = 'Sorry, I didn\'t understand';
              context.chatInterface.toUser(context.user, message);
            }),
            always : 'question'
          }
        }
      },
      noBills: {
        id: 'noBills',
        onEntry: assign( (context, event) => {
          if(context.totalBills === 0) {
            let message = 'Sorry, your mobile number is not linked to any service. Contact your ULB to link it. You can avail service by searching your account information as given below:';
            context.chatInterface.toUser(context.user, message);
          } else {
            context.chatInterface.toUser(context.user, 'There are no pending bills against your account. You can still search the bills as given below');
          }
        }),
        always: 'billServices'
      },
      billServices: {
        id: 'billServices',
        initial: 'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              let message = 'Please type and send the number of your option from the list given 👇 below to search and pay:\n1. Water and Sewerage Bill\n2. Property Tax\n3. Trade License Fees\n4. Fire NOC Fees\n5. Building Plan Scrutiny Fees';
              context.maxValidEntry = 5;
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            }    
          },
          process: {
            onEntry: assign((context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              var isValid = parsedInput > 0 && parsedInput <= context.maxValidEntry;
              context.message = {
                isValid: isValid,
                messageContent: parsedInput
              }
              console.log(context.message);
              context.bills.slots.service = '';
            }),
            always: [
              {
                target: 'error',
                cond: (context, event) => !context.message.isValid
              },
              {
                target: '#searchParamOptions'
              }
            ]
          },
          error: {
            onEntry: assign((context, event) => {
              let message = 'Sorry, I didn\'t understand. Could please try again entering a number for the given options.';
              context.chatInterface.toUser(context.user, message);
            }),
            always: 'question'
          }
        }
      },
      searchParamOptions: {
        id: 'searchParamOptions',
        onEntry: assign((context, event) => {
          context.chatInterface.toUser(context.user, 'Yet to be implemented');
        }),
        always: '#endstate'
      }
    }
};

let messages = {
  noBills: {
    en_IN: ''
  }
}


module.exports = bills;