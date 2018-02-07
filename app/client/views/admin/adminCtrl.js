angular.module('reg')
  .controller('AdminCtrl', [
    '$scope',
    'UserService',
    function($scope, UserService){
      $scope.loading = true;
      $scope.user = {};

      UserService
      .getCurrentUser()
      .success(function(data){
        $scope.user = data;
      });
}]);