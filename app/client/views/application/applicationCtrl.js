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
    function($scope, $rootScope, $state, $http, currentUser, Settings, Session, UserService){

      // Set up the user
      $scope.user = currentUser.data;

      // TODO: Replace URL once server side implementation is done
      var dropzoneConfig = {
        url: '/api/resume/upload',
        previewTemplate: document.querySelector('#resume-dropzone-preview').innerHTML,
        maxFiles: 1,
        maxFilesize: 1, // MB
        uploadMultiple: false,
        acceptedFiles: 'application/pdf',
        autoProcessQueue: false,
        headers: {
          'x-access-token': Session.getToken()
        }
      };

      $scope.showResumeDropzoneIcon = true;
      $scope.resumeDropzoneErrorMessage = '';

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
      
      // Is the student from UCI?
      $scope.isUciStudent = $scope.user.email.split('@')[1] == 'uci.edu';

      // If so, default them to adult: true
      if ($scope.isUciStudent){
        $scope.user.profile.adult = true;
      }

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
      }

      function _updateUser(e){
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .success(function(data){
            $scope.resumeDropzone.processQueue();
            $scope.resumeDropzone.on('queuecomplete', function() {
              sweetAlert({
                title: "Done!",
                text: "Your application has been saved.",
                type: "success",
                confirmButtonColor: "#e76482"
              }, function(){
                $state.go('app.dashboard');
              });
            });
          })
          .error(function(res){
            sweetAlert("Uh oh!", "Something went wrong.", "error");
            $scope.submitButtonDisabled = false;
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
                  type: 'checked',
                  prompt: 'You must be an adult, or an MIT student.'
                }
              ]
            }
          }
        });
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
        $scope.submitButtonDisabled = true;
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          $scope.submitButtonDisabled = false;
        }
      };

    }]);
