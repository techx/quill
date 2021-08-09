angular.module('reg')
    .factory('ForumService', [
        '$http',
        'Session',
        'UserService',
        function($http, Session, UserService){

            var forum = '/api/forums';
            var base = forum + '/';
            var allForums;

            var setForums = function(forums){
                allForums = forums;
            };

            // forums received as
            var getSpecificForum = function (type){
                for (forum in allForums){
                    if (allForums[forum].forumType === type)
                        return allForums[forum];
                }
            };

            return {
                // ----------------------
                // Getters & Setters functions
                // -------------

                setForums : setForums,

                getSpecificForum : getSpecificForum,

                // ----------------------
                // Main functions
                // ----------------------

                getUserForums: function(){
                    return $http.get(base + Session.getUserTeam());
                },

                addNewForum : function(teamName){
                    return $http.put(base + 'create', {
                        teamName : teamName,
                    });
                },

                updateForum: function(forumID, message, user){
                    return $http.post(base + 'update', {
                        forumID : forumID,
                        message : message,
                        user : user
                    });
                },
            };
        }
    ]);