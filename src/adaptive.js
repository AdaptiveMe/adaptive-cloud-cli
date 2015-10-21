#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var packageJson = require('../package.json');

console.log('---------------------------------------------------------------'.bold.green);
console.log(('- ' + packageJson.name + ' - ' + packageJson.version + ' ----------------------------------').bold.green);
console.log('---------------------------------------------------------------'.bold.green);

// Program definition
program
  .version(packageJson.version)
  .command('login [email]', 'Login into the Adaptive Cloud Platform with your email')
  .command('logout', 'Logout from the Adaptive Cloud Platform')
  .parse(process.argv);

