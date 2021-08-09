// const moment = require('moment');
// const swal = require('sweetalert');

angular.module('reg')
    .controller('TeamForumCtrl',[
        '$scope',
        '$state',
        '$stateParams',
        'currentUser',
        'UserService',
        'ForumService',
        function($scope, $state, $stateParams, currentUser, UserService, ForumService){
            $('.msg_history').scrollTop($('.msg_history')[0].scrollHeight);
            $scope.user = currentUser.data;

            $scope.forum = ForumService.getSpecificForum("team");
        }]);
