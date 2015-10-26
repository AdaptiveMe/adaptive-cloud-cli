#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var colors = require('colors');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  console.error('\n  Usage: adaptive login <username>\n'.red);
  process.exit(1);
}

var email = program.args[0];

// Check for alredy logged users

if (lib.getToken()) {
  console.error('WARN: You\'re already logged. Please logout'.yellow);
  process.exit(1);
}

// Prompt password to the user

inquirer.prompt([{
  type: 'password',
  message: 'Enter your password:',
  name: 'password',
  validate: function (input) {
    if (!input) {
      return 'ERROR: The password cannot be empty'.red;
    } else if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
      return 'ERROR: The password cannot contain special characters or a blank space'.red;
    } else {
      return true;
    }
  }
}], function (answers) {

  // REST calling
  var auth = 'Basic ' + new Buffer(lib.clientId + ':' + lib.clientSecret).toString('base64');

  lib.performRequest(lib.urlLogin, 'POST', {
    username: email,
    password: answers.password,
    grant_type: 'password',
    scope: 'read write',
    client_secret: lib.clientSecret,
    client_id: lib.clientId
  }, {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
    Authorization: auth
  }, function (data, statusCode, statusMessage) {

    data = JSON.parse(data);

    if (statusCode != 200) {
      if (statusCode == 400) {
        console.error('ERROR: Check your username/password'.red);
        process.exit(1);
      } else {
        console.error(('ERROR (' + statusCode + '): ' + (statusMessage || data.error_description || data.error)).red);
        process.exit(1);
      }
    } else {

      lib.setToken(data.access_token);
      console.log('You\'ve successfully logged!'.green);
      process.exit(0);
    }
  });
});

