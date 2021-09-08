angular.module('reg')
    .controller('MultiCtrl', [
        '$scope',
        '$state',
        '$stateParams',
        'ForumService',
        'UserService',
        function ($scope, $state, $stateParams, ForumService, UserService) {
            // declarations
            $scope.forumSelected = 0;
            $scope.searchText = "";
            $scope.searchUser = "";
            $scope.myForum = new FormData();
            $scope.forums = $scope.getAllForumsByType("mentor");

            // get all chat members to show.
            function setMembers() {
                UserService
                    .getMentorForumMembers($scope.myForum.team)
                    .then(response => {
                        if (response.data) {
                            $scope.allUsers = response.data;
                        }
                    }, response => {
                        console.log(response);
                    });
            }

            // on team pick change.
            $scope.onTeamChange = function(){
                $scope.updateCurrentForum($scope.forumSelected, function (){
                    $scope.myForum = $scope.currentForum;
                    setMembers();
                    if ($scope.myForum.lastMessage - $scope.oldForums.get($scope.myForum._id) !== 0)
                         $scope.updateUserForums($scope.myForum._id, $scope.myForum.lastMessage);
                });
            };

            // send message

            // sent message in chat
            $scope.send = function (){
                $scope.sendMessage($scope);
            };

        }]);
