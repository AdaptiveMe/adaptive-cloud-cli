#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var path = require('path');
var colors = require('colors');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  printUsage();
  process.exit(1);
}

var email = program.args[0];
if (!lib.validateEmail(email)) {
  // TODO: enable email validation
  //console.error('The email format is not correct'.red);
  //process.exit(1);
}

// Localstorage
if (typeof localStorage === "undefined" || localStorage === null) {
  var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  var localDir = path.join(homeDir, '.adaptive');
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage(localDir);
}

// Prompt password to the user

inquirer.prompt([
  {
    type: 'password',
    message: 'Enter your password:',
    name: 'password',
    validate: function (input) {
      if (!input) {
        return 'The password cannot be empty';
      }
      if (/^([a-zA-Z0-9_]*)$/.test(input)) {
        return true;
      }
      return 'The password cannot contain special characters or a blank space';
    }
  }], function (answers) {

  // REST calling
  var auth = 'Basic ' + new Buffer(lib.clientId + ':' + lib.clientSecret).toString('base64');

  lib.performRequest('/oauth/token', 'POST', {
    username: email,
    password: answers.password,
    grant_type: 'password',
    scope: 'read write',
    client_secret: lib.clientSecret,
    client_id: lib.clientId
  }, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'Authorization': auth
  }, function (data, statusCode, statusMessage) {

    if (statusCode != 200) {
      console.error(('ERROR (' + statusCode + ') ' + data.error_description).red);
    } else {
      localStorage.setItem('access_token', data.access_token);
      console.log(localStorage.getItem('access_token'));
    }
  });
});


/**/

/**
 * Prints the sub-command usage
 */
function printUsage() {
  console.error('\n  Usage: adaptive login <email>\n'.red);
}


