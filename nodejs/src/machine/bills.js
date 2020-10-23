const { assign } = require('xstate');
const bills = {
    id: 'bills',
    initial: 'menu',
    states: {
      menu: {
        id: 'menu',
        onEntry: assign((context, event) => {
          context.chatInterface.toUser(context.user, "Bills is unimplemented");
        }),
        always: '#sevamenu'
      },
    }
};
module.exports = bills;