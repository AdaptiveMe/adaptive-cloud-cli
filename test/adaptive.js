'use strict';

var lib = require('../src/lib.js');
var expect = require('expect.js');
var request = require('request');
var colors = require('colors');

describe('API definition', function () {

  this.timeout(15000); // Increase the default timeout

  it('Adaptive Cloud API Host', function (done) {

    request.get(lib.host, function (err, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Adaptive Cloud API Account Management', function (done) {

    var username = 'user' + new Date().getTime();
    var email = 'email' + new Date().getTime() + '@email.com';
    var password = 'superPassword';

    // REGISTER
    lib.performRequest(lib.urlRegister, 'POST', {
      login: username,
      email: email,
      password: password,
      langKey: 'en'
    }, {
      'Content-Type': 'application/json;charset=UTF-8',
      Accept: 'application/json, text/plain, */*'
    }, function (data, statusCode, statusMessage) {

      if (statusCode == 201) {

        // LOGIN

        lib.performRequest(lib.urlLogin, 'POST', {
          username: username,
          password: password,
          grant_type: 'password',
          scope: 'read write',
          client_secret: lib.clientSecret,
          client_id: lib.clientId
        }, {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: 'Basic ' + new Buffer(lib.clientId + ':' + lib.clientSecret).toString('base64')
        }, function (data, statusCode, statusMessage) {

          if (statusCode == 200) {

            lib.setToken(JSON.parse(data).access_token);

            // UNREGISTER

            lib.performRequest(lib.urlAccount, 'DELETE', {}, {
              Accept: 'application/json, text/plain, */*',
              Authorization: 'Bearer ' + lib.getToken()
            }, function (data, statusCode, statusMessage) {

              if (statusCode == 200) {

                if (lib.getToken()) {
                  lib.removeToken();
                }
                done();
              } else {
                throw new Error('ERROR (' + statusCode + '): Removing user' + statusMessage);
              }
            });
          } else {
            throw new Error('ERROR (' + statusCode + '): Logging user' + statusMessage);
          }
        });
      } else {
        throw new Error('ERROR (' + statusCode + '): Registering user ' + statusMessage);
      }
    });
  });

});
