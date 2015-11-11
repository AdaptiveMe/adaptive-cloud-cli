#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');
var YAML = require('yamljs');
var fs = require('fs');
var archiver = require('archiver');
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

lib.isLoggedUser();

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

var config = lib.isValidAdaptiveProject();

console.log(('Building project: ' + config.name + '@' + config.version).green);

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
      console.error(('ERROR: There is an error running the <grunt dist> command').red);
      console.error(('Did you execute <npm install && bower install>?').yellow);
      //console.error((error).red);
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

  // parse the yml to identify the platforms
  var platforms = '';
  config.platforms.forEach(function (entry) {
    platforms += entry.name + ',';
  });

  fs.stat(zipFileName, function (err, stats) {

    var url = lib.api.upload.url.replace('{appId}', config.appid);
    url = url.replace('{platforms}', platforms.slice(0, -1));
    lib.api.upload.url = url;

    if (program.verbose) {
      console.log((' - Calling API: ' + url).green);
    }

    lib.request(lib.api.upload, {
        file: fs.createReadStream(zipFileName)
      }, function (data, code) {
        if (code === 201) {
          // Deleting the zip
          fs.unlinkSync(zipFileName);

          console.log(lib.printTable(JSON.parse(data).requests));
          process.exit(0);
        } else {
          console.error(('ERROR: ' + data).red);
          process.exit(1);
        }
      }
    );
  });
}


