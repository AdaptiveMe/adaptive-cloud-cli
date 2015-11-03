#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var request = require('request');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  console.error('\n  Usage: adaptive log <id>\n'.red);
  process.exit(1);
}

var id = program.args[0];

// Check for logged users
if (!lib.getToken()) {
  console.error(('ERROR: you\'re not logged!').red);
  process.exit(1);
}

var options = {
  url: 'http://' + lib.hostname + lib.urlStatus + '/' + id + lib.urlLogs,
  headers: {
    Authorization: 'Bearer ' + lib.getToken(),
    Accept: 'text/plain'
  }
};

request(options, function (error, response, body) {

  switch (response.statusCode) {
    case 401:
      console.error(('ERROR (' + response.statusCode + '): The authentication token is not valid').red);
      process.exit(1);
      break;
    case 404:
      console.error(('ERROR (' + response.statusCode + '): There is no build request for that id').red);
      process.exit(1);
      break;
  }
}).on('error', function (error) {
  console.error(('ERROR: ' + error).red);
  process.exit(1);
}).pipe(process.stdout);
