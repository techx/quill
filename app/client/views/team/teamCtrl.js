const swal = require("sweetalert");

angular.module('reg')
  .controller('TeamCtrl', [
    '$scope',
    '$state',
    'currentUser',
    'settings',
    'Utils',
    'UserService',
    'TEAM',
    function($scope,$state ,currentUser, settings, Utils, UserService, TEAM){
      // Get the current user's most recent data.
      var Settings = settings.data;

      $scope.regIsOpen = Utils.isRegOpen(Settings);

      $scope.user = currentUser.data;
      $scope.nationality = undefined;

      if($scope.user.profile.category == 'ORG') {
        $scope.code = $scope.user.profile.org.name;
      }

      // console.log('currentUser',currentUser.data);
      
      $scope.parseNationality = (n) => {
        if(n) {
          return '(' + n + ')';
        } else {
          return ''
        }
      }

      $scope.TEAM = TEAM;
      $scope.nationalityWarning = 'A team should have at least one participant of Indian nationality. If this criteria is not met, your team would be disqualified.';

      function _populateTeammates() {
        UserService
          .getMyTeammates()
          .then(response => {
            $scope.error = null;
            // console.log('teammates:', response.data);
            $scope.teammates = response.data;
            // $scope.nationalityWarning = '';
            response.data.forEach(u => {
              if($scope.user.profile.nationality && ($scope.user.profile.nationality.toLowerCase() == 'indian' || $scope.user.profile.nationality.toLowerCase() == 'india')) {
                $scope.nationalityWarning = '';
                return;
              }
            });
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
            location.reload();
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

      $scope.addTeamates = function(){
        UserService
          .addTeamMates({email:$scope.email,code:$scope.user.teamCode})
          .then(response => {
            swal("Woo!", "Successfully added a new teammate!", "success");
            _populateTeammates();
          }, response => {
            $scope.error = response.data.message;
          });
          $scope.email='';
      };


    }]);
