angular.module('reg')
    .factory('MailService', [
        '$http',
        function($http){
            var base = '/api/mail/';

            return {

                // ----------------------
                // Admin Actions
                // ----------------------

                sendMail: function(id, text, options){
                    return $http.put(base + id + '/send', {
                        text: text,
                        options: options
                    });
                },
            };
        }
    ]);
