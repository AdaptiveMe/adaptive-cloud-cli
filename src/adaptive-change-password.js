#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

var callback = function (data, code) {
  if (code === 200) {
    console.log('You\'ve successfully changed your password!'.green);
    process.exit(0);
  } else if (code === 404) {
    console.error('The provided key is invalid'.red);
    process.exit(1);
  } else {
    console.error(('ERROR: ' + data).red);
    process.exit(1);
  }
};

// If the user is logged, he only wants to change the password
// otherwise he's coming from the reset password

if (lib.getToken()) {

  inquirer.prompt([{
    type: 'password',
    message: 'Enter your new password:',
    name: 'password',
    validate: lib.validatePassword
  }], function (answers) {

    lib.request(lib.api.change, answers.password, callback);
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

    lib.request(lib.api.reset_change, {
      key: answers.key,
      newPassword: answers.password
    }, callback);
  });
}
