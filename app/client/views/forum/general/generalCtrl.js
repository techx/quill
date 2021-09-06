angular.module('reg')
    .controller('GeneralCtrl', [
        '$scope',
        '$state',
        '$stateParams',
        'ForumService',
        'UserService',
        function ($scope, $state, $stateParams, ForumService, UserService) {
            // declarations
            const FORUM_TYPE = "general";
            $scope.searchText = "";
            $scope.unreadMsgGeneral = 0;
            $scope.searchUser = "";
            $scope.myForum = new FormData();
            $scope.forum = $scope.getAllForumsByType(FORUM_TYPE)[0];

            // get all chat members to show.
            function setMembers() {
                UserService.getAllForForum()
                    .then(response => {
                        $scope.allUsers = response.data;
                    }, response => {
                        console.log(response);
                    });
            }


            // set specific forum - general
            function setForum(){
                $scope.updateCurrentForum($scope.forum._id, function (){
                    $scope.myForum = $scope.currentForum;
                    setMembers();
                    if ($scope.myForum.lastMessage - $scope.oldForums.get($scope.myForum._id).lastMessage !== 0)
                        $scope.updateUserForums($scope.myForum._id, $scope.myForum.lastMessage);
                });
            }

            // send message
            $scope.send = function (){
                $scope.sendMessage($scope);
            };

            setForum();
        }]);

