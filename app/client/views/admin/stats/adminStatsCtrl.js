angular.module('reg')
  .controller('AdminStatsCtrl',[
    '$scope',
    '$http',
    'UserService',
    function($scope, $http, UserService){
      $http
        .get('/assets/schools.json')
        .then(function(res) {
          $scope.schoolList = res.data;
        });

      UserService
        .getStats()
        .success(function(stats){
          $scope.stats = stats;

          $scope.stats.demo.schools.forEach(function(school) {
            var schoolName = $scope.schoolList[school.email];

            if (schoolName) {
              school.email = school.email + ' (' + schoolName.school + ')';
            }
          })

          $scope.loading = false;
        });

      $scope.fromNow = function(date){
        return moment(date).fromNow();
      };
    }]);