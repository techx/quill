angular.module('reg')
    .factory('MailService', [
        '$http',
        function($http){
            var base = '/api/mail/';

            return {

                // ----------------------
                // Admin Actions
                // ----------------------

                sendMail: function(title, text, recipient){
                    return $http.put(base + 'send', {
                        title: title,
                        text: text,
                        recipient: recipient
                    });
                },
            };
        }
    ]);
