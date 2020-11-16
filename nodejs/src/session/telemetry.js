class Telemetry {
    log(userId, type, data) {
        let object = {
            date: new Date().getTime(),
            user: userId,
            type: type,
            data: data
        }
        console.log("-----------");
        console.log(JSON.stringify(object));
        console.log("-----------");
    }
}

// TODO from_user message, data paremeter is a JSON object. Elasticsearch is expecting a string

// TODO transition message, ... ditto
// {"date":1605536890093,"user":"919428010072","type":"transition","data":"{oboarding,oboarding.onboardingName,oboarding.onboardingName.question}"}
// "reason": "object mapping for [data] tried to parse field [data] as object, but found a concrete value"

// async fetchMdmsData(tenantId, moduleName, masterName, filterPath) {
//     var mdmsHost = config.mdmsHost;
//     var url = mdmsHost + 'egov-mdms-service/v1/_search';
//     var request = {
//       "RequestInfo": {},
//       "MdmsCriteria": {
//         "tenantId": tenantId,
//         "moduleDetails": [
//           {
//             "moduleName": moduleName,
//             "masterDetails": [
//               {
//                 "name": masterName,
//                 "filter": filterPath
//               }
//             ]
//           }
//         ]
//       }
//     };
  
//     var options = {
//       method: 'POST',
//       body: JSON.stringify(request),
//       headers: {
//           'Content-Type': 'application/json'
//       }
//     }
  
//     let response = await fetch(url, options);

module.exports = new Telemetry();