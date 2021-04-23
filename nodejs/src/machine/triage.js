const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const { triageService } = require('./service/service-loader');

const triageFlow = {
    id: 'triageFlow'
}

module.exports = triageFlow;