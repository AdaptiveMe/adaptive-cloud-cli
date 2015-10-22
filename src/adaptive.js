#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var packageJson = require('../package.json');

// Program definition
program
  .version(packageJson.version)
  .command('login [email]', 'Login into the Adaptive Cloud Platform with your email')
  .command('register [email]', 'Register user into the Adaptive Cloud Platform')
  .command('logout', 'Logout from the Adaptive Cloud Platform')
  .parse(process.argv);

