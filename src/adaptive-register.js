#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var colors = require('colors');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  console.error('\n  Usage: adaptive register <email>\n'.red);
  process.exit(1);
}

var email = program.args[0];
if (!lib.validateEmail(email)) {
  console.error('ERROR: The email format is not correct'.red);
  process.exit(1);
}

// Prompt password and username to the user

inquirer.prompt([{
  type: 'input',
  message: 'Enter your username:',
  name: 'username',
  validate: function (input) {
    if (!input) {
      return 'ERROR: The username cannot be empty'.red;
    } else if (!(/^([a-z0-9]*)$/.test(input))) {
      return 'ERROR: The username cannot contain special characters or a blank space'.red;
    } else {
      return true;
    }
  }

}, {
  type: 'password',
  message: 'Enter your password:',
  name: 'password',
  validate: function (input) {
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
      data = JSON.parse(data);
      console.error(('ERROR (' + statusCode + '): ' + (data)).red);
      process.exit(1);
    } else if (statusCode == 201) {
      console.log('You\'ve successfully registered!'.green);
      process.exit(0);
    } else {
      console.error(('ERROR (' + statusCode + '): ' + statusMessage).red);
      process.exit(1);
    }
  });
});
