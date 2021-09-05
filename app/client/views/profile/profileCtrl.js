angular.module('reg')
  .controller('ProfileCtrl', [
    '$scope',
    'currentUser',
    'Utils',
    function($scope, currentUser, Utils){
      // Get the current user's most recent data.
      $scope.user = currentUser.data;
    }]);
