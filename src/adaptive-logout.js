#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var lib = require('./lib.js');

program.parse(process.argv);

lib.isLoggedUser();

lib.request(lib.api.logout, '', function (data, code) {

  if (code === 200) {
    lib.removeToken();
    console.log('Bye!'.green);
    process.exit(0);
  } else {
    console.error(('ERROR: ' + data).red);
    process.exit(1);
  }
});
