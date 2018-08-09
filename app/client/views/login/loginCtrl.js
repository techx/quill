angular.module('reg')
  .controller('LoginCtrl', [
    '$scope',
    '$window',
    '$location',
    '$http',
    '$state',
    'settings',
    'Utils',
    'AuthService',
    'Session',
    function($scope, $window, $location, $http, $state, settings, Utils, AuthService, Session){

      // Is registration open?
      var Settings = settings.data;
      $scope.regIsOpen = Utils.isRegOpen(Settings);

      // Start state for login
      $scope.loginState = 'login';

      function getSSO() {
        return $location.search().sso;
      }

      function onSuccess() {
        var ssoRedirectURL = getSSO();

        if (ssoRedirectURL == null) {
          $state.go('app.dashboard');
        }
        else {
          AuthService.doSSO(Session.getToken(), ssoRedirectURL, function(error, redirectURL) {
            if (error == null) $window.location.href = redirectURL;
            else $scope.error = error;
          });
        }
      }

      function onError(data){
        $scope.error = data.message;
      }

      function resetError(){
        $scope.error = null;
      }

      $scope.login = function(){
        resetError();
        AuthService.loginWithPassword(
          $scope.email, $scope.password, onSuccess, onError);
      };

      $scope.register = function(){
        resetError();
        AuthService.register(
          $scope.email, $scope.password, onSuccess, onError);
      };

      $scope.setLoginState = function(state) {
        $scope.loginState = state;
      };

      $scope.sendResetEmail = function() {
        var email = $scope.email;
        AuthService.sendResetEmail(email);
        sweetAlert({
          title: "Don't Sweat!",
          text: "An email should be sent to you shortly.",
          type: "success",
          confirmButtonColor: "#e76482"
        });
      };

      if (getSSO() != null) {
        // If SSO is called, and we already logged in?
        var token = Session.getToken();
        if (token){
          AuthService.loginWithToken(token, onSuccess);
        }
      }

    }
  ]);
