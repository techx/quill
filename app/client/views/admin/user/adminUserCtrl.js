angular.module('reg')
  .controller('AdminUserCtrl',[
    '$scope',
    '$http',
    '$window',
    'user',
    'UserService',
    function($scope, $http, $window, User, UserService){
      $scope.selectedUser = User.data;

      // Populate the school dropdown
      populateSchools();

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){

        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.selectedUser.email.split('@')[1];

            if (schools[email]){
              $scope.selectedUser.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }

          });
      }


      $scope.updateProfile = function(){
        UserService
          .updateProfile($scope.selectedUser._id, $scope.selectedUser.profile)
          .success(function(data){
            $selectedUser = data;
            swal("Updated!", "Profile updated.", "success");
          })
          .error(function(){
            swal("Oops, you forgot something.");
          });
      };

      $scope.openResume = function() {
        $window.open('/api/resume/' + $scope.selectedUser.id, '_blank');
      }

      $scope.formatTime = function(time) {
        return moment(time).format('MMMM Do YYYY, h:mm:ss a');
      }

    }]);