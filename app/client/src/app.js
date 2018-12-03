const $ = require('jquery');

var angular = require('angular');
var uiRouter = require('angular-ui-router');

var app = angular.module('reg', [
  'ui.router',
]);

const constants = require('./constants.js');

var AuthService = require('./services/AuthService.js');
var AuthInterceptor = require('./interceptors/AuthInterceptor.js');
var Session = require('./modules/Session.js');

var routes = require('./routes.js');

app
  .config([
    '$httpProvider',
    function($httpProvider){

      // Add auth token to Authorization header
      $httpProvider.interceptors.push('AuthInterceptor');

    }])
  .run([
    'AuthService',
    'Session',
    function(AuthService, Session){

      // Startup, login if there's  a token.
      var token = Session.getToken();
      if (token){
        AuthService.loginWithToken(token);
      }

  }]);
