const config = require('../env-variables');
const fetch = require("node-fetch");

async function getShortenedURL(finalPath)
{
  var urlshortnerHost = config.UrlShortnerHost;
  var url = urlshortnerHost + '/egov-url-shortening/shortener';
  var request = {};
  request.url = finalPath; 
  var options = {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  let response = await fetch(url, options);
  let data = await response.text();
  return data;
}

async function DownLink(consumerCode,tenantId,receiptNumber,businessService,mobileNumber)
{
  var Domainname = config.DomainHost;
  var parameters = config.URLparameters;
  parameters = parameters.replace(/\$consumercode/g,consumerCode);
  parameters = parameters.replace(/\$tenantId/g,tenantId);
  parameters = parameters.replace(/\$receiptnumber/g,receiptNumber)
  parameters = parameters.replace(/\$businessservice/g,businessService);
  parameters = parameters.replace(/\$mobilenumber/g,mobileNumber);
  var finalPath = Domainname + parameters;
  var shortlink = await getShortenedURL(finalPath);
  return shortlink;
}

module.exports = receipts;