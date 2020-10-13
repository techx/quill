const angular = require('angular');
const showdown = require('showdown');
const swal = require('sweetalert');

angular.module('reg')
  .controller('DiscordCtrl', [
    '$rootScope',
    '$scope',
    '$stateParams',
    'currentUser',
    'AuthService',
    function($rootScope, $scope, $stateParams, currentUser, AuthService) {
      $scope.user = currentUser.data;
      $scope.text = "Loading...";

      function onSuccess(res) {
          console.log('success');
          $scope.text = "!verify " + res.data.discordToken;
        }

      function onFailure() {
          console.log('failed');
      }

      $scope.getText = function() {
          console.log(AuthService);
          AuthService.getDiscordToken(onSuccess, onFailure);
      }
}]);
