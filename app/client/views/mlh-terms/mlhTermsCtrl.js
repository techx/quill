angular.module('reg')
  .controller('MLHTermsCtrl', [
    '$scope',
    '$http',
    '$sce',
    function($scope, $http, $sce){
      $scope.terms = {
        contest: null,
        ethical: null,
      };

      var converter = new showdown.Converter();
      $http.get('assets/contest-terms.md').success((data) => {
        $scope.terms.contest = $sce.trustAsHtml(converter.makeHtml(data));
      })
      $http.get('assets/ethical-hack.md').success((data) => {
        $scope.terms.ethical = $sce.trustAsHtml(converter.makeHtml(data));
      })
    }
  ]);
