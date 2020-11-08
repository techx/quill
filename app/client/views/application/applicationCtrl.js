const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
  .directive("onfilechange", [function () {
    return {
      scope: {
        onfilechange: "&"
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          scope.$apply(function () {
            const file = changeEvent.target.files[0];
            scope.onfilechange()(file);
          });
        });
      }
    }
  }])
  .directive('pdf', ['$compile', function ($compile) {
    return {
      restrict: 'E',
      scope: {
        src: "=",
        height: "="
      },
      link: function (scope, element, attr) {
        function update(url) {
          element.html('<object data="' + url + '" type="application/pdf" width="100%" style="height: 30rem;"></object>');
          $compile(element.contents())(scope);
        }
        scope.$watch('src', update);
      }
    };
  }])
  .controller('ApplicationCtrl', [
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
      var user = currentUser.data;
      $scope.user = user;
      if (!user.profile) {
        user.profile = {};
      }

      $scope.file = null;
      $scope.fileData = null;

      if (user.profile && user.profile.hasResume) {
        UserService
          .getResume(user.id)
          .then(res => {
            $scope.fileData = 'data:application/pdf;base64,' + res.data.file;
          });
      }

      // Populate the school dropdown
      populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > settings.data.timeClose;

      /**
       * TODO: JANK WARNING
       */
      function populateSchools() {
        $http
          .get('/assets/schools.json')
          .then(function (res) {
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if (schools[email]) {
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });

        $http
          .get('/assets/schools.csv')
          .then(function (res) {
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for (i = 0; i < $scope.schools.length; i++) {
              $scope.schools[i] = $scope.schools[i].trim();
              content.push({ title: $scope.schools[i] });
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function (result, response) {
                  $scope.user.profile.school = result.title.trim();
                }
              });
          });
      }

      function _updateUser() {
        UserService
          .updateResume(user._id, $scope.file)
          .then(r => {
            user.profile.hasResume = true;

            UserService
              .updateProfile(Session.getUserId(), $scope.user.profile)
              .then(response => {
                swal("Awesome!", "Your application has been saved.", "success").then(value => {
                  $state.go("app.dashboard");
                });
              }, response => {
                swal("Uh oh!", "Something went wrong.", "error");
              });
          }, r => swal("Uh oh!", "Something went wrong... Try again?", "error"));
      }

      function _setupForm() {
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
            gradYear: {
              identifier: 'gradYear',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your graduation year.'
                }
              ]
            },
            age: {
              identifier: 'age',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your age.'
                }
              ]
            },
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school.'
                }
              ]
            },
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your gender.'
                }
              ]
            },
            race: {
              identifier: 'race',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your race.'
                }
              ]
            },
            major: {
              identifier: 'major',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your major.'
                }
              ]
            },
            hackathons: {
              identifier: 'hackathons',
              rules: [
                {
                  type: 'empty',
                  prompt: "Please enter how many hackathons you've attended"
                }
              ]
            },
            referrer: {
              identifier: 'referrer',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter how you heard about us.'
                }
              ]
            },
            shirtSize: {
              identifier: 'shirtSize',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your shirt size.'
                }
              ]
            },
            mlhShare: {
              identifier: 'mlhShare',
              rules: [
                {
                  type: 'checked',
                  prompt: 'Please agree to the MLH privacy policy.'
                }
              ]
            },
            coc: {
              identifier: 'coc',
              rules: [
                {
                  type: 'checked',
                  prompt: 'Please agree to the MLH Code of Conduct.'
                }
              ]
            },
            
          }
        });
      }

      $scope.onFileChange = function (file) {
        $scope.file = file;
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          $scope.$apply(function () {
            $scope.fileData = event.target.result;
          })
        });
        reader.readAsDataURL(file);
      }

      $scope.submitForm = function () {
        if ($('.ui.form').form('is valid') && ($scope.file || $scope.fileData)) {
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };
    }]);
