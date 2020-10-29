class StateRepository {

    constructor() {
        this.states = {};
    }

    async insertNewState(userId, active, state) {
        this.states[userId] = state;
    }

    async updateState(userId, active, state) {
        this.states[userId] = state;
    }

    async getActiveStateForUserId(userId) {
        if(this.states[userId]) {
            return JSON.parse(this.states[userId]);
        }
    }

}

module.exports = new StateRepository();