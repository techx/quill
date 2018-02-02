angular.module('reg')
  .controller('HomeCtrl', [
    '$rootScope',
    '$scope',
    'settings',
    'Utils',
    'EVENT_INFO',
    function($rootScope, $scope, settings, Utils, EVENT_INFO){
      var Settings = settings.data;
      $scope.regIsOpen = Utils.isRegOpen(Settings);
    }]);
