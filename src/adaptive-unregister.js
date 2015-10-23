#! /usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

// Prompt password and username to the user

inquirer.prompt([{
  type: 'confirm',
  message: 'This command will delete all data associated with your account, are you sure?',
  name: 'delete'
}], function (answers) {

  if (answers.delete) {

    // Check if the user is logged
    if (lib.getToken()) {

      lib.performRequest(lib.urlAccount, 'DELETE', {}, {
        Accept: 'application/json, text/plain, */*',
        Authorization: 'Bearer ' + lib.getToken()
      }, function (data, statusCode, statusMessage) {

        if (statusCode != 200) {
          data = JSON.parse(data);
          var msg = (data.error_description || data.error || data.description);
          console.error(('ERROR (' + statusCode + ') ' + msg).red);
          process.exit(1);
        } else {
          if (lib.getToken()) {
            lib.removeToken();
          }
          console.log('Successfully unregistered!'.green);
          process.exit(0);
        }
      });

    } else {
      console.error(('ERROR: you\'re not logged!').red);
      process.exit(1);
    }

  }
});

