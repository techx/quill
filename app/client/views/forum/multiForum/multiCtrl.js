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
            $scope.multiForum = new FormData();
            $scope.forums = $scope.getAllForumsByType("mentor");

            // get all chat members to show.
            function setMembers() {
                UserService
                    .getMentorForumMembers($scope.multiForum.team)
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
                    $scope.multiForum = $scope.currentForum;
                    setMembers();
                    if ($scope.multiForum.lastMessage - $scope.oldForums.get($scope.multiForum._id) !== 0)
                         $scope.updateUserForums($scope.multiForum._id, $scope.multiForum.lastMessage);
                });
            };

            // sent message in chat
            $scope.sendMessage = function () {
                if ($scope.sentMsg && $scope.sentMsg !== '') {
                    ForumService.sendMessage($scope.multiForum._id, $scope.sentMsg, $scope.user.profile.name)
                        .then(response => {
                            if (response.data) {
                                $scope.multiForum = response.data;
                                $scope.setForum($scope.multiForum);
                                $scope.updateUserForums($scope.multiForum._id, $scope.multiForum.lastMessage);
                            }
                        }, response => {
                            console.log(response.data);
                        });
                    $scope.sentMsg = "";
                }
            };

        }]);
