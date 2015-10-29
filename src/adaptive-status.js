#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var rest = require('restler');
var Table = require('cli-table');
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

  var table = new Table({
    head: ['id'.blue, 'platform'.blue, 'created date'.blue, 'status'.blue]
  });

  table.push([data.id, data.platform, data.createdDate,
    data.status === 'CANCELLED' ? (data.status).red : (data.status).green]);

  console.log(table.toString());
  process.exit(0);
});
