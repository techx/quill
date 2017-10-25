angular.module('reg')
  .controller('NavbarCtrl', [
    '$rootScope',
    '$scope',
    '$state',
    'settings',
    'Utils',
    'AuthService',
    'Session',
    'EVENT_INFO',
    function($rootScope, $scope, $state, Settings, Utils, AuthService, Session, EVENT_INFO){

      var settings = Settings.data;
      var user = $rootScope.currentUser;
      $scope.isLoggedIn = !!$rootScope.currentUser;
      $scope.currentPath = $state.current.name

      $scope.$watch(function(){
        return $state.$current.name
      }, function(newPath, oldPath){
        $scope.currentPath = newPath;
      })

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

      $('.navbar-mobile-menu-icon').on('click', function() {
        $('.ui.modal')
          .modal('setting', 'transition', 'fade left')
          .modal('show');
      });

      $('.navbar-mobile-menu-close-icon').on('click', function() {
        $('.ui.modal').modal('hide');
      })

      $scope.onMenuClick = function() {
        $('.ui.modal').modal('hide');
      }

      // oh god jQuery hack
      $('.item').on('click', function(){
        $scope.showNavbar = false;
      });

    }]);
