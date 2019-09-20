angular.module('reg')
  .controller('TeamCtrl', [
    '$scope',
    'currentUser',
    'settings',
    'Utils',
    'UserService',
    'TEAM',
    function($scope, currentUser, settings, Utils, UserService, TEAM){
      // Get the current user's most recent data.
      var Settings = settings.data;

      $scope.regIsOpen = Utils.isRegOpen(Settings);

      $scope.user = currentUser.data;

      $scope.TEAM = TEAM;

      function _populateTeammates() {
        UserService
          .getMyTeammates()
          .then(response => {
            $scope.error = null;
            $scope.teammates = response.data;
          })
      }

      if ($scope.user.teamCode){
        _populateTeammates();
      } else {
        _setupForm();
      }

      function _setupForm() {
        $('.ui.form').form({
          inline: true,
          fields: {
            team: {
              identifier: 'team',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your team name.'
                }
              ]
            }
          },
          on: 'blur'
        });
      }

      function _joinTeam() {
        UserService
          .joinOrCreateTeam($scope.code)
          .then(response => {
            $scope.error = null;
            $scope.user = response.data;
            _populateTeammates();
          }, response => {
            $scope.error = response.data.message;
          });
      }

      $scope.joinTeam = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          swal("Uh oh!", "Please Type a Team Name", "error");
        }
      };

      $scope.leaveTeam = function(){
        UserService
          .leaveTeam()
          .then(response => {
            $scope.error = null;
            $scope.user = response.data;
            $scope.teammates = [];
          }, response => {
            $scope.error = response.data.message;
          });
      };

    }]);
