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
    async findreceipts(user,service){
      let select=0;
      let receipts =  [
          {
            service: 'Water & Sewerage',
            id: 'WS123456',
            secondaryInfo: 'Azad Nagar, Amritsar',
            amount1: '630',
            date1: '10/07/2019',
            transactionNumber1:'TRNS1234',
            amount2: '580',
            date2: '15/10/2019',
            transactionNumber2:'TRNS8765',
            amount3: '620',
            date3: '17/01/2020',
            transactionNumber3:'TRNS8765',
            paymentLink: 'https://mseva.org/pay/1234',
          },
          {
            service: 'Property Tax',
            id: 'PT123456',
            secondaryInfo: 'Azad Nagar, Amritsar',
            amount1: '630',
            date1: '10/07/2019',
            transactionNumber1:'TRNS1234',
            amount2: '580',
            date2: '15/10/2019',
            transactionNumber2:'TRNS8765',
            amount3: '620',
            date3: '17/01/2020',
            transactionNumber3:'TRNS8765',
            paymentLink: 'https://mseva.org/pay/132'
          },
          {
            service: 'Trade License Fees',
            id: 'TLS654321',
            secondaryInfo: 'Azad Nagar, Amritsar',
            amount1: '630',
            date1: '10/07/2019',
            transactionNumber1:'TRNS1234',
            amount2: '580',
            date2: '15/10/2019',
            transactionNumber2:'TRNS8765',
            amount3: '620',
            date3: '17/01/2020',
            transactionNumber3:'TRNS8765',
            paymentLink: 'https://mseva.org/pay/132'
          },
          {
            service: ' Fire NOC Fees',
            id: 'FNCT123456',
            secondaryInfo: 'Azad Nagar, Amritsar',
            amount1: '630',
            date1: '10/07/2019',
            transactionNumber1:'TRNS1234',
            amount2: '580',
            date2: '15/10/2019',
            transactionNumber2:'TRNS8765',
            amount3: '620',
            date3: '17/01/2020',
            transactionNumber3:'TRNS8765',
            paymentLink: 'https://mseva.org/pay/132'
          },
          {
            service: '  Building Plan Scrutiny Fees ',
            id: 'BPAT123456',
            secondaryInfo: 'Azad Nagar, Amritsar',
            amount1: '630',
            date1: '10/07/2019',
            transactionNumber1:'TRNS1234',
            amount2: '580',
            date2: '15/10/2019',
            transactionNumber2:'TRNS8765',
            amount3: '620',
            date3: '17/01/2020',
            transactionNumber3:'TRNS8765',
            paymentLink: 'https://mseva.org/pay/132'
          }
      ]

      let emptyReceipts = []

      if(service==='WS' && select===1){
        receipts=receipts.slice(0,1);
        return receipts;
      }
      else if(service === 'PT' && select===1){
        receipts=receipts.slice(1,2);
        return receipts;
      }
      else if(service === 'TL' && select===1){
        receipts=receipts.slice(2,3);
        return receipts;
      }
      else if(service === 'FNOC' && select===1){
        receipts=receipts.slice(3,4);
        return receipts;
      }
      else if(service === 'BPA' && select===1){
        receipts=receipts.slice(4,5);
        return receipts;
      }
      else if(select===1){
        return emptyReceipts;
      }
    }
    
    async fetchReceiptsForParam(user, service, searchParamOption, paraminput) {
        console.log(`Received params: ${user}, ${service}, ${searchParamOption}, ${paraminput}`);
        return this.findreceipts(user,service);
    }

  }
module.exports = new DummyReceipts();