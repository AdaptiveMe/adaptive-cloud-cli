#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  printUsage();
  process.exit(1);
}

var email = program.args[0];
if (!lib.validateEmail(email)) {
  console.error('The email format is not correct'.red);
  process.exit(1);
}

// REST calling

lib.performRequest('/response-headers', 'GET', {
  hello: email
}, function (data) {
  console.log(data.hello)
});

/**
 * Prints the sub-command usage
 */
function printUsage() {
  console.error('\n  Usage: adaptive login <email>\n'.red);
}


