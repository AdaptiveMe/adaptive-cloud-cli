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

lib.isNotLoggedUser();

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

  lib.request(lib.api.register, {
    login: answers.username,
    email: email,
    password: answers.password,
    langKey: 'en'
  }, function (data, code) {
    if (code === 201) {
      console.log('You\'ve successfully registered!'.green);
      process.exit(0);
    } else {
      console.error(('ERROR: ' + data).red);
      process.exit(1);
    }
  });
});
