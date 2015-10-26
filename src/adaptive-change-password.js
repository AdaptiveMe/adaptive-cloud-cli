#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

// Prompt password and key to the user

inquirer.prompt([{
  type: 'input',
  message: 'Enter your key:',
  name: 'key',
  validate: function (input) {
    if (!input) {
      return 'ERROR: The key cannot be empty'.red;
    } else if (!(/^([0-9]*)$/.test(input))) {
      return 'ERROR: The key can only contain numbers'.red;
    } else {
      return true;
    }
  }

}, {
  type: 'password',
  message: 'Enter your new password:',
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

  lib.performRequest(lib.urlResetPasswordFinish, 'POST', {
    key: answers.key,
    newPassword: answers.password
  }, {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json, text/plain, */*'
  }, function (data, statusCode, statusMessage) {

    if (statusCode == 200) {
      console.log('You\'ve successfully changed your password!'.green);
      process.exit(0);
    } else {
      console.error(('ERROR (' + statusCode + '): ' + statusMessage).red);
      process.exit(1);
    }
  });
});
