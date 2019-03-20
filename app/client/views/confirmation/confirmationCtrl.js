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

      fillInBusStop();
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
        'Lactose Intolerant': false,
        'Gluten Free': false
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

      function fillInBusStop() {
        if (user.confirmation.busStop !== undefined && user.confirmation !== "") {
          return;
        }

        var email = user.email.split('@')[1];

        // Kill Willie for this later
        var USC = "USC";
        var STANFORD = "Stanford";
        var BERKELEY = "Berkeley";
        var UCSD = "UCSD";
        var UCI = "UC Irvine";
        var UCLA = "UCLA";
        var UCSB = "UCSB";

        var stops = {
          "school.edu": USC,
          "usc.edu": USC,
          "stanford.edu": STANFORD,
          "ucsc.edu": STANFORD,
          "mywvm.wvm.edu": STANFORD,
          "sjsu.edu": STANFORD,
          "student.ohlone.edu": STANFORD,
          "berkeley.edu": BERKELEY,
          "mail.ccsf.edu": BERKELEY,
          "sfsu.edu": BERKELEY,
          "usfca.edu": BERKELEY,
          "horizon.csueastbay.edu": BERKELEY,
          "acsmail.ucsd.edu": UCSD,
          "ucsd.edu": UCSD,
          "sdsu.edu": UCSD,
          "my.canyons.edu": UCSD,
          "sandiego.edu": UCSD,
          "eng.ucsd.edu": UCSD,
          "uci.edu": UCI,
          "csu.fullerton.edu": UCI,
          "sac.edu": UCI,
          "ivc.edu": UCI,
          "orangecoastcollege.edu": UCI,
          "student.csulb.edu": UCI,
          "ucla.edu": UCLA,
          "g.ucla.edu": UCLA,
          "ucsb.edu": UCSB,
          "cpp.edu": UCSB,
          "umail.ucsb.edu": UCSB
        }

        if (stops[email]) {
          $scope.user.confirmation.busStop = stops[email];
        }
      }

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
        // Custom rule for making sure a bus stop is selected if transportation is needed
        $.fn.form.settings.rules.selectBusStop = function (value, fields) {
          var needsTransportation = $('#needsTransportation')[0].checked;

          if (!needsTransportation) {
            return true;
          } else {
            if (value) {
              return true;
            } else {
              return false;
            }
          }
        }

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
            busStop: {
              identifier: 'busStop',
              rules: [
                {
                  type: 'selectBusStop',
                  prompt: 'Please select a bus stop if you are indicating transportation needs.'
                }
              ]
            }
          }
        });
      }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };

    }]);
