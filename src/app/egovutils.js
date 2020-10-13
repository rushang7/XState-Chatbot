async function fetchCities(){
    var url = 'https://egov-micro-dev.egovernments.org/egov-mdms-service/v1/_search';

    var request = {
      "RequestInfo": {},
      "MdmsCriteria": {
        "tenantId": "pb",
        "moduleDetails": [
          {
            "moduleName": "tenant",
            "masterDetails": [
              {
                "name": "citymodule",
                "filter": "$.[?(@.module=='PGR.WHATSAPP')].tenants.*"
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

    let cities = data["MdmsRes"]["tenant"]["citymodule"];

    let cityNames = cities.map(element => element.name);

    return cityNames;

};

export default fetchCities;