angular.module('reg')
  .controller('ProfileCtrl', [
    '$scope',
    'currentUser',
    'settings',
    'Utils',
    'UserService',
    function($scope, currentUser, settings, Utils, UserService){
      // Get the current user's most recent data.
      var Settings = settings.data;

      $scope.regIsOpen = Utils.isRegOpen(Settings);

      $scope.user = currentUser.data;

    }]);
