'use strict';

var lib = require('../src/lib.js');
var expect = require('expect.js');
var request = require('request');
var colors = require('colors');

describe('API definition', function () {

  this.timeout(20000); // Increase the default timeout

  it('Adaptive Cloud API Host', function (done) {

    request(lib.api.host, function (err, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Adaptive Cloud API Account Management', function (done) {

    var username = 'user' + new Date().getTime();
    var email = 'email' + new Date().getTime() + '@email.com';
    var password = 'superPassword';
    var newPassword = 'newSuperPassword';

    // -------------------------------------------------------------------------- //
    // REGISTER
    // -------------------------------------------------------------------------- //

    lib.request(lib.api.register, {
      login: username, email: email, password: password, langKey: 'en'
    }, function (data, code) {
      if (code === 201) {

        // ---------------------------------------------------------------------- //
        // LOGIN
        // ---------------------------------------------------------------------- //

        lib.request(lib.api.login, {
          username: username, password: password, grant_type: 'password'
        }, function (data, code) {
          if (code === 200) {

            lib.setToken(JSON.parse(data).access_token);

            // ------------------------------------------------------------------ //
            // CHANGE PASSWORD
            // ------------------------------------------------------------------ //

            // We need to set the token in runtime on the tests
            lib.api.change.headers = {
              Authorization: 'Bearer ' + lib.getToken()
            };
            lib.request(lib.api.change, newPassword, function (data, code) {
              if (code === 200) {

                // -------------------------------------------------------------- //
                // LOGOUT
                // -------------------------------------------------------------- //

                lib.request(lib.api.logout, '', function (data, code) {

                  if (code === 200) {

                    lib.removeToken();

                    // ---------------------------------------------------------- //
                    // LOGIN
                    // ---------------------------------------------------------- //

                    lib.request(lib.api.login, {
                      username: username, password: newPassword, grant_type: 'password'
                    }, function (data, code) {
                      if (code === 200) {

                        lib.setToken(JSON.parse(data).access_token);

                        // ------------------------------------------------------ //
                        // UNREGISTER
                        // ------------------------------------------------------ //

                        // We need to set the token in runtime on the tests
                        lib.api.unregister.headers = {
                          Authorization: 'Bearer ' + lib.getToken()
                        };

                        lib.request(lib.api.unregister, '', function (data, code) {
                          if (code === 200) {
                            lib.removeToken();
                            done();
                          }
                        });
                      }
                    });

                  }
                });
              }
            });
          }
        });
      }
    });
  });

  // TODO: Implement a test for the init/build/status/log commands

});
