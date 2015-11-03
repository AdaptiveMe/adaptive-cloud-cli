#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var updateNotifier = require('update-notifier');
var pkg = require('../package.json');

// Check for the project updates
var notifier = updateNotifier({
  pkg: pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 // 1 day
});
notifier.notify();

// Program definition
program
  .version(pkg.version)
  .command('login [username]', 'Login into the Adaptive Cloud Platform with your username')
  .command('register [email]', 'Register user into the Adaptive Cloud Platform')
  .command('reset-password [email]', 'Reset the password for the user')
  .command('change-password', 'Change the password for the current user')
  .command('unregister', 'Remove all the account information for the user')
  .command('build', 'Build a project on the Adaptive Cloud Builder')
  .command('status [id]', 'Check the status of the build')
  .command('logs [id]', 'Get the logs of the build')
  .command('logout', 'Logout from the Adaptive Cloud Platform')
  .parse(process.argv);


