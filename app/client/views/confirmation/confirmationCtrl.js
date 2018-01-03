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

      // -------------------------------
      // All this just for dietary restriction checkboxes fml

      var dietaryRestrictions = {
        'Vegetarian': false,
        'Vegan': false,
        'Halal': false,
        'Kosher': false,
        'Nut Allergy': false,
        'Other': {
          'hasOther': false,
          'description': ''
        }
      };

      if (user.confirmation.dietaryRestrictions){
        user.confirmation.dietaryRestrictions.forEach(function(restriction){
          if (restriction in dietaryRestrictions && restriction != 'Other'){
            dietaryRestrictions[restriction] = true;
          }
        });
      }
      if (user.confirmation.otherDietaryRestrictions){
          dietaryRestrictions['Other']['hasOther'] = true;
          dietaryRestrictions['Other']['description'] = user.confirmation.otherDietaryRestrictions;
      }

      $scope.dietaryRestrictions = dietaryRestrictions;
      // -------------------------------

      function _updateUser(e){
        var confirmation = $scope.user.confirmation;
        // Get the dietary restrictions as an array
        var drs = [];
        confirmation.otherDietaryRestrictions = '';

        Object.keys($scope.dietaryRestrictions).forEach(function(key){
          if (key == 'Other' && $scope.dietaryRestrictions[key]['hasOther']){
            confirmation.otherDietaryRestrictions = $scope.dietaryRestrictions[key]['description'];
          }
          if ($scope.dietaryRestrictions[key]){
            drs.push(key);
          }
        });
        confirmation.dietaryRestrictions = drs;

        UserService
          .updateConfirmation(user._id, confirmation)
          .success(function(data){
            sweetAlert({
              title: "Woo!",
              text: "You're confirmed!",
              type: "success",
              confirmButtonColor: "#e76482"
            }, function(){
              $state.go('app.dashboard');
            });
          })
          .error(function(res){
            sweetAlert("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
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
            ethnicity: {
              identifier: 'ethnicity',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select an ethnicity.'
                }
              ]
            },
            signatureLiability: {
              identifier: 'signatureLiabilityWaiver',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please type your digital signature.'
                }
              ]
            },
            agreePhotoRelease: {
              identifier: 'agreePhotoRelease',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must accept the VTHacks Media Release Statement.'
                }
              ]
            },
            agreeCodeOfConduct: {
              identifier: 'agreeCodeOfConduct',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must accept the MLH Code of Conduct'
                }
              ]
            },
            agreeTermsAndPrivacy: {
              identifier: 'agreeTermsAndPrivacy',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must accept the MLH Terms and Conditions and Privacy Policy'
                }
              ]
            },
            agreeConfirmationDate: {
              identifier: 'agreeConfirmationDate',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must acknowledge that you understand the date of the event'
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
      };

    }]);
