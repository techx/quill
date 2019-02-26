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

                sendSchoolMail: function(sender, title, text, recipient, schoolRecipient){
                    return $http.put(base + 'sendSchool', {
                        sender: sender,
                        title: title,
                        text: text,
                        recipient: recipient,
                        schoolRecipient: schoolRecipient
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
