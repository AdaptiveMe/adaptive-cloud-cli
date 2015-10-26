'use strict';

var queryString = require('querystring');
var https = require('https');
var colors = require('colors');
var path = require('path');
var extend = require('util')._extend;

var host = 'app.adaptive.me';
exports.host = 'https://' + host;

exports.clientId = 'AdaptiveCli';
exports.clientSecret = 'muAwkBAcFdpL68kELcNMrFELqAkNFrZkbKQKFMnG';

exports.urlLogin = '/oauth/token';
exports.urlLogout = '/api/logout';
exports.urlRegister = '/api/register';
exports.urlAccount = '/api/account';
exports.urlResetPasswordInit = '/api/account/reset_password/init';
exports.urlResetPasswordFinish = '/api/account/reset_password/finish';
exports.urlChangePassword = '/api/account/change_password';

/**
 * Method for calling a REST API with Node.js
 * @param endpoint URL of the REST service
 * @param method HTTP method for the call
 * @param data Data to send in the request
 * @param head Additiona headers
 * @param success Callback for executing after the success
 */
function performRequest(endpoint, method, data, head, success) {

  var dataString;
  var headers = extend({}, head);

  if (method == 'GET') {

    endpoint += '?' + queryString.stringify(data);

  } else {

    if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      dataString = queryString.stringify(data);
    } else if (headers['Content-Type'] === 'text/plain') {
      dataString = data['data'];
    } else {
      dataString = JSON.stringify(data)
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
      success(responseString, res.statusCode, res.statusMessage);
    });
  });

  req.write(dataString);
  req.end();

  req.on('error', function (e) {
    console.error(('There is an error calling the services: ' + e).red);
  });
}
exports.performRequest = performRequest;

// Localstorage
var localStorage;

if (typeof localStorage === 'undefined' || localStorage === null) {
  var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  var localDir = path.join(homeDir, '.adaptive');
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage(localDir);
}

/**
 * Method for retrieving the access token
 */
function getToken() {
  return localStorage.getItem('access_token')
}
exports.getToken = getToken;

/**
 * Method for setting the access token
 * @param token Token value to save
 */
function setToken(token) {
  localStorage.setItem('access_token', token);
}
exports.setToken = setToken;

/**
 * Method for removing the token
 */
function removeToken() {
  localStorage.removeItem('access_token');
}
exports.removeToken = removeToken;

// -------------------------------------------------------------------------- //
// VALIDATIONS
// -------------------------------------------------------------------------- //

/**
 * Function that validates a user pattern
 * @param input Username introduced
 * @returns {*} true if the input is correct, a string with the error msg otherwise
 */
function validateUser(input) {
  if (!input) {
    return 'ERROR: The username cannot be empty'.red;
  } else if (!(/^([a-z0-9]*)$/.test(input))) {
    return 'ERROR: The username cannot contain special characters or a blank space'.red;
  } else {
    return true;
  }
}
exports.validateUser = validateUser;

/**
 * Function that validates a password pattern
 * @param input Password introduced
 * @returns {*} true if the input is correct, a string with the error msg otherwise
 */
function validatePassword(input) {
  if (!input) {
    return 'ERROR: The password cannot be empty'.red;
  } else if (input.length < 5) {
    return 'ERROR: The password length should be at least 5 characters'.red;
  } else if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
    return 'ERROR: The password cannot contain special characters or a blank space'.red;
  } else {
    return true;
  }
}
exports.validatePassword = validatePassword;

/**
 * Function that validates a key pattern
 * @param input Key introduced
 * @returns {*} true if the input is correct, a string with the error msg otherwise
 */
function validateKey(input) {
  if (!input) {
    return 'ERROR: The key cannot be empty'.red;
  } else if (!(/^([0-9]*)$/.test(input))) {
    return 'ERROR: The key can only contain numbers'.red;
  } else {
    return true;
  }
}
exports.validateKey = validateKey;

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
