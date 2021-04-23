const { assign } = require('xstate');
const dialog = require('./util/dialog.js');

const triageFlow = {
    id: 'triageFlow'
}

module.exports = triageFlow;