const swal = require('sweetalert');

angular.module('reg')
.directive("fileread", [function () {
  return {
      scope: {
          fileread: "="
      },
      link: function (scope, element, attributes) {
          element.bind("change", function (changeEvent) {
              scope.$apply(function () {
                  const file = changeEvent.target.files[0];
                
                  const reader = new FileReader();
                  reader.addEventListener('load', (event) => {
                    scope.$apply(function(){
                      scope.fileread = event.target.result;
                      console.log(scope.fileread);
                    })
                  });
                  reader.readAsDataURL(file);
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
    function($scope, $rootScope, $state, currentUser, Utils, UserService){

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;

      $scope.pastConfirmation = Date.now() > user.status.confirmBy;

      $scope.formatTime = Utils.formatTime;

      _setupForm();

      $scope.fileName = user._id + "_" + user.profile.name.split(" ").join("_");

      function _updateUser(e){
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
      }

      function _setupForm(){
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

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

    }]);
