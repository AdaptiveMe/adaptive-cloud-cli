#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

lib.performRequest(lib.urlLogout, 'POST', {}, {}, function (data, statusCode, statusMessage) {

  if (statusCode != 200) {

    data = JSON.parse(data);
    console.error(('ERROR (' + statusCode + '): ' + (statusMessage || data.error_description || data.error)).red);
    process.exit(1);

  } else {

    // Remove the token
    if (lib.getToken()) {
      lib.removeToken();
      console.log('Bye!'.green);
      process.exit(0);
    } else {
      console.error(('ERROR: you\'re not logged!').red);
      process.exit(1);
    }
  }
});
