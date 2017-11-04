angular.module('reg')
  .controller('HomeCtrl', [
    '$rootScope',
    '$scope',
    'settings',
    'Utils',
    function($rootScope, $scope, settings, Utils){
      var Settings = settings.data;
      $scope.regIsOpen = Utils.isRegOpen(Settings)
    }]);
