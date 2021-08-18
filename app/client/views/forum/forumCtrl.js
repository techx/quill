var angular = require('angular');

angular.module('reg')
    .controller('ForumCtrl', [
        '$scope',
        '$http',
        '$rootScope',
        '$state',
        'UserService',
        'userForums',
        'currentUser',
        'ForumService',
        function ($scope, $http, $rootScope, $state, UserService, userForums, currentUser, ForumService) {
            // catch event and roll down chat
            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                $('.msg_history').scrollTop($('.msg_history')[0].scrollHeight);
            });

            // class for basic info to save for each user
            class BasicForumInfo {
                constructor(lastMessage, forumType) {
                    this.lastMessage = lastMessage;
                    this.forumType = forumType;
                }
            }

            // basic initialize
            $scope.user = currentUser.data;

            $scope.unreadMsg = 0;
            $scope.unreadMsgMentor = 0;
            $scope.unreadMsgTeam = 0;
            $scope.unreadMsgGeneral = 0;

            $scope.forums = userForums.data;
            $scope.currentForum = null;

            // set forums in ForumService for access of other controllers
            $scope.newForums = createUserForums($scope.forums);
            $scope.oldForums = createUserForums($scope.user.forums);

            compareMessages();

            // check for forums updates.
            function checkForUpdates() {
                var updateID = $scope.currentForum ? $scope.currentForum._id : null;
                ForumService
                    .checkForUpdates($scope.newForums, updateID)
                    .then(response => {
                        if (response.data.forums) {
                            var map = createForumsMap(response.data.forums);

                            $scope.forums.forEach(forum => {
                                var newForum = map.get(forum._id);
                                if (newForum) {
                                    if (updateID && updateID === newForum._id && updateID === $scope.currentForum._id) {
                                        $scope.currentForum.messages = $scope.currentForum.messages.concat(newForum.messages.slice($scope.currentForum.lastMessage));
                                        $scope.currentForum.lastMessage = newForum.lastMessage;
                                        $scope.updateUserForums(newForum._id, newForum.lastMessage);
                                    } else {
                                        $scope.newForums.get(forum._id).lastMessage = newForum.lastMessage;
                                    }
                                }
                            });

                            compareMessages();
                        }
                    }, response => {
                        console.log(response);
                    });
            }

            function setCounter(forumType, forumID) {
                switch (forumType) {
                    case "general":
                        $scope.unreadMsgGeneral += $scope.newForums.get(forumID).lastMessage - $scope.oldForums.get(forumID).lastMessage;
                        break;
                    case "mentor":
                        $scope.unreadMsgMentor += $scope.newForums.get(forumID).lastMessage - $scope.oldForums.get(forumID).lastMessage;
                        break;
                    case "team":
                        $scope.unreadMsgTeam += $scope.newForums.get(forumID).lastMessage - $scope.oldForums.get(forumID).lastMessage;
                        break;
                    default:
                        break;
                }
            }

            setTimeout(function () {
                ForumService.stopInterval("update");
                var myInterval = setInterval(checkForUpdates, 5000);
                ForumService.setInterval(myInterval, "update");
            }, 4000);

            // basic functions
            function createUserForums(array) {
                var map = new Map();

                array.forEach(forum => {
                    map.set(forum.id, new BasicForumInfo(forum.lastMessage, forum.forumType));
                });

                return map;
            }

            function createForumsMap(array) {
                var map = new Map();
                array.forEach(forum => {
                    map.set(forum.id, forum);
                });
                return map;
            }

            // on update
            function compareMessages() {
                var update = false;
                resetCounters();

                $scope.newForums.forEach((value, key) => {
                    if ($scope.oldForums.get(key) === undefined) {
                        $scope.oldForums.set(key, new BasicForumInfo(0, value.forumType));
                        update = true;
                    }
                    setCounter(value.forumType, key);
                    update = value > $scope.oldForums.get(key).lastMessage ? true : update;
                });

                $scope.unreadMsg = $scope.unreadMsgMentor ? $scope.unreadMsgMentor : 0;
                if (update) {
                    UserService.updateForums($scope.user._id, $scope.oldForums);
                }
            }

            function resetCounters() {
                $scope.unreadMsg = 0;
                $scope.unreadMsgMentor = 0;
                $scope.unreadMsgTeam = 0;
                $scope.unreadMsgGeneral = 0;
            }

            $scope.getAllForumsByType = function (type) {
                var forums = [];
                $scope.forums.forEach(forum => {
                    if (forum.forumType === type)
                        forums.push(forum);
                });
                return forums;
            };

            $scope.updateCurrentForum = function (forumID, callback) {
                ForumService
                    .getForum(forumID)
                    .then(response => {
                        if (response.data) {
                            $scope.currentForum = response.data;
                            callback();
                        }
                    }, response => {
                        console.log(response.data);
                    });
            };

            $scope.setForum = function (newForum) {
                $scope.currentForum = newForum;
            };

            $scope.updateUserForums = function (forumID, lastMessage) {
                if (forumID) {
                    $scope.oldForums.get(forumID).lastMessage = lastMessage;
                    $scope.newForums.get(forumID).lastMessage = lastMessage;
                    UserService.updateForums($scope.user._id, $scope.oldForums);
                }
            };

            // sent message in chat
            $scope.sendMessage = function ($childScope) {
                var forum = $childScope.myForum;
                if ($childScope.sentMsg && $childScope.sentMsg !== '') {
                    ForumService.sendMessage(forum._id, $childScope.sentMsg, $childScope.user.profile.name)
                        .then(response => {
                            if (response.data) {
                                forum.messages = forum.messages.concat(response.data.messages.slice(forum.lastMessage));
                                forum.lastMessage = response.data.lastMessage;
                                $scope.setForum(forum);
                                $scope.updateUserForums(forum._id, forum.lastMessage);
                            }
                        }, response => {
                            console.log(response.data);
                        });
                    $childScope.sentMsg = "";
                }
            };

        }]).directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    };
});
