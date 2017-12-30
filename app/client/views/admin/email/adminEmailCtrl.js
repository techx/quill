angular.module('reg')
  .controller('AdminEmailCtrl',[
    '$scope',
    '$state',
    'UserService',
    function($scope, $state, UserService){
      $scope.email = {};
      $scope.loading = false;

      _setupForm();

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
          fields: {
            subject: {
              identifier: 'subject',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Emails require a subject!'
                }
              ]
            },
            title: {
              identifier: 'title',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Emails require a title!'
                }
              ]
            },
            description: {
              identifier: 'description',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Emails require a description!'
                }
              ]
            },
          },
        });
      }

      $scope.sendEmails = function() {
        if ($('.ui.form').form('is valid')){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to email everyone!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, email everyone.",
            closeOnConfirm: false
            },
            function(){
              UserService.emailAllUsers($scope.email).then((res) => {
                sweetAlert({
                  title: "Awesome!",
                  text: "Your emails have been sent.",
                  type: "success",
                  confirmButtonColor: "#e76482"
                }, function(){
                  $state.go('app.admin.stats');
                });
              }, (err) => {
                sweetAlert(
                  "Uh oh!",
                  "Something went wrong. (" + err.status + ": " + err.statusText + ").",
                  "error");
              });
            }
          );
        }
      }
    }]);
