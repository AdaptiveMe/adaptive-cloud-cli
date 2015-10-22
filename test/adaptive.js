'use strict';

var lib = require('../src/lib.js');
var expect = require('expect.js');
var request = require('request');

describe('API definition', function () {

  this.timeout(5000); // Increase the default timeout

  it('Adaptive Cloud API Host', function (done) {

    request.get(lib.host, function (err, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Adaptive Cloud API Login URL', function (done) {

    request.post(lib.host + lib.urlLogin, function (err, res, body) {
      // Expects 401 because you are unauthorized
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('Adaptive Cloud API Logout URL', function (done) {

    request.get(lib.host + lib.urlLogout, function (err, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Adaptive Cloud API Register URL', function (done) {

    request.post(lib.host + lib.urlRegister, function (err, res, body) {
      // Expects 406 because the request is not acceptable
      expect(res.statusCode).to.equal(406);
      done();
    });
  });

  it('Adaptive Cloud API Account URL', function (done) {

    request.head(lib.host + lib.urlAccount, function (err, res, body) {
      // Expects 401 because you are unauthorized
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

});
