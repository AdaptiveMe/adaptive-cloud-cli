#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var rest = require('restler');
var https = require('https');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  console.error('\n  Usage: adaptive logs <id>\n'.red);
  process.exit(1);
}

var id = program.args[0];

// Check for logged users
if (!lib.getToken()) {
  console.error(('ERROR: you\'re not logged!').red);
  process.exit(1);
}

var url = lib.host + lib.urlStatus + '/' + id + lib.urlLogs;

var options = {
  hostname: lib.hostname,
  port: 443,
  path: lib.urlStatus + '/' + id + lib.urlLogs,
  method: 'GET',
  headers: {
    Authorization: 'Bearer ' + lib.getToken()
  }
};
options.agent = new https.Agent(options);

https.get(options, function (response) {

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

  // Pipe the process to stdout
  response.pipe(process.stdout);

}).on('error', function (error) {
  console.error(('ERROR: ' + err.code).red);
  process.exit(1);
});
