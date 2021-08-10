const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminUserCtrl',[
    '$scope',
    '$http',
    'user',
    'UserService',
    function($scope, $http, User, UserService){
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

      // Populate the school dropdown
      populateCompays();

      /**
       * TODO: JANK WARNING
       */
      function populateCompays(){

        $http
          .get('/assets/companys.json')
          .then(function(res){
            var companys = res.data;
            var email = $scope.selectedUser.email.split('@')[1];

            if (companys[email]){
              $scope.selectedUser.profile.company = companys[email].company;
              $scope.autoFilledCompany = true;
            }

          });
      }



      $scope.updateProfile = function(){
        UserService
          .updateProfile($scope.selectedUser._id, $scope.selectedUser.profile)
          .then(response => {
            $selectedUser = response.data;
            swal("Updated!", "Profile updated.", "success");
          }, response => {
            swal("Oops, you forgot something.");
          });
      };
    }]);
