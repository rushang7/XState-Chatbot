class StateRepository {

    constructor() {
        this.states = {};
    }

    async insertNewState(userId, active, state) {
        this.states.userId = state;
        // console.log(Object.keys(this.states).length);
    }

    async updateState(userId, active, state) {
        this.states.userId = state;
        // console.log(Object.keys(this.states).length);
    }

    async getActiveStateForUserId(userId) {
        // console.log(this.states.userId);
        if(this.states.userId) {
            return JSON.parse(this.states.userId);
        }
    }

}

module.exports = new StateRepository();