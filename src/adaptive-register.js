#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
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
  console.error('The email format is not correct'.red);
  process.exit(1);
}

// Prompt password and username to the user

inquirer.prompt([{
  type: 'input',
  message: 'Enter your username:',
  name: 'username',
  validate: function (input) {
    if (!input) {
      return 'The username cannot be empty';
    } else if (!(/^([a-z0-9]*)$/.test(input))) {
      return 'The username cannot contain special characters or a blank space';
    }
    return true;
  }

}, {
  type: 'password',
  message: 'Enter your password:',
  name: 'password',
  validate: function (input) {
    if (!input) {
      return 'The password cannot be empty';
    } else if (input.length < 5) {
      return 'The password length should be at least 5 characters';
    } else if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
      return 'The password cannot contain special characters or a blank space';
    }
    return true;
  }
}], function (answers) {

  lib.performRequest(lib.urlRegister, 'POST', {
    login: answers.username,
    email: email,
    password: answers.password,
    langKey: 'en'
  }, {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json, text/plain, */*'
  }, function (data, statusCode, statusMessage) {

    if (statusCode == 400) {
      console.error(('ERROR (' + statusCode + ') ' + (data)).red);
    } else if (statusCode == 201) {
      console.log('You\'ve successfully registered!'.green);
    }
  });
});

/**
 * Prints the sub-command usage
 */
function printUsage() {
  console.error('\n  Usage: adaptive register <email>\n'.red);
}
