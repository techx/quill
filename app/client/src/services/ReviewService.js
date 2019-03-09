angular.module('reg')
    .factory('ReviewService', [
        '$http',
        function($http){
            var base = '/api/review/';

            return {

                // ----------------------
                // Admin Actions
                // ----------------------

                getSubmissionsList: function(){
                    return $http.get(base + 'list/submissions');
                },

                getReviewersList: function(){
                    return $http.get(base + 'list/reviewers');
                },

                release: function(){
                    return $http.get(base + 'release');
                },

                assignReview: function(id){
                    return $http.get(base + 'assign/' + id);
                },

                assignReviews: function(){
                    return $http.get(base + 'assign');
                },

                getReviewQueue: function(){
                    return $http.get(base + 'queue');
                },

                updateReview: function(userId, ratings, comments){
                    return $http.put(base + 'update', {
                        userId: userId,
                        ratings: ratings,
                        comments: comments
                    });
                },
            };
        }
    ]);
