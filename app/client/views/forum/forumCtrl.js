var angular = require('angular');

angular.module('reg')
    .controller('ForumCtrl', [
        '$scope',
        '$http',
        '$rootScope',
        '$state',
        'userForums',
        'currentUser',
        'ForumService',
        function($scope, $http, $rootScope, $state, userForums, currentUser, ForumService){
            $scope.user = currentUser.data;
            $scope.team = $scope.user.teamCode;

            ForumService.setForums(userForums.data.forums);
        }]);
