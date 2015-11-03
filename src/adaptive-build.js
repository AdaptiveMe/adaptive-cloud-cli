#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var YAML = require('yamljs');
var fs = require('fs');
var archiver = require('archiver');
var restler = require('restler');
var lib = require('./lib.js');

var zipFileName = 'build.zip';

program
  .option('-s --skip-dist', 'Skip the grunt dist task.', undefined, undefined)
  .option('-p --dist-folder [path]', 'Specify the dist folder. default: dist', undefined, undefined)
  .option('-v --verbose', 'Prints more information on the build', undefined, undefined)
  .parse(process.argv);

// -------------------------------------------------------------------------------------------
// Options parsing
// -------------------------------------------------------------------------------------------

// Check for logged users
if (!lib.getToken()) {
  console.error(('ERROR: you\'re not logged!').red);
  process.exit(1);
}

// Validate if the dist path is set
if (program.distFolder === true) {
  console.error('ERROR: You should specify a dist path'.red);
  process.exit(1);
}

// If the dist path is set, the skip dist maybe should be enabled
if (program.distFolder !== undefined && program.skipDist === undefined) {
  console.log('You have specified a dist path, but you do not skipped the default dist. It is that correct?'.yellow);
} else if (program.distFolder === undefined && program.skipDist !== undefined) {
  console.log('You are skipping the dist command but you do not specified a dist path. It is that correct?'.yellow);
}

// -------------------------------------------------------------------------------------------
// Project validation
// -------------------------------------------------------------------------------------------

// Check if the current folder contains a adaptive project (looking for adaptive.yml)
try {

  var config = YAML.load('adaptive.yml');

} catch (e) {
  console.error(('ERROR: ' + e.message).red);
  if (e.code === 'ENOENT') {
    console.error('ERROR: The current folder is not an adaptive project folder.'.red);
  }
  process.exit(1);
}

// Validate adaptive.yml contents
if (!config.app.id) {
  console.error('ERROR: The app id is not configured in the adaptive.yml'.red);
  process.exit(1);
}
if (!(config.adaptive.android || config.adaptive.ios)) {
  console.error('ERROR: There are no platforms configured in adaptive.yml for building'.red);
  process.exit(1);
}

console.log(('Building project: ' + config.app.name + '@' + config.app.version).green);

// -------------------------------------------------------------------------------------------
// Distribution task
// -------------------------------------------------------------------------------------------

if (!program.skipDist) {

  console.log(' - Executing <grunt dist> on the current directory...'.green);

  try {
    fs.lstatSync('Gruntfile.js');
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('ERROR: There is no Gruntfile.js for executing the <grunt dist> in this folder.'.red);
    } else {
      console.error(('ERROR: ' + e.message).red);
    }
    process.exit(1);
  }

  var exec = require('child_process').exec;
  exec('grunt dist', function (error, stdout, stderr) {

    if (program.verbose) {
      console.log(stdout);
    }

    if (error !== null || stderr) {
      console.error(('ERROR: There is an error running the <grunt dist> command: ' + error).red);
      console.error((stderr).red);
      process.exit(1);
    }

    // Call the zip method after the dist
    zipFolder();
  });
} else {

  // Skipping the dist, calling the zip
  zipFolder();
}

// -------------------------------------------------------------------------------------------
// Zip folder
// -------------------------------------------------------------------------------------------

function zipFolder() {

  // Determine the dist folder
  var dist = program.distFolder === undefined ? 'dist' : program.distFolder;

  try {
    if (!fs.lstatSync(dist).isDirectory()) {
      console.error('ERROR: The dist folder provided is not a folder'.red);
      process.exit(1);
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('ERROR: The dist folder provider does not exist'.red);
    } else {
      console.error(('ERROR: ' + e.message).red);
    }
    process.exit(1);
  }

  /// Create the zip
  var zipArchive = archiver('zip');
  var output = fs.createWriteStream(zipFileName);

  output.on('open', function () {
    console.log((' - Zipping the contents of [' + dist + '] folder...').green);
  });
  output.on('close', function () {
    console.log((' - Zip generated: ' + zipFileName + ' (' + zipArchive.pointer() + ' bytes)').green);

    // Calling the api after the zip method
    apiCall();
  });
  output.on('error', function (e) {
    console.error(('ERROR: ' + e.message).red);
    process.exit(1);
  });

  zipArchive.pipe(output);
  zipArchive.bulk([{src: ['**/*'], cwd: dist, dot: true, expand: true}]);
  zipArchive.finalize();
}

// -------------------------------------------------------------------------------------------
// API call
// -------------------------------------------------------------------------------------------

function apiCall() {

  console.log(' - Sending the zip to start the build...'.green);

  var platforms = '';
  platforms += config.adaptive.android ? 'android,' : '';
  platforms += config.adaptive.ios ? 'ios,' : '';

  var url = lib.host + lib.urlUpload + '?appId=' + config.app.id + '&platforms=' + platforms.slice(0, -1);

  if (program.verbose) {
    console.log((' - Calling API: ' + url).green);
  }

  fs.stat(zipFileName, function (err, stats) {
    restler.post(url, {
      multipart: true,
      headers: {
        Authorization: 'Bearer ' + lib.getToken(),
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      data: {
        file: restler.file(zipFileName, null, stats.size, null, 'application/zip')
      }
    }).on('fail', function (data, response) {
      console.error(('ERROR (' + response.statusCode + '): ' + response.statusMessage).red);
      process.exit(1);
    }).on('error', function (err, response) {
      console.error(('ERROR: ' + err.code).red);
      process.exit(1);
    }).on('success', function (data, response) {
      // Deleting the zip
      fs.unlinkSync(zipFileName);

      console.log(lib.printTable(data.requests));
      process.exit(0);
    });
  });
}


