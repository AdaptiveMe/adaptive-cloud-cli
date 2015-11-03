#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var https = require('https');
var fs = require('fs');
var ProgressBar = require('progress');
var mkdirp = require('mkdirp');
var YAML = require('yamljs');
var unzip = require('unzip2');
var lib = require('./lib.js');

var b2mb = 1048576;

// Arguments parsing and validation

program.parse(process.argv);

if (!program.args.length) {
  console.error('\n  Usage: adaptive download <id>\n'.red);
  process.exit(1);
}

var id = program.args[0];

// Check for logged users
if (!lib.getToken()) {
  console.error(('ERROR: you\'re not logged!').red);
  process.exit(1);
}

// Check if the current folder contains a adaptive project (looking for adaptive.yml)
try {

  YAML.load('adaptive.yml');

} catch (e) {
  console.error(('ERROR: ' + e.message).red);
  if (e.code === 'ENOENT') {
    console.error('ERROR: The current folder is not an adaptive project folder.'.red);
  }
  process.exit(1);
}

// Create a progress bar for the download
var percent = -1;
var bar = new ProgressBar('[:bar] :percent :elapseds :etas ', {
  complete: '=',
  incomplete: ' ',
  total: 100,
  width: 50
});

// Download the artifact
var options = {
  hostname: lib.hostname,
  port: 443,
  path: lib.urlStatus + '/' + id + lib.urlDownload,
  method: 'GET',
  headers: {
    Accept: 'application/zip',
    Authorization: 'Bearer ' + lib.getToken()
  }
};

console.log('Downloading the artifacts...'.green);

https.get(options, function (response) {

  var len = parseInt(response.headers['content-length'], 10);
  var current = 0;

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

  var callback = function (e) {
    if (e) {
      console.error(('(ERROR): Error creating the build folder. ' + e).red);
      process.exit(1);
    }
  };

  // Create a folder for the downloaded artifacts
  mkdirp('build', callback);
  mkdirp('build/' + id, callback);

  // Progress on data receiving
  response.on('data', function (chunk) {
    current += (chunk.length / len) * 100;
    if (Math.round(current) > percent) {
      percent = Math.round(current);
      bar.tick();
    }
  });

  // Pipe the process to stdout
  var write = fs.createWriteStream('build/' + id + '/artifacts.zip');
  response.pipe(write);

}).on('error', function (error) {
  console.error((error).red);
  process.exit(1);
}).on('close', function () {

  fs.createReadStream('build/' + id + '/artifacts.zip')
    .pipe(unzip.Extract({path: 'build/' + id})
      .on('error', function (error) {
        console.error((error).red);
        process.exit(1);
      })
      .on('close', function (error) {
        console.log(('Artifacts located in: ' + process.cwd() + '/build/' + id).green);
        process.exit(0);
      }));

});
