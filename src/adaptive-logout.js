#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var lib = require('./lib.js');

lib.performRequest('/api/logout', 'POST', {}, {}, function (data, statusCode, statusMessage) {

  if (statusCode != 200) {
    console.error(('ERROR (' + statusCode + ') ' + data.error_description).red);
  } else {
    lib.removeToken();
    console.log('Bye!'.green);
  }
});
