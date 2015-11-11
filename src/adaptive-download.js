#! /usr/bin/env node

var program = require('commander');
var colors = require('colors');

var req = require('request');
var fs = require('fs');
var path = require('path');
var ProgressBar = require('progress');
var unzip = require('unzip2');
var spinner = require('simple-spinner');
var lib = require('./lib.js');

// Arguments parsing and validation
program.parse(process.argv);
if (!program.args.length) {
  console.error('\n  Usage: adaptive download <id>\n'.red);
  process.exit(1);
}
var id = program.args[0];

lib.isLoggedUser();
lib.isValidAdaptiveProject();

// Create a progress bar for the download
var percent = -1;
var bar = new ProgressBar('[:bar] :percent :elapseds :etas ', {
  complete: '=',
  incomplete: ' ',
  total: 100,
  width: 50
});

// MARK: For the download we're not using the common api call because we need
// to pipe the response to a zip

var current = 0;
var len = 0;

var build_folder = 'build';
var zip_folder = build_folder + path.sep + id;
var zip_file = zip_folder + path.sep + 'artifacts.zip';

lib.api.download.url = lib.api.download.url.replace('{id}', id);

// Create a folder for the downloaded artifacts
try {
  fs.mkdirSync(build_folder);
} catch (e) {
  if (e.code != 'EEXIST') throw e;
}
try {
  fs.mkdirSync(zip_folder);
} catch (e) {
  if (e.code != 'EEXIST') throw e;
}

spinner.start(50, {hideCursor: true});

req(lib.api.download)

  // Error generation the response

  .on('error', function (error) {
    console.error((error + '').red);
    process.exit(1);
  })

  // Every time we receive data

  .on('data', function (chunk) {
    current += (chunk.length / len) * 100;
    if (Math.round(current) > percent) {
      percent = Math.round(current);
      bar.tick();
    }
  })

  // When we receive the first chunk of the response

  .on('response', function (response) {

    spinner.stop();
    // Move the cursor to the start to remove the spinner
    process.stdout.cursorTo(0);

    var code = response.statusCode;
    switch (code) {
      case 200:
        console.log('Downloading the artifacts...'.green);
        len = parseInt(response.headers['content-length'], 10);
        break;
      case 401:
        console.error(('ERROR (' + code + '): The authentication token is not valid').red);
        lib.deleteFolderRecursive(zip_folder);
        process.exit(1);
        break;
      case 404:
        console.error(('ERROR (' + code + '): There is no build request for that id').red);
        lib.deleteFolderRecursive(zip_folder);
        process.exit(1);
        break;
      default:
        console.error(('ERROR (' + code + '): There is an error').red);
        lib.deleteFolderRecursive(zip_folder);
        process.exit(1);

    }
  })

  // Pipe the response to the zip file

  .pipe(fs.createWriteStream(zip_file)
    .on('close', function () {

      // When the zip is generated, extract it

      fs.createReadStream(zip_file)
        .pipe(unzip.Extract({path: zip_folder})
          .on('error', function (error) {
            console.error((error + '').red);
            process.exit(1);
          })
          .on('close', function (error) {
            console.log(('Artifacts located in: ' + process.cwd() + zip_folder).green);
            process.exit(0);
          }));
    }));

