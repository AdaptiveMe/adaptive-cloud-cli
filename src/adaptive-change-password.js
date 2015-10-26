#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

// If the user is logged, he only wants to change the password
// otherwise he's comming from the reset password

if (lib.getToken()) {

  inquirer.prompt([{
    type: 'password',
    message: 'Enter your new password:',
    name: 'password',
    validate: lib.validatePassword
  }], function (answers) {

    lib.performRequest(lib.urlChangePassword, 'POST', {
      data: answers.password
    }, {
      'Content-Type': 'text/plain',
      Accept: 'application/json, text/plain, */*',
      Authorization: 'Bearer ' + lib.getToken()
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

} else {

  // Prompt password and key to the user

  inquirer.prompt([{
    type: 'input',
    message: 'Enter your key:',
    name: 'key',
    validate: lib.validateKey
  }, {
    type: 'password',
    message: 'Enter your new password:',
    name: 'password',
    validate: lib.validatePassword
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
}
