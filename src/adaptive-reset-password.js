#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var lib = require('./lib.js');


// Arguments parsing and validation
program.parse(process.argv);

lib.isNotLoggedUser();

if (!program.args.length) {
  console.error('\n  Usage: adaptive reset-password <email>\n'.red);
  process.exit(1);
}

var email = program.args[0];
if (!lib.validateEmail(email)) {
  console.error('ERROR: The email format is not correct'.red);
  process.exit(1);
}

lib.request(lib.api.reset, email, function (data, code) {
  if (code === 200) {
    console.log('You\'ve received a mail with the reset key. '.green +
      'Check the email and execute the change-password command'.green);
    process.exit(0);
  } else {
    console.error(('ERROR: ' + data).red);
    process.exit(1);
  }
});
