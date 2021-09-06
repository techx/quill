angular.module('reg')
    .factory('ForumService', [
        '$http',
        'Session',
        'UserService',
        function ($http, Session, UserService) {

            var forum = '/api/forums';
            var base = forum + '/';

            var localIntervals = new Map();

            var setInterval = function (interval, key) {
                localIntervals.set(key, interval);
            };

            var stopInterval = function (key) {
                if (localIntervals.get(key) !== undefined) {
                    clearInterval(localIntervals.get(key));
                }
            };

            return {
                // ----------------------
                // Getters , Setters and basic functions
                // -------------

                setInterval: setInterval,
                stopInterval:stopInterval,

                // ----------------------
                // Main functions to server
                // ----------------------

                getHackerForums: function () {
                    return $http.get(base + Session.getUserTeam());
                },

                getForum: function (forumID){
                    return $http.get(base + "rec/" + forumID);
                },

                getMentorForums: function () {
                    return $http.get(base + "mentor");
                },

                addNewForum: function (teamName) {
                    return $http.put(base + 'create', {
                        teamName: teamName,
                    });
                },

                deleteForums: function(team){
                   UserService
                       .getMembersByTeam(team)
                       .then(response => {
                           console.log(response);
                           if(!response.data.users || response.data.users.length === 0){
                               return $http.delete(base + team);
                           }
                           }, response => {
                                console.log(response);
                           }
                       );
                },

                sendMessage: function (forumID, message, user) {
                    return $http.post(base + 'send', {
                        forumID: forumID,
                        message: message,
                        user: user,
                    });
                },

                checkForUpdates : function(forums, forumIdUpdate) {
                    var forumsList = [];

                    for (let [key, value] of  forums.entries()) {
                        if (forumIdUpdate && key === forumIdUpdate){
                            forumsList.push({
                                id: key,
                                lastMessage: value.lastMessage,
                                update: true
                            });
                        }
                        else {
                            forumsList.push({
                                id: key,
                                lastMessage: value.lastMessage
                            });
                        }
                    }

                    return $http.post(base + "updateAll/" ,
                        {
                            forums: forumsList
                        });
                },
            };
        }
    ]);