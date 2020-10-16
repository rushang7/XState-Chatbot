const pool = require('./db');

class ChatStateRepository {

    constructor() {
        this.persistedStates = {}
    }

    saveState(userId, stateJson) {
        this.persistedStates[userId] = stateJson;
    }

    getActiveStateForUserId(userId) {
        return this.persistedStates[userId];
    }

}

module.exports = new ChatStateRepository();