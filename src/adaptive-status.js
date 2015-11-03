#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var rest = require('restler');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  console.error('\n  Usage: adaptive status <id>\n'.red);
  process.exit(1);
}

var id = program.args[0];

// Check for logged users
if (!lib.getToken()) {
  console.error(('ERROR: you\'re not logged!').red);
  process.exit(1);
}

rest.get(lib.host + lib.urlStatus + '/' + id, {
  headers: {
    Authorization: 'Bearer ' + lib.getToken()
  }
}).on('fail', function (data, response) {
  if (response.statusCode === 404) {
    console.error(('ERROR (' + response.statusCode + '): There is no build request for that id').red);
  } else {
    console.error(('ERROR (' + response.statusCode + '): ' + response.statusMessage).red);
  }
  process.exit(1);
}).on('error', function (err, response) {
  console.error(('ERROR: ' + err.code).red);
  process.exit(1);
}).on('success', function (data, response) {
  console.log(lib.printTable([data]));
  process.exit(0);
});
