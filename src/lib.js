'use strict';

var colors = require('colors');
var fs = require('fs');
var path = require('path');
var Table = require('cli-table');
var extend = require('util')._extend;
var spinner = require('simple-spinner');
var YAML = require('yamljs');
var req = require('request');
//require('request').debug = true; // To debug the requests

var host = 'https://app.adaptive.me';
var clientId = 'AdaptiveCli';
var clientSecret = 'muAwkBAcFdpL68kELcNMrFELqAkNFrZkbKQKFMnG';

// -------------------------------------------------------------------------- //
// TOKEN UTILITIES
// -------------------------------------------------------------------------- //

// Localstorage
var localStorage;

if (typeof localStorage === 'undefined' || localStorage === null) {
  var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  var localDir = path.join(homeDir, '.adaptive', '.cli');
  var LocalStorage = require('node-localstorage').LocalStorage;
  try {
    localStorage = new LocalStorage(localDir);
  } catch (e) {

    // If there is a problem accessing the local storage, create the folder
    try {
      fs.mkdirSync(path.join(homeDir, '.adaptive'));
      fs.mkdirSync(localDir);
      localStorage = new LocalStorage(localDir);
    } catch (e) {
      if (e.code != 'EEXIST') {
        console.error(('There is a problem creating the .adaptive folder.' +
        'Please create a folder <.adaptive> in your home directory').red);
      }
    }
  }
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
// API CONFIGURATION
// -------------------------------------------------------------------------- //

exports.api = {
  host: host,
  register: {
    url: host + '/api/register',
    method: 'POST',
    json: true // application/json
  },
  unregister: {
    url: host + '/api/account',
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + getToken()
    }
  },
  login: {
    url: host + '/oauth/token',
    method: 'POST',
    form: true, // x-www-form-urlencoded
    headers: {
      Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64')
    }
  },
  logout: {
    url: host + '/api/logout',
    method: 'POST'
  },
  reset: {
    url: host + '/api/account/reset_password/init',
    method: 'POST'
  },
  reset_change: {
    url: host + '/api/account/reset_password/finish',
    method: 'POST',
    json: true
  },
  change: {
    url: host + '/api/account/change_password',
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + getToken()
    }
  },
  upload: {
    url: host + '/api/buildChains?appId={appId}&platforms={platforms}',
    method: 'POST',
    formData: true, // multipart/form-data
    headers: {
      Authorization: 'Bearer ' + getToken()
    }
  },
  status: {
    url: host + '/api/buildRequests/{id}',
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + getToken()
    }
  },
  log: {
    url: host + '/api/buildRequests/{id}/log',
    method: 'GET',
    headers: {
      Accept: 'text/plain',
      Authorization: 'Bearer ' + getToken()
    }
  },
  download: {
    url: host + '/api/buildRequests/{id}/artifacts',
    method: 'GET',
    headers: {
      Accept: 'application/zip',
      Authorization: 'Bearer ' + getToken()
    }
  }
};

var request = function (options, data, callback) {

  spinner.start(50, {hideCursor: true});

  // Options for the request
  if (options.form) {
    options.form = data;
  } else if (options.formData) {
    options.formData = data;
  } else {
    options.body = data;
  }
  options.encoding = 'utf8';
  options.headers = extend({Accept: '*/*'}, options.headers);

  req(options, function (error, response, body) {

    spinner.stop();
    // Move the cursor to the start to remove the spinner
    process.stdout.cursorTo(0);

    if (error) {
      console.error((error + '').red);
      process.exit(1);
    }

    var code = response.statusCode;

    switch (code) {
      case 400:
      case 401:
        try {
          body = JSON.parse(body);
          console.error(('ERROR (' + code + '): ' + body.error + '. ' +
          body.error_description).red);
        } catch (e) {
          // If we're not able to parse the response is plain text
          console.error(('ERROR (' + code + '): ' + body).red);
        }
        process.exit(1);
        break;
      case 406:
        console.error('ERROR (406): Not Acceptable.'.red);
        process.exit(1);
        break;
      case 500:
        console.error('ERROR (500) [' + options.url + ']: Internal Server Error.'.red);
        process.exit(1);
        break;
      default:
        callback(body, code);
    }

  });

};
exports.request = request;

// -------------------------------------------------------------------------- //
// FOLDERS
// -------------------------------------------------------------------------- //
/**
 * Deletes a folder recursivelly
 * @param folder_path Folder's path
 */
var deleteFolderRecursive = function (folder_path) {
  if (fs.existsSync(folder_path)) {
    fs.readdirSync(folder_path).forEach(function (file, index) {
      var curPath = folder_path + path.sep + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folder_path);
  }
};
exports.deleteFolderRecursive = deleteFolderRecursive;

// -------------------------------------------------------------------------- //
// VALIDATIONS
// -------------------------------------------------------------------------- //

/**
 * Function that validates if the current folder is an adaptive folder
 * and returns the parsed yml
 */
function isValidAdaptiveProject() {

  // Check if the current folder contains a adaptive project (looking for adaptive.yml)
  try {

    var config = YAML.load('adaptive.yml');

  } catch (e) {
    console.error(('ERROR: ' + e.message).red);
    if (e.code === 'ENOENT') {
      console.error('ERROR: The current folder is not an adaptive project folder.'.red);
    }
    process.exit(1);
  }

  try {
    // Validate adaptive.yml contents
    if (!config.appid) {
      console.error('ERROR: The app id is not configured in the adaptive.yml'.red);
      process.exit(1);
    }
    if (config.platforms.length < 0) {
      console.error('ERROR: There are no platforms configured in adaptive.yml for building'.red);
      process.exit(1);
    }
  } catch (e) {
    console.error(('ERROR: There is a problem parsing the adaptive.yml (' + e.message + ')').red);
    process.exit(1);
  }

  return config;
}
exports.isValidAdaptiveProject = isValidAdaptiveProject;

/**
 * Check if the user is logged on the system
 */
function isLoggedUser() {
  if (!getToken()) {
    console.error(('ERROR: you\'re not logged!').red);
    process.exit(1);
  }
}
exports.isLoggedUser = isLoggedUser;

/**
 * Check if the user is not logged in the system
 */
function isNotLoggedUser() {
  if (getToken()) {
    console.error('WARN: You\'re already logged. Please logout'.yellow);
    process.exit(1);
  }
}
exports.isNotLoggedUser = isNotLoggedUser;

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

// -------------------------------------------------------------------------- //
// TABLES
// -------------------------------------------------------------------------- //

function printTable(data) {

  var table = new Table({
    head: ['id'.blue, 'platform'.blue, 'start time'.blue, 'end time'.blue, 'status'.blue, 'message'.blue]
  });

  // Parse the buildRequests
  var index;
  for (index = 0; index < data.length; ++index) {
    var id = data[index].id;
    var platform = data[index].platform.name;
    var status;
    switch (data[index].status) {
      case 'QUEUED':
        status = (data[index].status).yellow;
        break;
      case 'RUNNING':
        status = (data[index].status).blue;
        break;
      case 'SUCCESSFUL':
        status = (data[index].status).green;
        break;
      case 'CANCELLED':
        status = (data[index].status).red;
        break;
      case 'FAILED':
        status = (data[index].status).red;
        break;
    }
    var startTime = data[index].startTime === null ? '-' : data[index].startTime;
    var endTime = data[index].endTime === null ? '-' : data[index].endTime;

    var message = data[index].message === null ? '' : data[index].message;

    table.push([id, platform, startTime, endTime, status, message]);
  }

  return table.toString();
}
exports.printTable = printTable;

