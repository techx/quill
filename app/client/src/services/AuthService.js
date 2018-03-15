angular.module('reg')
  .factory('AuthService', [
    '$http',
    '$rootScope',
    '$state',
    '$window',
    'Session',
    function($http, $rootScope, $state, $window, Session) {
      var authService = {};

      var base = '';

      function loginSuccess(data, cb){
        // Winner winner you get a token
        Session.create(data.token, data.user);

        if (cb){
          cb(data.user);
        }
      }

      function loginFailure(data, cb){
        $state.go('login');
        if (cb) {
          cb(data);
        }
      }

      authService.loginWithPassword = function(email, password, onSuccess, onFailure) {
        return $http
          .post(base + '/auth/login', {
            email: email,
            password: password
          })
          .success(function(data){
            loginSuccess(data, onSuccess);
          })
          .error(function(data){
            loginFailure(data, onFailure);
          });
      };

      authService.loginWithToken = function(token, onSuccess, onFailure){
        return $http
          .post(base + '/auth/login', {
            token: token
          })
          .success(function(data){
            loginSuccess(data, onSuccess);
          })
          .error(function(data, statusCode){
            if (statusCode === 400){
              Session.destroy(loginFailure);
            }
          });
      };

      authService.logout = function(callback) {
        // Clear the session
        Session.destroy(callback);
        $state.go('login');
      };

      authService.register = function(email, password, onSuccess, onFailure) {
        return $http
          .post(base + '/auth/register', {
            email: email,
            password: password
          })
          .success(function(data){
            loginSuccess(data, onSuccess);
          })
          .error(function(data){
            loginFailure(data, onFailure);
          });
      };

      authService.verify = function(token, onSuccess, onFailure) {
        return $http
          .get(base + '/auth/verify/' + token)
          .success(function(user){
            Session.setUser(user);
            if (onSuccess){
              onSuccess(user);
            }
          })
          .error(function(data){
            if (onFailure) {
              onFailure(data);
            }
          });
      };

      authService.resendVerificationEmail = function(onSuccess, onFailure){
        return $http
          .post(base + '/auth/verify/resend', {
            id: Session.getUserId()
          });
      };

      authService.sendResetEmail = function(email){
        return $http
          .post( base + '/auth/reset', {
            email: email
          });
      };

      authService.resetPassword = function(token, pass, onSuccess, onFailure){
        return $http
          .post( base + '/auth/reset/password', {
            token: token,
            password: pass
          })
          .success(onSuccess)
          .error(onFailure);
      };

      return authService;
    }
  ]);
