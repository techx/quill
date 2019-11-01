angular.module('reg')
  .controller('CheckInCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    'currentUser',
    'Utils',
    'UserService',
    function($scope, $rootScope, $state, currentUser, Utils, UserService){
      var user = currentUser.data;
      $scope.user = user;
      $scope.url = `https://register.hacktx.com/admin/users?query=${user._id}`;
  }]);
