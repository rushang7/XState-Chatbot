const { assign } = require('xstate');
const dialog = require('./util/dialog.js');

const selfCareFlow = {
  recordVitals: {
    id: 'recordVitals'
  },
  downloadReport: {
    id: 'downloadReport'
  },
  exitProgram: {
    id: 'exitProgram'
  }
}

module.exports = selfCareFlow;