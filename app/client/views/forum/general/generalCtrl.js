// const moment = require('moment');
// const swal = require('sweetalert');

angular.module('reg')
    .controller('GeneralCtrl',[
        '$scope',
        '$state',
        '$stateParams',
        'ForumService',
        'currentUser',
        'UserService',
        function($scope, $state, $stateParams, ForumService, currentUser, UserService){
            $('.msg_history').scrollTop($('.msg_history')[0].scrollHeight);
            // send with enter - doesnt work
            // ----------------------------
            // var input = $('.write_msg');
            // input.addEventListener("keyup", function(event) {
            //     if (event.keyCode === 13) {
            //         $('.msg_send_btn').click();
            //     }
            // });
            //setInterval(retrieveForumData, 10000);          // 10 seconds

            // set user cards
            var menu_trigger = $("[data-card-menu]");
            var back_trigger = $("[data-card-back]");

            menu_trigger.click(function(){
                $(".card, body").toggleClass("show-menu");
            });

            back_trigger.click(function(){
                $(".card, body").toggleClass("show-menu");
            });

            // basic initialization
            $scope.user = currentUser.data;

            $scope.date = new Date();

            $scope.users = [
            {
                src : "https://ptetutorials.com/images/user-profile.png",
                name : "Admin Admin",
                type : "Mentor"
            },
            {
                src : "https://ptetutorials.com/images/user-profile.png",
                name : "Arnaud",
                type : "Hacker"
            },
            {
                src : "https://ptetutorials.com/images/user-profile.png",
                name : "Nadav",
                type : "Hacker"
            },
            {
                src : "https://ptetutorials.com/images/user-profile.png",
                name : "Shai",
                type : "Mentor"
            },
            {
                src : "https://ptetutorials.com/images/user-profile.png",
                name : "Lasri",
                type : "Hacker"
            },
            {
                src : "https://ptetutorials.com/images/user-profile.png",
                name : "Test",
                type : "Hacker"
            },
            ];


            // test start
            var messageMap = new Map();
            messageMap.set(0 ,"Hey! ");
            messageMap.set(1 ,"welcome to EZ-Hack forum");
            messageMap.set(2 ,"");
            $scope.testss = Array.from(messageMap.values());
            // console.log(testss);

            $scope.sendMessage = function (){
                // take care of sent.
                $scope.testss.push( $scope.messageToSend);
                $scope.messageToSend = "";
            };

            function retrieveForumData(){
                    //
                console.log("Shai");
            }
        }]);
