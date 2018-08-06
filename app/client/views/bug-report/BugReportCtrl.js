angular.module('reg')
  .controller('BugReportCtrl', [
    '$scope',
    '$state',
    '$http',
    'UserService',
    function($scope, $state, $http, UserService){
      _setupForm();

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your name.'
                }
              ]
            },
            email: {
              identifier: 'email',
              rules: [
                {
                  type: 'email',
                  prompt: 'Please make sure the email is valid.'
                }
              ]
            },
            bug_details: {
              identifier: 'bug_details',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter details about the bug.'
                }
              ]
            }
          }
        });
      }

      $scope.submitForm = function() {
        if ($('.ui.form').form('is valid')) {
          // Email bug report
        //   $http({
        //     method: 'POST',
        //     url: '/bug-report',
        //     data:  {
        //         bug_details: $scope.bug_details
        //     },
        //     headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        //     });
        }
        else{
          sweetAlert("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

    }]);
