angular.module('reg')
    .factory('ReviewService', [
        '$http',
        function($http){
            var base = '/api/review/';

            return {

                // ----------------------
                // Admin Actions
                // ----------------------

                release: function(){
                    return $http.get(base + 'release');
                },

                assignReview: function(userId){
                    return $http.get(base + 'assign/' + userId);
                },

                assignReviews: function(){
                    return $http.get(base + 'assign');
                },

                getReviewQueue: function(){
                    return $http.get(base + 'queue');
                },

                updateReview: function(userId, email, rating, comment){
                    return $http.put(base + 'update', {
                        userId: userId,
                        email: email,
                        rating: rating,
                        comment: comment
                    });
                },
            };
        }
    ]);
