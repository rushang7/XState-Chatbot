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
              if(isValid) {
                context.bills.slots.service = parsedInput;
              }
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
        initial: 'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              context.maxValidEntry = 3;
              let message = 'Please type and send the number of your option from the list given 👇 below:\n1. Search 🔎 using another Mobile No.📱\n2. Search 🔎 using Connection No.\n3. Search 🔎 using Consumer ID\n\nOr Type and send \'mseva\' to Go ⬅️ Back to main menu.';
              context.chatInterface.toUser(context.user, message);
            }),
            on: {
              USER_MESSAGE: 'process'
            },
          },
          process: {
            onEntry: assign((context, event) => {
              var parsedInput = parseInt(event.message.input.trim());
              var isValid = parsedInput > 0 && parsedInput <= context.maxValidEntry;
              context.message = {
                isValid: isValid,
                messageContent: parsedInput
              }
              if(isValid) {
                var searchParamOption = ''
                if(parsedInput === 1)
                  searchParamOption = 'Mobile Number'
                else if(parsedInput === 2)
                  searchParamOption = 'Connection Number'
                else
                  searchParamOption = 'Consumer ID'
                context.bills.slots.searchParamOption = searchParamOption;
              }
            }),
            always: [
              {
                target: 'error',
                cond: (context, event) => !context.message.isValid
              },
              {
                target: '#paramInput'
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
      paramInput: {
        id: 'paramInput',
        initial: 'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              context.chatInterface.toUser(context.user, 'Please Enter ' + context.bills.slots.searchParamOption + ' to view the bill.');
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let message = {
                isValid: true,
                messageContent: event.message.input
              };
              context.message = message;
              if(message.isValid) {
                context.bills.slots.paramInput = message.messageContent
              }
            }),
            always: '#listOfBills'
          }
        }
      },
      listOfBills: {
        id: 'listOfBills',
        invoke: {
          id: 'fetchBillsForParam',
          src: (context, event) => {
            let slots = context.bills.slots;
            return billService.fetchBillsForParam(context.user, slots.service, slots.searchParamOptions, slots.paramInput);
          },
          onDone: [
            {
              cond: (context, event) => event.data.pendingBills,
              actions: assign((context, event) => {
                let message = 'Your Water 🚰 and Sewerage bill against consumer number WS123456 for property in Azad Nagar, Amritsar for the period Apr-June 2020 is Rs. 630. \n\nPay before 25th July 2020 to avoid late payment charges. \n\nPayment Link: www.mseva.gov.in/cpay/WSbill/WS123456';
                context.chatInterface.toUser(context.user, message);
              }),
              target: '#searchBillInitiate'
            },
            {
              actions: assign((context, event) => {
                let message = 'The ' + context.bills.slots.searchParamOption + ': ' + context.bills.slots.paramInput + ' is not found in our records. Please Check the details you have provided once again.';
                context.chatInterface.toUser(context.user, message);
              }),
              target: '#searchBillInitiate'
            }
          ]  
        }
      }
    }
};

let messages = {
  noBills: {
    en_IN: ''
  }
}


module.exports = bills;