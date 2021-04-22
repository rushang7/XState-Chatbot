const { Machine, assign } = require('xstate');
const dialog = require('./util/dialog.js');

const chatStateMachine = Machine({
  id: 'chatMachine',
  initial: 'menu',
  states: {
    menu: {
      id: 'menu',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            console.log('asd');
          })
        }
      }
    }
  }
});

let messages = {
  menu: {
    en_IN: 'Welcome to '
  }
}

let grammer = {
  menu: {
    question: [
      { intention: 'worried', recognize: ['1'] },
      { intention: 'self-care', recognize: ['2'] },
      { intention: 'info', recognize: ['3'] }
    ]
  }
}

module.exports = chatStateMachine;
