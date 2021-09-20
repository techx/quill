const angular = require('angular');
const Utils = require('../../src/modules/Utils.js');
const swal = require("sweetalert");

angular.module('reg')
    .service('settings', function () {
    })
    .controller('SidebarCtrl', [
        '$rootScope',
        '$scope',
        'settings',
        'Utils',
        'AuthService',
        'Session',
        'EVENT_INFO',
        'UpdatesService',
        'SettingsService',
        function ($rootScope, $scope, settings, Utils, AuthService, Session, EVENT_INFO, UpdatesService, SettingsService) {

            var user = $rootScope.currentUser;

            $scope.EVENT_INFO = EVENT_INFO;

            $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);

            $scope.updateText = "";

            $scope.updates = [];

            $scope.logout = function () {
                AuthService.logout();
            };

            $scope.showSidebar = false;
            $scope.toggleSidebar = function () {
                $scope.showSidebar = !$scope.showSidebar;
            };

            // oh god jQuery hack
            $('.item').on('click', function () {
                $scope.showSidebar = false;
            });

            $scope.openForm = function openForm() {
                $scope.updateText = "";
                $("#myForm").css("display", "block");
            };

            $scope.closeForm = function () {
                $("#myForm").css("display", "none");
            };

            $scope.addUpdate = function (){
                var messageSent = {
                    message : $scope.updateText,
                    date: Date.now(),
                    user: user._id,
                };

                UpdatesService
                    .update(messageSent)
                    .then(response => {
                        if (response){
                            $scope.updates = response.data.messages;
                            $scope.closeForm();
                            swal("Update sent successfully!!", $scope.updateText, "success");
                        }
                    }, response => {
                        console.log(response);
                        swal("Uh oh!", "Something went wrong..", "error");
                    });
            };

            function getUpdates(){
                UpdatesService
                    .getUpdates($scope.updates.length)
                    .then(response => {
                        if (response){
                            if (response.data.messages.length > 0){
                                $scope.updates = $scope.updates.concat(response.data.messages);
                            }
                        }
                    }, response => {
                        console.log(response);
                    });
            }

            getUpdates();
            UpdatesService.stopInterval();
            var myInterval = setInterval(getUpdates, 60000); // set time for Event Updates
            UpdatesService.setInterval(myInterval);
        }]);
