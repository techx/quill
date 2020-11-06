const swal = require('sweetalert');

angular.module('reg')
  .directive("onfilechange", [function () {
    return {
      scope: {
        onfilechange: "&"
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          scope.$apply(function () {
            console.log("changed");
            const file = changeEvent.target.files[0];
            scope.onfilechange()(file);
          });
        });
      }
    }
  }])
  .directive('pdf', ['$compile', function ($compile) {
    return {
      restrict: 'E',
      scope: {
        src: "=",
        height: "="
      },
      link: function (scope, element, attr) {
        function update(url) {
          element.html('<object data="' + url + '" type="application/pdf" width="100%" style="height: 30rem;"></object>');
          $compile(element.contents())(scope);
        }
        scope.$watch('src', update);
      }
    };
  }])
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

      $scope.file = null;
      $scope.fileData = null;

      if (user.confirmation && user.confirmation.hasResume) {
        UserService
          .getResume(user.id)
          .then(res => {
            $scope.fileData = 'data:application/pdf;base64,' + res.data.file;
          });
      }

      $scope.pastConfirmation = Date.now() > user.status.confirmBy;

      $scope.formatTime = Utils.formatTime;

      _setupForm();

      function _updateUser(e) {
        UserService
          .updateResume(user._id, $scope.file)
          .then(r => {
            user.confirmation.hasResume = true;
            var confirmation = $scope.user.confirmation;

            UserService
              .updateConfirmation(user._id, confirmation)
              .then(response => {
                swal("Woo!", "You're confirmed!", "success").then(value => {
                  $state.go("app.dashboard");
                });
              }, response => {
                swal("Uh oh!", "Something went wrong.", "error");
              });
          }, r => swal("Uh oh!", "Something went wrong... Try again?", "error"));
      }

      function _setupForm() {
        // Semantic-UI form validation
        $('.ui.form').form({
          fields: {
            shirt: {
              identifier: 'shirt',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please give us a shirt size!'
                }
              ]
            },
            mlhShare: {
              identifier: 'mlhShare',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must agree to the MLH policies.'
                }
              ]
            }
          }
        });
      }

      $scope.onFileChange = function (file) {
        $scope.file = file;
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          $scope.$apply(function(){
            $scope.fileData = event.target.result;
          })
        });
        reader.readAsDataURL(file);
      }

      $scope.submitForm = function () {
        if ($('.ui.form').form('is valid')) {
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

    }]);
