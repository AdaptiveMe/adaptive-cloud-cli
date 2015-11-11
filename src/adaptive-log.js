#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var req = require('request');
var spinner = require('simple-spinner');
var lib = require('./lib.js');

// Arguments parsing and validation
program.parse(process.argv);
if (!program.args.length) {
  console.error('\n  Usage: adaptive log <id>\n'.red);
  process.exit(1);
}
var id = program.args[0];
lib.isLoggedUser();

// MARK: For the log we're not using the common api call because we need
// to pipe the response to stdout
lib.api.log.url = lib.api.log.url.replace('https', 'http'); // For piping the response we need http
lib.api.log.url = lib.api.log.url.replace('{id}', id);

spinner.start(50, {hideCursor: true});

req(lib.api.log,
  function (error, response, body) {

    var code = response.statusCode;
    switch (code) {
      case 200:
        break;
      case 401:
        console.error(('ERROR (' + code + '): The authentication token is not valid').red);
        process.exit(1);
        break;
      case 404:
        console.error(('ERROR (' + code + '): There is no build request for that id').red);
        process.exit(1);
        break;
      default:
        console.error(('ERROR (' + code + '): There is an error').red);
        process.exit(1);

    }
  })

  // Error generation the response+
  .on('error', function (error) {
    console.error((error + '').red);
    process.exit(1);
  })
  
  // When we receive the first chunk of the response

  .on('response', function (response) {

    spinner.stop();
    // Move the cursor to the start to remove the spinner
    process.stdout.cursorTo(0);

  })

  // Pipe the response to stdout
  .pipe(process.stdout);
