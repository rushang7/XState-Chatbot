const { assign } = require('xstate');
const dialog = require('./util/dialog.js');
const { vitalsService } = require('./service/service-loader');

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