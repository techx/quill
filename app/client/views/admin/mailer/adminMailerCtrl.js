const showdown = require('showdown');

angular.module('reg')
    .controller('AdminMailerCtrl',[
        '$scope',
        '$sce',
        'MailService',
        function($scope, $sce, MailService){

            $scope.mailMarkup = '';
            $scope.options = {
                custom: [],
                verified: false,
                submitted: false,
                admitted: false,
                confirmed: false
            };

            var converter = new showdown.Converter();
            $scope.markdownPreview = function(text){
                return $sce.trustAsHtml(converter.makeHtml(text));
            };

            $scope.sendMail = function(text){
                console.log(text);
            }

        }]);
