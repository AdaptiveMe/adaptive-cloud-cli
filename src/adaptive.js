#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var packageJson = require('../package.json');

// Program definition
program
  .version(packageJson.version)
  .command('login [username]', 'Login into the Adaptive Cloud Platform with your username')
  .command('register [email]', 'Register user into the Adaptive Cloud Platform')
  //.command('reset-password [email]', 'Reset the password for the user')
  //.command('change-password', 'Change the password for the current user')
  .command('unregister', 'Remove all the account information for the user')
  .command('logout', 'Logout from the Adaptive Cloud Platform')
  .parse(process.argv);

