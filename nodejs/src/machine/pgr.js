const { assign } = require('xstate');
const { pgrService } = require('./service/service-loader');
const dialog = require('./util/dialog');

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
              context.chatInterface.toUser(context.user, dialog.get_message(messages.menu.question, context.user.locale));
          }),
          on: {
              USER_MESSAGE:'process'
          }
        }, // menu.question
        process: {
          onEntry: assign((context, event) => context.intention = dialog.get_intention(grammer.menu.question, event)),
          always : [
            {
              target: '#fileComplaint',
              cond: (context) => context.intention == 'file_new_complaint'
            },
            {
              target: '#trackComplaint', 
              cond: (context) => context.intention == 'track_existing_complaints'
            },
            {
              target: 'error'
            }
          ]
        }, // menu.process
        error: {
          onEntry: assign( (context, event) => context.chatInterface.toUser(context.user, dialog.get_message(dialog.global_messages.error.retry, context.user.locale))),
          always : 'question'
        } // menu.error
      }, // menu.states
    }, // menu
    fileComplaint: {
      id: 'fileComplaint',
      initial: 'complaintType',
      states: {
        complaintType: {
          id: 'complaintType',
          initial: 'question',
          states: {
            question: {
              invoke: {
                src: (context) => pgrService.fetchFrequentComplaints(),
                id: 'fetchFrequentComplaints',
                onDone: {
                  actions: assign((context, event) => {
                    let preamble = dialog.get_message(messages.fileComplaint.complaintType.question.preamble, context.user.locale);
                    let {prompt, grammer} = dialog.constructListPromptAndGrammer(event.data, messages.complaintCodes, context.user.locale, true);
                    context.grammer = grammer; // save the grammer in context to be used in next step
                    context.chatInterface.toUser(context.user, `${preamble}${prompt}`);
                  }) 
                },
                onError: {
                  target: '#system_error'
                }
              },
              on: {
                USER_MESSAGE: 'process'
              }
            }, //question
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event) 
              }),
              always: [
                {
                  target: '#complaintType2Step',
                  cond: (context) => context.intention == dialog.INTENTION_MORE
                },
                {
                  target: '#geoLocationSharingInfo',
                  cond: (context) => context.intention != dialog.INTENTION_UNKOWN,
                  actions: assign((context, event) => {
                    context.slots.pgr["complaint"]= context.intention;
                  })
                },
                {
                  target: 'error'
                }
              ]
            }, // process
            error: {
              onEntry: assign( (context, event) => {
                context.chatInterface.toUser(context.user, dialog.get_message(dialog.global_messages.error.retry, context.user.locale));
              }),
              always: 'question',
            } // error
          } // states of complaintType
        }, // complaintType
        complaintType2Step: {
          id: 'complaintType2Step',
          initial: 'complaintCategory',
          states: {
            complaintCategory: {
              id: 'complaintCategory',
              initial: 'question',
              states: {
                question: {
                  invoke:  {                  
                    src: (context, event)=>pgrService.fetchComplaintCategories(),
                    id: 'fetchComplaintCategories',
                    onDone: {
                      actions: assign((context, event) => {
                        let preamble = dialog.get_message(messages.fileComplaint.complaintType2Step.category.question.preamble, context.user.locale);
                        let {prompt, grammer} = dialog.constructListPromptAndGrammer(event.data, messages.complaintCategories, context.user.locale);
                        context.grammer = grammer; // save the grammer in context to be used in next step
                        context.chatInterface.toUser(context.user, `${preamble}${prompt}`);
                      }),
                    }, 
                    onError: {
                      target: '#system_error'
                    }
                  },
                  on: {
                    USER_MESSAGE: 'process'
                  }
                }, //question
                process: {
                  onEntry: assign((context, event) => {
                    context.intention = dialog.get_intention(context.grammer, event, true) 
                  }),
                  always: [
                    {
                      target: '#complaintItem',
                      cond: (context) => context.intention != dialog.INTENTION_UNKOWN
                    },
                    {
                      target: 'error'
                    }
                  ]
                }, // process
                error: {
                  onEntry: assign( (context, event) => {
                    context.chatInterface.toUser(context.user, dialog.get_message(dialog.global_messages.error.retry, context.user.locale));
                  }),
                  always:  'question',
                } // error
              } // states of complaintCategory
            }, // complaintCategory
            complaintItem: {
              id: 'complaintItem',
              initial: 'question',
              states: {
                question: {
                  invoke:  {                  
                    src: (context) => pgrService.fetchComplaintItemsForCategory(context.intention),
                    id: 'fetchComplaintItemsForCategory',
                    onDone: {
                      actions: assign((context, event) => {
                        let preamble = dialog.get_message(messages.fileComplaint.complaintType2Step.item.question.preamble, context.user.locale);
                        let {prompt, grammer} = dialog.constructListPromptAndGrammer(event.data, messages.complaintCodes, context.user.locale, false, true);
                        context.grammer = grammer; // save the grammer in context to be used in next step
                        context.chatInterface.toUser(context.user, `${preamble}${prompt}`);
                      })
                    }, 
                    onError: {
                      target: '#system_error'
                    }
                  },
                  on: {
                    USER_MESSAGE: 'process'
                  }
                }, //question
                process: {
                  onEntry: assign((context, event) => {
                    context.intention = dialog.get_intention(context.grammer, event) 
                  }),
                  always: [
                    {
                      target: '#complaintCategory',
                      cond: (context) => context.intention == dialog.INTENTION_GOBACK
                    },
                    {
                      target: '#geoLocationSharingInfo',
                      cond: (context) => context.intention != dialog.INTENTION_UNKOWN,
                      actions: assign((context, event) => {
                        context.slots.pgr["complaint"]= context.intention;
                      })
                    },
                    {
                      target: 'error'
                    }
                  ]
                }, // process
                error: {
                  onEntry: assign( (context, event) => {
                    context.chatInterface.toUser(context.user, dialog.get_message(dialog.global_messages.error.retry, context.user.locale));
                  }),
                  always:  'question',
                } // error
              } // states of complaintItem
            }, // complaintItem
          } // states of complaintType2Step
        }, // complaintType2Step
        geoLocationSharingInfo: {
          id: 'geoLocationSharingInfo',
          onEntry: assign( (context, event) => {
            context.chatInterface.toUser(context.user, '_Informational Image_');
          }),
          always: 'geoLocation'
        },
        geoLocation: {
          id: 'geoLocation',
          initial: 'question',
          states : {
            question: {
              onEntry: assign( (context, event) => {
                let message = dialog.get_message(messages.fileComplaint.geoLocation.question, context.user.locale)
                context.chatInterface.toUser(context.user, message);
              }),
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              invoke: {
                id: 'getCityAndLocality',
                src: (context, event) => {
                  if(event.message.type === 'location') {
                    context.slots.pgr.geocode = event.message.input;
                  }
                  return pgrService.getCityAndLocalityForGeocode(event)
                },
                onDone: [
                  {
                    target: '#confirmLocation',
                    cond: (context, event) => event.data.city,
                    actions: assign((context, event) => {
                      context.slots.pgr["city"]= event.data.city;
                      context.slots.pgr["locality"] = event.data.locality;
                    })
                  },
                  {
                    target: '#city',
                    actions: assign((context, event) => {
                      console.log('qwe');
                    })
                  }
                ],
                onError: {
                  target: '#city',
                  actions: assign((context, event) => {
                    let message = dialog.get_message(dialog.global_messages.system_error, context.user.locale);
                    context.chatInterface.toUser(context.user, message); // TODO - Rushang - message should say, "we are going to try different approach"
                  })
                }
              }
            }
          }
        },
        confirmLocation: {
          id: 'confirmLocation',
          initial: 'question',
          states: {
            question: {
              onEntry: assign((context, event) => {
                // TODO - Rushang clean this?
                var message = 'Is this the correct location of the complaint?';
                message += '\nCity: ' + context.slots.pgr["city"];
                message += '\nLocality: ' + context.slots.pgr["locality"];
                message += '\nPlease send \'No\', if it isn\'t correct'
                context.chatInterface.toUser(context.user, message);
              }),
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                if(event.message.input.trim().toLowerCase() === 'no') {
                  context.slots.pgr["locationConfirmed"] = false;
                } else {
                  context.slots.pgr["locationConfirmed"] = true;
                }
              }),
              always: [
                {
                  target: '#persistComplaint',
                  cond: (context, event) => context.slots.pgr["locationConfirmed"]  && context.slots.pgr["locality"]
                },
                {
                  target: '#locality',
                  cond: (context, event) => context.slots.pgr["locationConfirmed"] 
                },
                {
                  target: '#city'
                }
              ]
            }
          }
        },
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
                    let preamble = "Click here to select your city"
                    context.grammer = dialog.constructLiteralGrammer(event.data, messages.cities, context.user.locale);
                    context.chatInterface.toUser(context.user, `${preamble}`);
                  })
                },
                onError: {
                  target: '#system_error'
                }
              },
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry:  assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event) 
              }),
              always : [
                {
                  target: '#locality',
                  cond: (context) => context.intention != dialog.INTENTION_UNKOWN,
                  actions: assign((context, event) => context.slots.pgr["city"] = context.intention)    
                },
                {
                  target: 'error',
                }, 
              ]
            },
            error: {
              onEntry: assign( (context, event) => {
                context.chatInterface.toUser(context.user, dialog.get_message(dialog.global_messages.error.retry, context.user.locale));
              }),
              always:  'question',
            }
          }
        },
        locality: {
           // TODO - Rushang move to invoke pattern
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
                context.slots.pgr["locality"] = event.message.input;
              }),
              always: '#persistComplaint'
            }
          }
        },
        persistComplaint: {
          // TODO - Rushang move to invoke pattern
          id: 'persistComplaint',
          always: '#endstate',
          onEntry: assign((context, event) => {
            console.log(context.slots.pgr);
            //make api call
            console.log('Making api call to PGR Service');
            let message = 'Complaint has been filed successfully {{number}}';
            let number = '123';
            message = message.replace('{{number}}', number);
            context.chatInterface.toUser(context.user, message);
            context.chatInterface.toUser(context.user, `Complaint Details: ${JSON.stringify(context.slots.pgr)}`);
            context.slots.pgr = {}; // clear slots
          })
        },
      }, // fileComplaint.states
    },  // fileComplaint
    trackComplaint: {
       // TODO - Rushang move to invoke pattern
      id: 'trackComplaint',
      always: '#endstate',
      onEntry: assign( (context, event) => {
        //make api call
        console.log('Making an api call to PGR Service');
        let message = 'Here are your recent complaints {{details}}';
        let details = 'No. - 123, ...';
        message = message.replace('{{details}}', details);
        context.chatInterface.toUser(context.user, message);
      })
    } // trackComplaint
  } // pgr.states
}; // pgr

