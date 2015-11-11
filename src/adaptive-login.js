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

lib.isNotLoggedUser();

// Prompt password to the user
inquirer.prompt([{
  type: 'password',
  message: 'Enter your password:',
  name: 'password',
  validate: lib.validatePassword
}], function (answers) {

  lib.request(lib.api.login, {
    username: email,
    password: answers.password,
    grant_type: 'password'
  }, function (data, code) {
    if (code === 200) {
      lib.setToken(JSON.parse(data).access_token);
      console.log('You\'ve successfully logged!'.green);
      process.exit(0);
    } else {
      console.error(('ERROR: ' + data).red);
      process.exit(1);
    }
  });
});
