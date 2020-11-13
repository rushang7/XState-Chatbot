const receipts = require("../receipts");

class DummyReceipts{
    async findreceipts(user){
        let receipts = [
            {
                date: '23/10/2020',
                service: 'WS',
                charges: 'Rs. 100'
            },
            {
                date: '23/10/2020',
                service: 'PT',
                charges: 'Rs. 100'
            }
        ]

        let emptyReceipts = []

<<<<<<< HEAD
        return receipts;
=======
        return emptyReceipts;
>>>>>>> be2fa73ea016317a1c81b9fc6a883bb5c934d837
    }
    async fetchReceiptsForParam(user, menu, searchparams, paraminput) {
        console.log(`Received params: ${user}, ${menu}, ${searchparams}, ${paraminput}`);
        return this.findreceipts(user);
    }

}
module.exports = new DummyReceipts();