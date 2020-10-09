import { Machine, interpret, assign } from "xstate";

var stateMachine = new Machine({
      initial: "start",
      states: {
        start: {
          onExit: "log",
          on: {
            user_entry:  {
              show_recent_complaints: {
                cond: (text) => text.length > 0 && text == "1"
              },
              select_city: {
                cond: (text) => text.length > 0 && text == "2"
              }
            }
          }
        },
        show_recent_complaints: {
          onExit: "log",
          on: {
            user_entry:  {
              end: {
                cond: (text) => text.length > 0
              }
            }
          }
        },
        select_city: {
          onExit: "log",
          on: {
            user_entry:  {
              end: {
                cond: (text) => cities.includes(text.tolowercase())
              }
            }
          }
        },
        end: {
          onExit: "cleanup",
          on: {
            user_entry:  {
              start: {
                cond: (text) => text.length > 0
              }
            }
          }
        },
          
      }
    });
var currentState = stateMachine.initialState;
function log() {
  console.log("exiting " + currentState)
}
var field = document.getElementById("my_editor");
function transition(event, data) {
  currentState = stateMachine.transition(currentState, event, data)
  dict[currentState.value] = data; 
  currentState.actions.forEach(item => window[item]());
}
function handleInput(e) {
  console.log("input " + field.value)
  transition("user_entry", field.value);
}
field.oninput = handleInput;

function cleanup () {
  console.log(dict);
  console.log("this is the end");
  
    dict = {}
}

var dict = {};
console.log("starting ...");

var cities = ["chennai", "mumbai", "bengaluru", "delhi"];

