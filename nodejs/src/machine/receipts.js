const { assign } = require('xstate');
const receipts = {
    id: 'receipts',
    initial: 'receiptsMenu',
    states: {
      receiptsMenu: {
        id: 'receiptsMenu',
        onEntry: assign((context, event) => {
          context.chatInterface.toUser(context.user, "Receipts is unimplemented");
        }),
        always: '#sevamenu'
      },
    }
};
module.exports = receipts;