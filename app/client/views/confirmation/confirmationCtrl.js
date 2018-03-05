const swal = require('sweetalert');

angular.module('reg')
  .controller('ConfirmationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    'currentUser',
    'Utils',
    'UserService',
    function($scope, $rootScope, $state, currentUser, Utils, UserService){

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;

      $scope.pastConfirmation = Date.now() > user.status.confirmBy;

      $scope.formatTime = Utils.formatTime;

      _setupForm();

      $scope.fileName = user._id + "_" + user.profile.name.split(" ").join("_");

      var platforms = {
        'Mobile': false,
        'Web Dev': false,
        'Game Dev': false,
        'Hardware': false,
        'VR/AR': false,
        'ML on a Blockchain in the Cloud': false
      };

      if (user.confirmation.platforms) {
        user.confirmation.platforms.forEach(function(platform) {
            if (platform in platforms) {
                platforms[platform] = true;
            }
        });
      }

      $scope.platforms = platforms;

      // -------------------------------
      // All this just for dietary restriction checkboxes fml

      var dietaryRestrictions = {
        'Vegetarian': false,
        'Vegan': false,
        'Halal': false,
        'Kosher': false,
        'Nut Allergy': false
      };

      if (user.confirmation.dietaryRestrictions){
        user.confirmation.dietaryRestrictions.forEach(function(restriction){
          if (restriction in dietaryRestrictions){
            dietaryRestrictions[restriction] = true;
          }
        });
      }

      $scope.dietaryRestrictions = dietaryRestrictions;

      // -------------------------------

      function _updateUser(e){
        var confirmation = $scope.user.confirmation;
        // Get the dietary restrictions as an array
        var drs = [];
        Object.keys($scope.dietaryRestrictions).forEach(function(key){
          if ($scope.dietaryRestrictions[key]){
            drs.push(key);
          }
        });
        confirmation.dietaryRestrictions = drs;

        // Get the dietary restrictions as an array
        var ps = [];
        Object.keys($scope.platforms).forEach(function(key){
          if ($scope.platforms[key]){
            ps.push(key);
          }
        });
        confirmation.platforms = ps;

        UserService
          .updateConfirmation(user._id, confirmation)
          .then(response => {
            swal("Woo!", "You're confirmed!", "success").then(value => {
              $state.go("app.dashboard");
            });
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            shirt: {
              identifier: 'shirt',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please give us a shirt size!'
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
            contactName: {
              identifier: 'contactName',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your emergency contact\'s name.'
                }
              ]
            },
            contactPhone: {
              identifier: 'contactPhone',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your emergency contact\'s phone number.'
                }
              ]
            },
            contactRelationship: {
              identifier: 'contactRelationship',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your relationship with your emergency contact.'
                }
              ]
            },
            liability: {
              identifier: 'signatureLiabilityWaiver',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please type your digital signature.'
                }
              ]
            },
            photoRelease: {
              identifier: 'signaturePhotoRelease',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please type your digital signature.'
                }
              ]
            },
            signatureCodeOfConduct: {
              identifier: 'signatureCodeOfConduct',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please type your digital signature.'
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
          }
        });
      }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        }
        else {
            sweetAlert("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

    }]);
