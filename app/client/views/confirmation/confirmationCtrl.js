const swal = require('sweetalert');

angular.module('reg')
  .controller('ConfirmationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    'currentUser',
    'Utils',
    'UserService',
    function ($scope, $rootScope, $state, currentUser, Utils, UserService) {

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;

      $scope.pastConfirmation = Date.now() > user.status.confirmBy;

      $scope.formatTime = Utils.formatTime;

      _setupForm();

      function _updateUser() {
        var confirmation = $scope.user.confirmation;
        UserService
          .updateConfirmation(user._id, confirmation)
          .then(r => {
            swal("Woo!", "You're confirmed!", "success").then(value => {
              $state.go("app.dashboard");
            });
          }, r => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _setupForm() {
        // Semantic-UI form validation
        $('.ui.form').form({
          fields: {
            confirm: {
              identifier: 'confirm',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please confirm your spot'
                }
              ]
            }
          }
        });
      }

      $scope.submitForm = function () {
        if ($('.ui.form').form('is valid')) {
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

    }]);
