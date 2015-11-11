#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var lib = require('./lib.js');

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  console.error('\n  Usage: adaptive status <id>\n'.red);
  process.exit(1);
}

var id = program.args[0];

lib.isLoggedUser();

lib.api.status.url = lib.api.status.url.replace('{id}', id);
lib.request(lib.api.status, '', function (data, code) {
  if (code === 200) {
    console.log(lib.printTable([JSON.parse(data)]));
    process.exit(0);
  } else if (code === 404) {
    console.error(('ERROR (' + code + '): There is no build request for that id').red);
  } else {
    console.error(('ERROR: ' + data).red);
    process.exit(1);
  }
});
