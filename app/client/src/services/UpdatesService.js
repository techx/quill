angular.module('reg')
    .factory('UpdatesService', [
        '$http',
        function($http){

            var base = '/api/updates/';

            var localInterval;

            var setInterval = function (interval) {
                localInterval = interval;
            };

            var stopInterval = function () {
                clearInterval(localInterval);
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
                getUpdates: function(){
                    return $http.get(base + 'getUpdates');
                },

                update: function (message){
                    return $http.put(base + 'update', {
                        message: message
                    });
                }
            };

        }
    ]);
