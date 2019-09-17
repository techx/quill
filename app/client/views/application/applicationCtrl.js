const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
  .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService) {

      // Set up the user
      $scope.user = currentUser.data;

      // Is the student from UT?
      $scope.isUtStudent = $scope.user.email.split('@')[1] == 'utexas.edu';

      $scope.resume = null;

      // If so, default them to adult: true
      if ($scope.isUtStudent){
        $scope.user.profile.adult = true;
      }
    
       var socialMedia = {
        'Facebook': false,
        'Twitter': false,
        'School Club': false,
        'Website': false,
        'Friend': false
      };

      if ($scope.user.profile.socialMedia){
        $scope.user.profile.socialMedia.forEach(function(media){
          if (media in socialMedia){
            socialMedia[media] = true;
          }
        });
      }

      $scope.socialMedia = socialMedia;
     
      // Populate the school dropdown
      populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > settings.data.timeClose;

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){
        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if (schools[email]){
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });

        $http
          .get('/assets/schools.csv')
          .then(function(res){
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for(i = 0; i < $scope.schools.length; i++) {
              $scope.schools[i] = $scope.schools[i].trim();
              content.push({title: $scope.schools[i]})
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.profile.school = result.title.trim();
                }
              })
          });
      }



      function _updateUser(e){
        var profile = $scope.user.profile;
        // Get the dietary restrictions as an array
        var drs = [];
        Object.keys($scope.socialMedia).forEach(function(key){
          if ($scope.socialMedia[key]){
            drs.push(key);
          }
        });
        profile.socialMedia = drs;

        console.log($scope.user.profile);

        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .then(response => {
            swal("Awesome!", "Your application has been saved.", "success")
            .then(value => {
              $state.go("app.dashboard");
            });
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      function isMinor() {
        return !$scope.user.profile.adult;
      }

      function minorsAreAllowed() {
        return settings.data.allowMinors;
      }

      function minorsValidation() {
        // Are minors allowed to register?
        if (isMinor() && !minorsAreAllowed()) {
          return false;
        }
        return true;
      }

      function resumeValidation() {
        return $scope.user.profile.resume;
      }

      function _setupForm(){
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
        };

        $.fn.form.settings.rules.emptyResume = function (value) {
          return resumeValidation();
        };

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
            phone: {
              identifier: 'phone',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a phone number.'
                }
              ]
            },
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
                }
              ]
            },
            eid: {
              identifier: 'uteid',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please type your UT EID or put N/A if not a UT student.'
                }
              ]
            },
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a gender.'
                }
              ]
            },
            year: {
              identifier: 'year',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your graduation year.'
                }
              ]
            },
            resume: {
              identifier: 'resume',
              rules: [
                {
                  type: 'emptyResume',
                  prompt: 'Please upload your resume.'
                }
              ]
            },
            firstTimeHacker: {
              identifier: 'firstHackathon',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please indicate if you\'ve ever gone to a hackathon before.'
                }
              ]
            },
            adult: {
              identifier: 'adult',
              rules: [
                {
                  type: 'allowMinors',
                  prompt: 'You must be an adult to attend this event.'
                }
              ]
            }
          },
          on: 'blur'
        });
      }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

      $scope.uploadResume = function(files) {
        UserService
          .uploadResume(Session.getUserId(), files[0])
          .then(response => {
            $scope.user.profile.resume = true
          }, response => {
            $scope.user.profile.resume = false
          });
       }
    }]);
