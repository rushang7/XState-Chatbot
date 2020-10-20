const pool = require('./pg-db-config');

class StateRepository {

    async insertNewState(userId, active, state) {
        const query = 'INSERT INTO chat_state (user_id, active, state) VALUES ($1, $2, $3)';
        let result = await pool.query(query, [userId, active, state]);
        return result;
    }

    async updateState(userId, active, state) {
        const query = 'UPDATE chat_state SET active = $2, state = $3 WHERE user_id = $1';
        let result = await pool.query(query, [userId, active, state]);
        return result;
    }

    async getActiveStateForUserId(userId) {
        const query = 'SELECT (state) FROM chat_state WHERE user_id = $1 AND active = true';
        let result = await pool.query(query, [userId]);
        if(result.rowCount >= 1) {
            let state = result.rows[0].state;
            return state;
        }
    }

}

module.exports = new StateRepository();