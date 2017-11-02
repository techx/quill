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
      var transparentNavbarViews = ['app.home', 'app.login', 'app.sponsor']

      $scope.$watch(function(){
        return $state.$current.name
      }, function(newPath, oldPath){
        if (transparentNavbarViews.includes(newPath)) {
          $scope.transparentNavbar = true;
        } else {
          $scope.transparentNavbar = false;
        }

        var settings = Settings.data;

        $scope.isLoggedIn = !!$rootScope.currentUser;

        if ($scope.isLoggedIn) {
          var user = $rootScope.currentUser;
          
          $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);

          $scope.logout = function(){
            AuthService.logout();
          };
        }
      })

      $scope.EVENT_INFO = EVENT_INFO;

      $scope.showNavbar = false;
      $scope.toggleNavbar = function(){
        $scope.showNavbar = !$scope.showNavbar;
      };

      $('.navbar-mobile-menu-icon').on('click', function() {
        $('.navbar-modal')
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
