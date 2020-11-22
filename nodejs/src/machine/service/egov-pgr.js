const fetch = require("node-fetch");
const config = require('../../env-variables');
const getCityAndLocality = require('./util/google-maps-util');
const localisationService = require('../util/localisation-service');

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
    let localisationPrefix = 'pgr.complaint.category.';
    let messageBundle = {};
    for(let complaintType of complaintTypes) {
      let message = localisationService.getMessageBundleForCode(localisationPrefix + complaintType);
      messageBundle[complaintType] = message;
    }
    return {complaintTypes, messageBundle};
  }

  async getCityAndLocalityForGeocode(geocode) {
    let latlng = geocode.substring(1, geocode.length - 1); // Remove braces
    let cityAndLocality = await getCityAndLocality(latlng);
    return cityAndLocality;
  }

  async fetchCities(){
    let cities = await this.fetchMdmsData("pb", "tenant", "citymodule", "$.[?(@.module=='PGR.WHATSAPP')].tenants.*.code");
    let messageBundle = {};
    for(let city of cities) {
      let message = localisationService.getMessageBundleForCode(city);
      messageBundle[city] = message;
    }
    return {cities, messageBundle};
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