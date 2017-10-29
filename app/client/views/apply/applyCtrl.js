angular.module('reg')
  .controller('ApplyCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'settings',
    'Session',
    'UserService',
    'AuthService',
    function($scope, $rootScope, $state, $http, Settings, Session, UserService, AuthService) {
      if (Session.getUserId()) {
        $state.go('app.application');
      }

      // TODO: Replace URL once server side implementation is done
      var resumeDropzone = new Dropzone('div#resume-upload', { url: '/file/post'});
      
      // Initialize user object and its nested objects
      $scope.user = {
        email: '',
        password: '',
        profile: {
          name: '',
          gender: '',
          school: '',
          major: '',
          graduationYear: '',
          description: '',
          essay: '',
          adult: false
        },
      };

      $scope.$watch(
        "user.email",
        function() {
          if ($scope.user.email && $scope.user.email.includes('@')) {
            var domain = $scope.user.email.split('@')[1];

            // Is the student from UCI?
            $scope.isUciStudent = domain === 'uci.edu';
            // If so, default them to adult: true
            if ($scope.isUciStudent) {
              $scope.user.profile.adult = true;
            }

            if ($scope.schools[domain]) {
              $scope.user.profile.school = $scope.schools[domain].school;
              $scope.autoFilledSchool = true;
            } else {
              $scope.user.profile.school = '';
              $scope.autoFilledSchool = false;
            }
          }
        }
      );

      // Populate the school dropdown
      populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > Settings.data.timeClose;

      /**
       * TODO: JANK WARNING
       */
      function populateSchools() {
        $http
          .get('/assets/schools.json')
          .then(function(res) {
            $scope.schools = res.data;
          });
      }

      function _apply(e){
        AuthService.register($scope.user.email, $scope.user.password, function success(data) {
          UserService
            .updateProfile(Session.getUserId(), $scope.user.profile)
            .success(function(data){
              sweetAlert({
                title: "Awesome!",
                text: "Your application has been saved.",
                type: "success",
                confirmButtonColor: "#e76482"
              }, function(){
                $state.go('app.dashboard');
              });
            })
            .error(function(err){
              sweetAlert("Uh oh!", "Something went wrong.", "error");
            });
        }, function error(err) {
          if (err.message === 'An account for this email already exists.') {
            sweetAlert('Oops', 'Looks like an account for this email already exists. Please log in to edit your application.', 'error');
          } else {
            sweetAlert("Uh oh!", "Something went wrong.", "error");
          }
        });
      }

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
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
            email: {
              identifier: 'email',
              rules: [
                {
                  type: 'email',
                  prompt: 'Please enter your email.'
                }
              ]
            },
            password: {
              identifier: 'password',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a password.'
                },
                {
                  type: 'match[confirmPassword]',
                  prompt: 'Your passwords do not match.'
                }
              ]
            },
            confirmPassword: {
              identifier: 'confirmPassword',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your password.'
                },
                {
                  type: 'match[password]',
                  prompt: 'Your passwords do not match.'
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
            major: {
              identifier: 'major',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your major.'
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
            essay: {
              identifier: 'essay',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please type your response here.'
                },
                {
                  type: 'minLength[100]',
                  prompt: 'Your response must be at least 100 characters.'
                },
                {
                  type: 'maxLength[1500]',
                  prompt: 'Your response must be at most 1500 characters.'
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
            adult: {
              identifier: 'adult',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must be an adult, or an UCI student.'
                }
              ]
            }
          }
        });
      }

      $scope.activateCharCount = false;

      /* Watching for character changes to trigger error only 
       if the user has reach a 100 characters at least once */
      $scope.$watch(
        "user.profile.essay.length",
        function (length){
          // Initialize word counter
          if (!length) {
            $scope.user.profile.essay = '';
          }

          if (!$scope.activateCharCount && length >= 100)
            $scope.activateCharCount = true
        }
      );

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _apply();
        }
      };

    }]);