let messages = {
  menu: {
    question: {
      en_IN : 'Please type\n\n1 to File New Complaint.\n2 to Track Your Complaints',
      hi_IN: 'कृप्या टाइप करे\n\n1 यदि आप शिकायत दर्ज करना चाहते हैं\n2 यदि आप अपनी शिकायतों की स्थिति देखना चाहते हैं'
    }
  },
  fileComplaint: {
    complaintType: {
      question: {
        preamble: {
          en_IN : 'Please enter the number for your complaint',
          hi_IN : 'कृपया अपनी शिकायत के लिए नंबर दर्ज करें'
        },
        other: {
          en_IN : 'Other ...',
          hi_IN : 'कुछ अन्य ...'
        }
      }
    }, // complaintType
    complaintType2Step: {
      category: {
        question: {
          preamble: {
            en_IN : 'Please enter the number for your complaint category',
            hi_IN : 'अपनी शिकायत श्रेणी के लिए नंबर दर्ज करें'
          },
        }
      },
      item: {
        question: {
          preamble : {
            en_IN : 'Please enter the number for your complaint item',
            hi_IN : 'अपनी शिकायत के लिए नंबर दर्ज करें'
          },
        }
      },
    }, // complaintType2Step
    geoLocation: {
      question: {
        en_IN :'If you are at the grievance site, please share your location. Otherwise type any character.',
        hi_IN : 'यदि आप शिकायत स्थल पर हैं, तो कृपया अपना स्थान साझा करें। अगर नहीं किसी भी चरित्र को टाइप करें।'
      }
    } // geoLocation 
  }, // fileComplaint
  cities: {
    "pb.jalandhar": {
      en_IN : "Jalandhar",
      hi_IN : "जालंधर"
    },
    "pb.amritsar": {
      en_IN : "Amritsar",
      hi_IN : "अमृतसर"
    },
    "pb.patankot": {
      en_IN : "Patankot",
      hi_IN : "पठानकोट"
    },
    "5": {
      en_IN : "Nawanshahr",
      hi_IN : "नवांशहर"
    }
  },
  complaintCodes: {
    NoStreetlight: {
      en_IN : "Please install new streetlight",
      hi_IN : "कृपया नई स्ट्रीटलाइट स्थापित करें"
    },
    StreetLightNotWorking: {
      en_IN : "Streetlight not working",
      hi_IN : "स्ट्रीटलाइट काम नहीं कर रही है"
    },
    GarbageNeedsTobeCleared: {
      en_IN : "Garbage not cleared",
      hi_IN : "स्ट्रीटलाइट काम नहीं कर रही है"
    },
    DamagedGarbageBin: {
      en_IN : "Garbage bin damaged",
      hi_IN : "कचरा बिन टूटा है"
    },
    BurningOfGarbage: {
      en_IN : "Garbage being burnt",
      hi_IN : "कचरा जलाया जा रहा है"
    },
    OverflowingOrBlockedDrain: {
      en_IN : "Drain overflow / blocked",
      hi_IN : "नाली अतिप्रवाह या अवरुद्ध है"
    },
    illegalDischargeOfSewage: {
      en_IN : "Sewage illegal discharge",
      hi_IN : "सीवेज का अवैध निर्वहन"
    },
    BlockOrOverflowingSewage: {
      en_IN : "Sewage overflow / blocked",
      hi_IN : "सीवेज अतिप्रवाह या अवरुद्ध है"
    },
    ShortageOfWater: {
      en_IN : "Water shortage",
      hi_IN : "पानी की कमी"
    },
    NoWaterSupply: {
      en_IN : "No Water supply",
      hi_IN : "पानी नहीं है"
    },
    DirtyWaterSupply: {
      en_IN : "Water supply dirty",
      hi_IN : "पानी गंदी है"
    },
    BrokenWaterPipeOrLeakage: {
      en_IN : "Pipe broken / leaking",
      hi_IN : "पानी का पाइप टूट या लीक होना"
    },
    WaterPressureisVeryLess: {
      en_IN : "Low water pressure",
      hi_IN : "कम पानी का दबाव"
    },
    DamagedRoad: {
      en_IN : "Road bad condition",
      hi_IN : "सड़क टूटी हुई है"
    },
    WaterLoggedRoad: {
      en_IN : "Road waterlogged ",
      hi_IN : "ड़क पर पानी जमा है"
    },
    ManholeCoverMissingOrDamaged: {
      en_IN : "Manhole open / cover damaged",
      hi_IN : "मैनहोल खुला है या कवर गायब है"
    },
    DamagedOrBlockedFootpath: {
      en_IN : "Footpath bad condition / blocked",
      hi_IN : "फुटपाथ टूटा या अवरुद्ध है"
    },
    ConstructionMaterialLyingOntheRoad: {
      en_IN : "Construction material lying on road",
      hi_IN : "निर्माण सामग्री सड़क पर पड़ी है"
    },
    RequestSprayingOrFoggingOperation: {
      en_IN : "Request mosquito spraying",
      hi_IN : "मच्छरों के लिए डरावना"
    },
    StrayAnimals: {
      en_IN : "Stray animal menace",
      hi_IN : "आवारा पशु खतरा"
    },
    DeadAnimals: {
      en_IN : "Dead animal. Please remove.",
      hi_IN : "मृत पशु। कृपया निकालें"
    },
    DirtyOrSmellyPublicToilets: {
      en_IN : "Toilet dirty / smelly",
      hi_IN : "टॉयलेट गंदा या बदबूदार"
    },
    PublicToiletIsDamaged: {
      en_IN : "Toilet damaged",
      hi_IN : "टॉयलेट टूट गया"
    },
    NoWaterOrElectricityinPublicToilet: {
      en_IN : "No water / electricity in Toilet",
      hi_IN : "टॉयलेट में पानी या बिजली नहीं"
    },
    IllegalShopsOnFootPath: {
      en_IN : "Illegal shops on footpath",
      hi_IN : "फुटपाथ पर अवैध दुकानें"
    },
    IllegalConstructions: {
      en_IN : "Illegal constructions",
      hi_IN : "अवैध निर्माण"
    },
    IllegalParking: {
      en_IN : "Illegal parking",
      hi_IN : "अवैध पार्किंग"
    },
    IllegalCuttingOfTrees: {
      en_IN : "Illegal tree cutting",
      hi_IN : "अवैध पेड़ की कटाई"
    },
    CuttingOrTrimmingOfTreeRequired: {
      en_IN : "Request tree trimming / cutting",
      hi_IN : "पेड़ की कटाई का अनुरोध करें"
    },
    OpenDefecation: {
      en_IN : "Open defecation",
      hi_IN : "खुले में शौच जाना"
    },
    ParkRequiresMaintenance: {
      en_IN : "Request park maintenance",
      hi_IN : "पार्क रखरखाव का अनुरोध करें"
    },
    Others: {
      en_IN : "Something else",
      hi_IN : "कुछ अन्य ..."
    },
  },
  complaintCategories: {
    StreetLights: {
      en_IN : "Streetlights",
      hi_IN : "सड़क की बत्तियाँ"
    },
    Garbage: {
      en_IN : "Garbage",
      hi_IN : "कचरा"
    }, 
    Drains: {
      en_IN : "Drains",
      hi_IN : "नालियों"
    },
    WaterandSewage: {
      en_IN : "Water and Sewage",
      hi_IN : "पानी और सीवेज"
    },
    RoadsAndFootpaths: {
      en_IN : "Roads and Footpaths",
      hi_IN : "सड़कें और फुटपाथ"
    },
    Mosquitos: {
      en_IN : "Mosquitos",
      hi_IN : "मच्छर"
    },
    Animals: {
      en_IN : "Animals",
      hi_IN : "जानवरों"
    },
    PublicToilets: {
      en_IN : "Public Toilets",
      hi_IN : "सार्वजनिक शौंचालय"
    },
    LandViolations: {
      en_IN : "Land violations",
      hi_IN : "भूमि का उल्लंघन"
    },
    Trees: {
      en_IN : "Trees",
      hi_IN : "पेड़"
    },
    OpenDefecation: {
      en_IN : "Open defecation",
      hi_IN : "खुले में शौच जाना"
    },
    Parks: {
      en_IN : "Parks",
      hi_IN : "पार्क"
    },
  }
}; // messages

let grammer = {
  menu: {
    question: [
      {intention: 'file_new_complaint', recognize: ['1', 'file', 'new']},
      {intention: 'track_existing_complaints', recognize: ['2', 'track', 'existing']}
    ]
  },
};
module.exports = pgr;