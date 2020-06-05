const angular = require("angular");
const swal = require("sweetalert");
const util = require("util");

angular.module('reg')
  .controller('SponsorApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function ($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService) {

      // Set up the user
      $scope.user = currentUser.data;

      // Is the student from UT?
      $scope.isUtStudent = $scope.user.email.split('@')[1] == 'utexas.edu';

      $scope.resume = null;
      // If so, default them to adult: true
      if ($scope.isUtStudent) {
        $scope.user.profile.adult = true;
      }

      var socialMedia = {
        'Facebook': false,
        'Twitter': false,
        'School Club': false,
        'Website': false,
        'Friend': false,
        'MLH': false,
      };

      if ($scope.user.profile.socialMedia) {
        $scope.user.profile.socialMedia.forEach(function (media) {
          if (media in socialMedia) {
            socialMedia[media] = true;
          }
        });
      }

      $scope.socialMedia = socialMedia;
      $scope.skills = [];
      $scope.regIsClosed = Date.now() > settings.data.timeClose || Date.now() < settings.data.timeOpen;

      // Populate the school dropdown
      // populateSchools();
      // populateMajors();
      // populateSkills();
      _setupForm();

      function _updateUser(e) {
        var profile = $scope.user.profile;
        UserService
          .updateSponsor(Session.getUserId(), $scope.user)
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

      function resumeValidation(value) {
        return $scope.user.profile.resume || value;
      }

      function graduationValidation(value) {
        const standing = $scope.user.profile.standing;
        if (standing === 'M' || standing === 'D') {
          $scope.user.profile.graduationTime = "Other";
        }
        return $scope.user.profile.graduationTime.length > 0 || value;
      }

      function _setupForm() {
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
        };

        $.fn.form.settings.rules.emptyResume = function (value) {
          return resumeValidation(value);
        };

        $.fn.form.settings.rules.emptyGraduation = function (value) {
          return graduationValidation(value);
        };

        // Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            companyName: {
              identifier: 'companyName',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a company name.'
                }
              ]
            },
            PlegeAmount: {
              identifier: 'PlegeAmount',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter an amount.'
                }
              ]
            },
            RelevantLinks: {
              identifier: 'RelevantLinks',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please list some relevant links for your hackathon idea.'
                }
              ]
            }
          },
          on: 'blur'
        });
      }

      $scope.submitForm = function () {
        if ($('.ui.form').form('is valid')) {
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };


    }]);
