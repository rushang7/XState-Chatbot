const { assign } = require('xstate');
const pgrService = require('./service/service-loader')
const {get_message, get_intention, INTENTION_UNKOWN} = require('./util/dialog.js');


const pgr =  {
  id: 'pgr',
  initial: 'menu',
  states: {
    menu : {
      id: 'menu',
      initial: 'question',
      states: {
        question: {
          onEntry: assign( (context, event) => {
              context.chatInterface.toUser(context.user, get_message(messages.menu.question, context.user.locale));
              context.pgr = {slots: {}}; // TODO is this the right pattern? Seems wrong
          }),
          on: {
              USER_MESSAGE:'process'
          }
        }, // question
        process: {
          onEntry: assign((context, event) => {
            let isValid = event.message.input.trim().localeCompare('1') === 0 || event.message.input.trim().localeCompare('2') === 0; 

            context.message = {
              isValid: isValid,
              messageContent: event.message.input
            }
            if(isValid) {
              context.pgr.slots.menu = event.message.input;
            }
          }),
          always : [
            {
              target: 'error',
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: '#fileComplaint',
              cond: (context, event) => {
                return context.message.messageContent.localeCompare('1') === 0;
              }
            },
            {
              target: '#trackComplaint',
              cond: (context, event) => { 
                return  context.message.messageContent.localeCompare('2') === 0; 
              }
            }
          ]
        }, // menu.process
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
        } // menu.error
      }, // menu.states
    }, // menu
    fileComplaint: {
      id: 'fileComplaint',
      initial: 'complaintType',
      states: {
        complaintType: {
          id: 'complaintType',
          initial: 'top4',
          states: {
            top4: {
              invoke: {
                id: 'top4',
                src: (context) => pgrService.fetchFrequentComplaints(context.user.locale),
                onDone: {
                  actions: assign((context, event) => {
                    // TODO create grammer and prompt dynamically
                    var complaints = event.data;
                    var message = 'Please enter name of the compaint';
                    for(var i = 0; i < complaints.length; i++) {
                      message += '\n' + (i+1) + '. ' + complaints[i];
                    }
                    context.maxValidEntry = complaints.length;
                    context.chatInterface.toUser(context.user, message);
                  })
                },
                onError: {
                  actions: assign((context, event) => {
                    let message = 'Sorry. Some error occurred on server';
                    context.chatInterface.toUser(context.user, message);
                  })
                },
              },
              on: {
                USER_MESSAGE: '#city'
              }
            } //top4
          } // states
        }, // complaintType
        city: {
          id: 'city',
          initial: 'question',
          states: {
            question: {
              invoke: {
                id: 'fetchCities',
                src: (context, event) => pgrService.fetchCities(),
                onDone: {
                  actions: assign((context, event) => {
                    var cityNames = event.data;
                    var message = 'Please enter name of the city';
                    for(var i = 0; i < cityNames.length; i++) {
                      message += '\n' + (i+1) + '. ' + cityNames[i];
                    }
                    context.maxValidEntry = cityNames.length;
                    context.chatInterface.toUser(context.user, message);
                  })
                },
                onError: {
                  actions: assign((context, event) => {
                    let message = 'Sorry. Some error occurred on server';
                    context.chatInterface.toUser(context.user, message);
                  })
                }
              },
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry:  assign((context, event) => {
                let parsed = parseInt(event.message.input.trim())
                // debugger
                let isValid = !isNaN(parsed) && parsed >=0 && parsed <= context.maxValidEntry;
                context.message = {
                  isValid: true,
                  messageContent: event.message.input.trim()
                }
                if(isValid) { // TODO This does not seem to be the right place for this. It's too early here
                  context.pgr.slots.city = parsed;
                }
              }),
              always : [
                {
                  target: 'error',
                  cond: (context, event) => {
                    return ! context.message.isValid;
                  }
                },
                {
                  target: '#geoLocationSharingInfo'
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
        geoLocationSharingInfo: {
          id: 'geoLocationSharingInfo',
          onEntry: assign( (context, event) => {
            context.chatInterface.toUser(context.user, '<i>Informational Image</i>');
          }),
          always: [ { target: 'geoLocation' } ]
        },
        geoLocation: {
          id: 'geoLocation',
          initial: 'question',
          states : {
            question: {
              onEntry: assign( (context, event) => {
                let message = 'Please share your geo-location or type and send \'No\'';
                context.chatInterface.toUser(context.user, message);
              }),
              on: {
                USER_MESSAGE: [ { target: 'process' } ]
              }
            },
            process: {
              onEntry: assign( (context, event) => {
                let message = event.message;
                if(message.type === 'location') {
                  context.pgr.slots.geoLocation = message.input;
                } else {
                  console.error(`Expected location message type. Received ${message.type}. Unimplemented. Skipping ...`);
                }
              }),
              always: [
                {
                  target: '#fileComplaint',
                  cond: (context, event) => {
                    if(context.pgr.slots.geoLocation)
                      return true;
                  }
                },
                {
                  target: '#locality'
                }
              ]
            }
          }
        },
        locality: {
          id: 'locality',
          initial: 'question',
          states: {
            question: {
              onEntry: assign( (context, event) => {
                let message = 'Please enter your locality'
                context.chatInterface.toUser(context.user, message);
              }),
              on: {
                USER_MESSAGE: [{target: 'process'}]
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.pgr.slots.locality = event.message.input;
              }),
              always: [{target: '#persistComplaint'}]
            }
          }
        },
        persistComplaint: {
          id: 'persistComplaint',
          always: '#endstate',
          onEntry: assign((context, event) => {
            console.log(context.pgr.slots);
            //make api call
            console.log('Making api call to PGR Service');
            let message = 'Complaint has been filed successfully {{number}}';
            let number = '123';
            message = message.replace('{{number}}', number);
            context.chatInterface.toUser(context.user, message);
            context.pgr = {};
          })
        },
      }, // fileComplaint.states
    },  // fileComplaint
    trackComplaint: {
      id: 'trackComplaint',
      always: '#endstate',
      onEntry: assign( (context, event) => {
        //make api call
        console.log('Making an api call to PGR Service');
        let message = 'Here are your recent complaints {{details}}';
        let details = 'No. - 123, ...';
        message = message.replace('{{details}}', details);
        context.chatInterface.toUser(context.user, message);
        context.pgr = {};
      })
    } // trackComplaint
  } // pgr.states
} // pgr

let messages = {
  menu: {
    question: {
      en_IN : 'Please type\n\n  1 to File New Complaint.\n  2 to Track Your Complaints',
      hi_IN: 'कृप्या टाइप करे\n\n  1 यदि आप शिकायत दर्ज करना चाहते हैं\n  2 यदि आप अपनी शिकायतों की स्थिति देखना चाहते हैं'
    }
  } 
};
module.exports = pgr;