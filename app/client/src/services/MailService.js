angular.module('reg')
    .factory('MailService', [
        '$http',
        function($http){
            var base = '/api/mail/';

            return {

                // ----------------------
                // Admin Actions
                // ----------------------

                sendMail: function(sender, title, text, recipient){
                    return $http.put(base + 'send', {
                        sender: sender,
                        title: title,
                        text: text,
                        recipient: recipient
                    });
                },

                sendPostVerificationEmail: function(recipient){
                    return $http.put(base + 'sendPostVerificationEmail', {
                        recipient: recipient
                    });
                }
            };
        }
    ]);
