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

        return emptyReceipts;
    }
    async fetchReceiptsForParam(user, menu, searchparams, paraminput) {
        console.log(`Received params: ${user}, ${menu}, ${searchparams}, ${paraminput}`);
        return this.fetchBillsFor(user);
    }

}
module.exports = new DummyReceipts();