// const moment = require('moment');
// const swal = require('sweetalert');

angular.module('reg')
    .controller('MentorCtrl',[
        '$scope',
        '$state',
        '$stateParams',
        'currentUser',
        'UserService',
        'ForumService',
        function($scope, $state, $stateParams, currentUser, UserService, ForumService){
            $('.msg_history').scrollTop($('.msg_history')[0].scrollHeight);
            $scope.user = currentUser.data;

            $scope.forum = ForumService.getSpecificForum("mentor");

            function setMembers() {
                UserService.getMentorForumMembers()
                    .then(response => {
                        $scope.teammates = response.data;
                    }, response => {
                        console.log(response);
                    });
            }

            $scope.updateForum = function (){
                if ($scope.sentMsg && $scope.sentMsg !== ''){
                    ForumService.updateForum($scope.forum._id, $scope.sentMsg, $scope.user.profile.name)
                        .then(response => {
                            $scope.forum = response.data;
                        }, response => {
                            console.log(response.data);
                        });
                }
            };


            setMembers();
            $scope.users = [];
        }]);
