const moment = require('moment');

angular.module('reg')
  .controller('AdminStatsCtrl',[
    '$scope',
    'UserService',
    function($scope, UserService){

      UserService
        .getStats()
        .then(stats => {
          $scope.stats = stats.data;
          $scope.loading = false;

          console.log($scope.stats);
        });

      $scope.fromNow = function(date){
        return moment(date).fromNow();
      };

    }]);
