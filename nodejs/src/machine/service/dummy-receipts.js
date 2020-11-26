const receipts = require("../receipts");

class DummyReceipts{

    getSupportedServicesAndMessageBundle() {
        let services = [ 'WS', 'PT', 'TL', 'FNOC', 'BPA' ];
        let messageBundle = {
          WS: {
            en_IN: 'Water and Sewerage Bill'
          },
          PT: {
            en_IN: 'Property Tax'
          },
          TL: {
            en_IN: 'Trade License Fees'
          },
          FNOC: {
            en_IN: 'Fire NOC Fees'
          },
          BPA: {
            en_IN: 'Building Plan Scrutiny Fees'
          }
        }
    
        return { services, messageBundle };
    }
    getSearchOptionsAndMessageBundleForService(service) {
        let messageBundle = {
          mobile: {
            en_IN: 'Search 🔎 using another Mobile No.📱'
          },
          connectionNumber: {
            en_IN: 'Search 🔎 using Connection No.'
          },
          consumerNumber: {
            en_IN: 'Search 🔎 using Consumer Number'
          },
          propertyId: {
            en_IN: 'Search 🔎 using Property ID'
          },
          tlApplicationNumber: {
            en_IN: 'Search 🔎 using Trade License Application Number'
          },
          nocApplicationNumber: {
            en_IN: 'Search 🔎 using NOC Application Number'
          },
          bpaApplicationNumber: {
            en_IN: 'Search 🔎 using BPA Application Number'
          }
        }
        let searchOptions = [];
        if(service === 'WS') {
          searchOptions = [ 'mobile', 'connectionNumber', 'consumerNumber' ];
        }
        else if(service === 'PT') {
          searchOptions = [ 'mobile', 'propertyId', 'consumerNumber' ];
        } 
        else if(service === 'TL') {
          searchOptions = [ 'mobile', 'tlApplicationNumber' ];
        } 
        else if(service === 'FNOC') {
          searchOptions = [ 'mobile', 'nocApplicationNumber' ];
        } 
        else if(service === 'BPA') {
          searchOptions = [ 'mobile', 'bpaApplicationNumber' ];
        }
        return { searchOptions, messageBundle };
    }
    getOptionAndExampleMessageBundle(service, searchParamOption) {
        let option = {
          en_IN: 'Mobile Number'
        };
        let example = {
          en_IN: 'Do not use +91 or 0 before mobile number.'
        }
        return { option, example };
    }
    validateParamInput(service, searchParamOption, paramInput) {
        if(searchParamOption === 'mobile') {
          let regexp = new RegExp('^[0-9]{10}$');
          return regexp.test(paramInput)
        }
        return true;
    }
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
        return this.findreceipts(user);
    }

}
module.exports = new DummyReceipts();