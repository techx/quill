angular.module('reg')
  .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    '$window',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, $window, currentUser, Settings, Session, UserService){

      // Set up the user
      $scope.user = currentUser.data;

      $scope.submitButtonDisabled = true;

      var dropzoneConfig = {
        url: '/api/resume/upload',
        previewTemplate: document.querySelector('#resume-dropzone-preview').innerHTML,
        maxFiles: 1,
        maxFilesize: .5, // MB
        uploadMultiple: false,
        acceptedFiles: 'application/pdf',
        autoProcessQueue: false,
        clickable: ['.resume-dropzone', '.resume-dropzone>span'],
        headers: {
          'x-access-token': Session.getToken()
        }
      };

      $scope.showResumeDropzoneIcon = true;
      $scope.resumeDropzoneErrorMessage = '';
      $scope.showResumeDropzone = false;

      $scope.resumeDropzone = new Dropzone('div#resume-upload', dropzoneConfig);

      $scope.resumeDropzone.on("error", function(file, errorMessage) {
        $scope.resumeDropzoneHasError = true;
        $scope.resumeDropzoneErrorMessage = errorMessage;
        $scope.$apply();
      });

      $scope.resumeDropzone.on("addedfile", function() {
        if ($scope.resumeDropzone.files.length > 1) {
          $scope.resumeDropzone.removeFile($scope.resumeDropzone.files[0]);
        }

        $scope.resumeDropzoneHasError = false;
        $scope.resumeDropzoneErrorMessage = '';
        $scope.showResumeDropzoneIcon = !!!$scope.resumeDropzone.files.length;
        $scope.submitButtonDisabled = false;
        $scope.$apply();
      })

      $scope.resumeDropzone.on("removedfile", function() {
        $scope.resumeDropzoneHasError = false;
        $scope.resumeDropzoneErrorMessage = '';
        $scope.showResumeDropzoneIcon = !!!$scope.resumeDropzone.files.length;
        $scope.$apply();
      })

      $scope.resumeDropzone.on("processing", function() {
        $scope.resumeDropzoneIsUploading = true;
      })

      $scope.toggleResumeDropzone = function() {
        $scope.showResumeDropzone = !$scope.showResumeDropzone;
      }
      
      // Is the student from UCI?
      $scope.isUciStudent = $scope.user.email.split('@')[1] == 'uci.edu';

      // If so, default them to adult: true
      if ($scope.isUciStudent){
        $scope.user.profile.adult = true;
      }

      $scope.$watch('user', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.submitButtonDisabled = false;
        }
      }, true);

      // Populate the school dropdown
      populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > Settings.data.timeClose;

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

      function _successModal() {
        sweetAlert({
          title: "Done!",
          text: "Your application has been saved.",
          type: "success",
          showConfirmButton: false,
          timer: 1500
        }, function() {
          swal.close();
          $state.go('app.dashboard');
        });
      }

      function _updateUser(e){
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .success(function(data){
            if ($scope.resumeDropzone.files.length) {
              $scope.resumeDropzone.processQueue();
              $scope.resumeDropzone.on('queuecomplete', _successModal);
            } else {
              _successModal();
            }
          })
          .error(function(res) {
            sweetAlert("Uh oh!", "Something went wrong.", "error");
            $scope.submitButtonDisabled = false;
          });
      }

      function isMinor() {
        return !$scope.user.profile.adult;
      }

      function minorsAreAllowed() {
        return Settings.data.allowMinors;
      }

      function minorsValidation() {
        // Are minors allowed to register?
        if (isMinor() && !minorsAreAllowed()) {
          return false;
        }
        return true;
      }

      function _setupForm(){
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
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
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
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
                  prompt: 'Please type your resonse here.'
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
                  type: 'allowMinors',
                  prompt: 'You must be an adult.'
                }
              ]
            }
          }
        });
      }

      $scope.openResume = function() {
        var id = Session.getUserId();
        var resumeWindow = $window.open('', '_blank');
        $http
          .get('/api/resume/' + id)
          .then(function(response) {
            resumeWindow.location.href = '/api/resume/view/' + response.data.token;
          })
      }

      $scope.activateCharCount = false

      /* Watching for character changes to trigger error only 
       if the user has reach a 100 characters at least once */
      $scope.$watch(
        "user.profile.essay.length",
        function (newValue, oldValue){
          if (!$scope.activateCharCount && newValue >= 100)
            $scope.activateCharCount = true
        }
      );

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          $scope.submitButtonDisabled = true;
          _updateUser();
        }
        else{
          sweetAlert("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

    }]);
