'use strict';

var queryString = require('querystring');
var https = require('https');
var colors = require('colors');
var extend = require('util')._extend;

var host = 'app.adaptive.me';

exports.clientId = 'AdaptiveCli';
exports.clientSecret = 'muAwkBAcFdpL68kELcNMrFELqAkNFrZkbKQKFMnG';

/**
 * Method for calling a REST API with Node.js
 * @param endpoint URL of the REST service
 * @param method HTTP method for the call
 * @param data Data to send in the request
 * @param head Additiona headers
 * @param success Callback for executing after the success
 */
function performRequest(endpoint, method, data, head, success) {

  var dataString = JSON.stringify(data);
  var headers = extend({}, head);

  if (method == 'GET') {
    endpoint += '?' + queryString.stringify(data);
  } else {

    if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      dataString = queryString.stringify(data);
    } else {
      headers['Content-Type'] = 'application/json';
    }

    headers['Content-Length'] = dataString.length;
  }
  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = https.request(options, function (res) {

    res.setEncoding('utf-8');


    var responseString = '';

    res.on('data', function (data) {
      responseString += data;
    });

    res.on('end', function () {
      var responseObject = JSON.parse(responseString);
      success(responseObject, res.statusCode, res.statusMessage);
    });
  });

  req.write(dataString);
  req.end();

  req.on('error', function (e) {
    console.error(('There is an error calling the services: ' + e).red);
  });
}
exports.performRequest = performRequest;

/**
 * Method for validating an email format
 * @param email Email to check
 * @returns {boolean} True if the email is correct, else otherwise
 */
function validateEmail(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
}
exports.validateEmail = validateEmail;
