angular.module('reg')
  .controller('NavbarCtrl', [
    '$rootScope',
    '$scope',
    'settings',
    'Utils',
    'AuthService',
    'Session',
    'EVENT_INFO',
    function($rootScope, $scope, Settings, Utils, AuthService, Session, EVENT_INFO){

      var settings = Settings.data;
      var user = $rootScope.currentUser;
      $scope.isLoggedIn = !!$rootScope.currentUser;

      $scope.EVENT_INFO = EVENT_INFO;

      if ($scope.isLoggedIn) {
        $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);

        $scope.logout = function(){
          AuthService.logout();
        };
      }

      $scope.showNavbar = false;
      $scope.toggleNavbar = function(){
        $scope.showNavbar = !$scope.showNavbar;
      };

      // oh god jQuery hack
      $('.item').on('click', function(){
        $scope.showNavbar = false;
      });

    }]);
