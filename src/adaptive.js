#! /usr/bin/env node

const program = require('commander');
const colors = require('colors');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const notifier = updateNotifier({pkg});
notifier.notify();
//notifier.notify();
//console.log(notifier.update);

// Program definition
/*program
  .version(pkg.version)
  .command('login [username]', 'Login into the Adaptive Cloud Platform with your username')
  .command('register [email]', 'Register user into the Adaptive Cloud Platform')
  .command('reset-password [email]', 'Reset the password for the user')
  .command('change-password', 'Change the password for the current user')
  .command('unregister', 'Remove all the account information for the user')
  .command('logout', 'Logout from the Adaptive Cloud Platform')
  .parse(process.argv);*/


