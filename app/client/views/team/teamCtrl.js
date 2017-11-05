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
          .success(function(users){
            $scope.error = null;
            $scope.teammates = users;
          });
      }

      if ($scope.user.teamCode){
        _populateTeammates();
      }

      $('.ui.form')
        .form({
          fields: {
            name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your team name.'
                }
              ]
            }
          }
        })
      ;

      $scope.joinTeam = function(){
        if ($('.ui.form').form('is valid')) {
          UserService
            .joinOrCreateTeam($scope.code)
            .success(function(user){
              $scope.error = null;
              $scope.user = user;
              _populateTeammates();
            })
            .error(function(res){
              $scope.error = res.message;
            });
        }
      };

      $scope.leaveTeam = function(){
        UserService
          .leaveTeam()
          .success(function(user){
            $scope.error = null;
            $scope.user = user;
            $scope.teammates = [];
          })
          .error(function(res){
            $scope.error = res.data.message;
          });
      };

    }]);
