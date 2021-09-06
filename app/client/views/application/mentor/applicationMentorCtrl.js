const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
  .controller('ApplicationMentorCtrl', [
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
      $scope.user.profile.numberOfRoundUserWantToCome = $scope.user.profile.numberOfRoundUserWantToCome == undefined ? 1: $scope.user.profile.numberOfRoundUserWantToCome;
      
      function updateTimes(){
         // Format the dates in settings.
        $scope.user.profile.round1go = new Date($scope.user.profile.round1go);
        $scope.user.profile.round1come = new Date($scope.user.profile.round1come);
        $scope.user.profile.round2go = new Date($scope.user.profile.round2go);
        $scope.user.profile.round2come = new Date($scope.user.profile.round2come);
        $scope.user.profile.round3go = new Date($scope.user.profile.round3go);
        $scope.user.profile.round3come = new Date($scope.user.profile.round3come);
      }

      // Take a date and remove the seconds.
      function cleanDate(date){
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes()
        );
      }

      $scope.increaseNumbersOfDaysUserWantToCome = function(){
        if($scope.user.profile.numberOfRoundUserWantToCome == $scope.numberOfHackDay){
          swal('Sorry this is the the maximum days round days you come on');
        }
        else{
          $scope.user.profile.numberOfRoundUserWantToCome += 1;
        }
      }

      $scope.isAbleToComeToMentor = function (roundNumber) {
        return roundNumber <= $scope.user.profile.numberOfRoundUserWantToCome;
      }

      $scope.regIsClosed = Date.now() > settings.data.timeCloseRegistration;
      $scope.maxDateTimeToChose = createMinMaxValue(new Date(settings.data.timeCloseHackathon));
      $scope.minDateTimeToChose = createMinMaxValue(new Date(settings.data.timeOpenHackathon));

      populateCompanys();
      setAvailableDatesToMentor();
      setMinMaxDatesToChose()
      _setupForm();
      updateTimes();

      function setAvailableDatesToMentor(){
        $scope.numberOfHackDay = Math.round((settings.data.timeCloseHackathon - settings.data.timeOpenHackathon) / 1000 / 60 / 60 / 24);
      }

      function createMinMaxValue(date){
        var month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
        var day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
        var hours = date.getHours() > 9 ?date.getHours() : '0' + date.getHours();
        var minutes = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();

        return date.getFullYear() + '-' +
        month + '-' +
        day +
        'T' + hours
        + ':' + minutes;
      }

      function setMinMaxDatesToChose(){
        document.getElementById("r1c").setAttribute("min", $scope.minDateTimeToChose);
        document.getElementById("r1c").setAttribute("max", $scope.maxDateTimeToChose);
        document.getElementById("r1g").setAttribute("min", $scope.minDateTimeToChose);
        document.getElementById("r1g").setAttribute("max", $scope.maxDateTimeToChose);
        document.getElementById("r2c").setAttribute("min", $scope.minDateTimeToChose);
        document.getElementById("r2c").setAttribute("max", $scope.maxDateTimeToChose);
        document.getElementById("r2g").setAttribute("min", $scope.minDateTimeToChose);
        document.getElementById("r2g").setAttribute("max", $scope.maxDateTimeToChose);
        document.getElementById("r3c").setAttribute("min", $scope.minDateTimeToChose);
        document.getElementById("r3c").setAttribute("max", $scope.maxDateTimeToChose);
        document.getElementById("r3g").setAttribute("min", $scope.minDateTimeToChose);
        document.getElementById("r3g").setAttribute("max", $scope.maxDateTimeToChose);
      }

      /*
       * TODO: JANK WARNING
       */
      function populateCompanys(){
        $http
        .get('/assets/companys.json')
        .then(function(res){
            var companys = res.data;
            var email = $scope.user.email.split('@')[1];

            if (companys[email]){
              $scope.user.profile.company = companys[email].company;
              $scope.autoFilledCompany = true;
            }
          });

        $http
          .get('/assets/companys.csv')
          .then(function(res){
            $scope.companys = res.data.split('\n');
            $scope.companys.push('Other');

            var content = [];

            for(i = 0; i < $scope.companys.length; i++) {
              $scope.companys[i] = $scope.companys[i].trim();
              content.push({title: $scope.companys[i]});
            }

            $('#company.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.profile.company = result.title.trim();
                }
              });
          });
      }

      function _updateUser(e){
        if($scope.user.profile.numberOfRoundUserWantToCome >= 1){
          console.log(cleanDate($scope.user.profile.round1come).getTime());
          $scope.user.profile.round1come = cleanDate($scope.user.profile.round1come).getTime();
          $scope.user.profile.round1go = cleanDate($scope.user.profile.round1go).getTime();

          if($scope.user.profile.round1go <= $scope.user.profile.round1come){
            swal('Oops...', 'you can\'t go before you come :) (Round 1).', 'error');
            return;
          }
        }
        if($scope.user.profile.numberOfRoundUserWantToCome >= 2){
          $scope.user.profile.round2come = cleanDate($scope.user.profile.round2come).getTime();
          $scope.user.profile.round2go = cleanDate($scope.user.profile.round2go).getTime();

          if($scope.user.profile.round2go <= $scope.user.profile.round2come){
            swal('Oops...', 'you can\'t go before you come :) (Round 2).', 'error');
            return;
          }
        }
        if($scope.user.profile.numberOfRoundUserWantToCome >= 3){
          $scope.user.profile.round3come = cleanDate($scope.user.profile.round3come).getTime();
          $scope.user.profile.round3go = cleanDate($scope.user.profile.round3go).getTime();

          if($scope.user.profile.round3go <= $scope.user.profile.round3come){
            swal('Oops...', 'you can\'t go before you come :) (Round 3).', 'error');
            return;
          }
        }
        console.log($scope.user.profile);


        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .then(response => {
            swal("Awesome!", "Your application has been saved.", "success").then(value => {
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
            company: {
              identifier: 'company',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your company name.'
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
            Round1GoingMentor: {
              identifier: 'Round1GoingMentor',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a Round 1 Go.'
                }
              ]
            },
            Round1ComingMentor: {
              identifier: 'Round1ComingMentor',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a Round 1 Coming.'
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

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };
    }
  ]
);