class DummyBillService {

    async fetchBillsFor(user) {
        var randomUserBehaviour = parseInt(Math.random() * 3);
        if(randomUserBehaviour === 0) {     // Pending bills exist
            return {
                pendingBills: [{}, {}],
                totalBills: 10
            }
        } else  if(randomUserBehaviour === 1) {
            return {                        // mobile number not linked with any bills
                totalBills: 0
            }
        } else {
            return {
                totalBills: 2,              // No pending, but previous bill do exist
                pendingBills: undefined     // This is so that user doesn't get message saying 'your mobile number is not linked', but rather a message saying 'No pending dues'
            }                               // Not present in PRD. To be discussed with Product Manager.
        }
    }

}

module.exports = new DummyBillService();