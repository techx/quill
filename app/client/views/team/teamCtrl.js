angular.module('reg')
  .controller('TeamCtrl', [
    '$scope',
    'currentUser',
    'settings',
    'Utils',
    'UserService',
    'ForumService',
    'TEAM',
    function($scope, currentUser, settings, Utils, UserService, ForumService, TEAM){
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
          });
      }

      if ($scope.user.teamCode){
        _populateTeammates();
      }

      $scope.joinTeam = function(){
          UserService
              .joinOrCreateTeam($scope.code)
              .then(response => {
                  $scope.error = null;
                  $scope.user = response.data;
                  _populateTeammates();
                  _createNewForum(response.data.teamCode);
                  }, response => {
                  $scope.error = response.data.message;
              });
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

      function _createNewForum(teamName) {
          ForumService
              .addNewForum(teamName)
              .then(response =>{
                  console.log(response);
              }, response => {
                  console.log(response);
                  // $scope.error = response.data.message;
              });
      }

    }]);
