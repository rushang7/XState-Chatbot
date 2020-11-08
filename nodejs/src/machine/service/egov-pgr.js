const fetch = require("node-fetch");
const config = require('../../env-variables');

class PGRService {

  async fetchMdmsData(tenantId, moduleName, masterName, filterPath) {
    var mdmsHost = config.mdmsHost;
    var url = mdmsHost + 'egov-mdms-service/v1/_search';
    var request = {
      "RequestInfo": {},
      "MdmsCriteria": {
        "tenantId": tenantId,
        "moduleDetails": [
          {
            "moduleName": moduleName,
            "masterDetails": [
              {
                "name": masterName,
                "filter": filterPath
              }
            ]
          }
        ]
      }
    };
  
    var options = {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
          'Content-Type': 'application/json'
      }
    }
  
    let response = await fetch(url, options);
    let data = await response.json()
  
    return data["MdmsRes"][moduleName][masterName];
  }
  
  async fetchFrequentComplaints() {
    let complaintTypes = await this.fetchMdmsData("pb", "RAINMAKER-PGR", "ServiceDefs", "$.[?(@.order)].serviceCode");
    let complaintData = complaintTypes.map(element => {
      return {
        code: element,
        value: element
      }
    });
    return complaintData;
  }

  async fetchCities(){
    let cities = await this.fetchMdmsData("pb", "tenant", "citymodule", "$.[?(@.module=='PGR.WHATSAPP')].tenants.*");
    let cityData = cities.map(element => {
      return { 
        code: element.code,
        value: element.name
      }
    });
    return cityData;
  }

  async fetchLocalities(tenantId) {
    let moduleName = 'egov-location';
    let masterName = 'TenantBoundary';
    let filterPath = '$.[?(@.hierarchyType.code=="ADMIN")].boundary.children.*.children.*.children.*';

    let boundaryData = await this.fetchMdmsData(tenantId, moduleName, masterName, filterPath);
    let localities = boundaryData.map(element => {
      return {
        code: element.code,
        value: element.name
      }
    });
    return localities;
  }

  generatePromptAndGrammer(data) {
    var prompt = '';
    var grammer = [];
    data.forEach((element, index) => {
      let code = element.code;
      let value = element.value;
      prompt+= `\n ${index+1}. ${value}`;
      grammer.push({intention: code, recognize: [index+1, value.trim().toLowerCase()]});
    });
    return {prompt, grammer};
  }

  generatePromptAndGrammerForLocalities(data, tenantId) {
    var grammer = [];
    data.forEach((element, index) => {
      let code = element.code;
      let value = element.value;
      grammer.push({intention: code, recognize: [value.trim().toLowerCase()]});
    });
    var prompt = config.externalHost + config.localityExternalWebpagePath + '?tenantId=' + tenantId + '&phone=' + config.whatsAppBusinessNumber;
    return {prompt, grammer};
  }
}

module.exports = new PGRService();