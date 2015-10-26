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
  validate: lib.validateUser

}, {
  type: 'password',
  message: 'Enter your password:',
  name: 'password',
  validate: lib.validatePassword
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
