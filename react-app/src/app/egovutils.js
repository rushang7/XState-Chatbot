async function fetchMdmsData(moduleName, masterName, filter) {
  var url = '/egov-mdms-service/v1/_search';
  var request = {
    "RequestInfo": {},
    "MdmsCriteria": {
      "tenantId": "pb",
      "moduleDetails": [
        {
          "moduleName": moduleName,
          "masterDetails": [
            {
              "name": masterName,
              "filter": filter
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

async function fetchCities(){
  let cities = await fetchMdmsData("tenant", "citymodule", "$.[?(@.module=='PGR.WHATSAPP')].tenants.*");
  let cityNames = cities.map(element => element.name);
  return cityNames;
};

export default fetchCities;
