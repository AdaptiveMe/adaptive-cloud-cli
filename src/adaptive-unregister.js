#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

lib.isLoggedUser();

// Prompt a confirmation to the user

inquirer.prompt([{
  type: 'confirm',
  message: 'This command will delete all data associated with your account, are you sure?',
  name: 'delete'
}], function (answers) {

  if (answers.delete) {

    lib.request(lib.api.unregister, '', function (data, code) {
      if (code === 200) {
        lib.removeToken();
        console.log('Successfully unregistered!'.green);
        process.exit(0);
      } else {
        console.error(('ERROR: ' + data).red);
        process.exit(1);
      }
    });
  }
});

