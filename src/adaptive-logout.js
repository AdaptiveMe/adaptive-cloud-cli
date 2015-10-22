#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

lib.performRequest(lib.urlLogout, 'POST', {}, {}, function (data, statusCode, statusMessage) {

  if (statusCode != 200) {
    console.error(('ERROR (' + statusCode + ') ' + data.error_description).red);
  } else {
    lib.removeToken();
    console.log('Bye!'.green);
  }
});
