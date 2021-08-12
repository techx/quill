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

      populateCompanys();
      //setAvailableDatesToMentor();
      _setupForm();

      $scope.regIsClosed = Date.now() > settings.data.timeCloseRegistration;

      /*
          <label>Available Dates</label>
            <p>The you are about to provide is the arriving times (pay attention that in order to submit application you nee to provide at least one arriving time)</p>
            <p>Day 1</p>
            <input min="2021-12-27T08:30:00" max="2021-12-27T23:59:00" ng-model="user.profile.dayOne" type="datetime-local"/>
            <p>Day 2</p>
            <input min="2021-12-28T00:00:00" max="2021-12-28T11:00:00" ng-model="user.profile.dayTwo" type="datetime-local"/>
      


      function setAvailableDatesToMentor(){
        var availableDatesDiv = angular.getElementById("availableDates");
        var label = angular.element('<label>Available Dates</label>');
        availableDatesDiv.add(label);
        var p = angular.element('<p>The you are about to provide is the arriving times (pay attention that in order to submit application you nee to provide at least one arriving time)</p>');
        availableDatesDiv.add(p);
        var numberOfHackDay = parseInt(settings.timeCloseHackathon.split('T')[0].split('-')[2]) - parseInt(settings.timeOpenHackathon.split('T')[0].split('-')[2]);
        var openingDay = settings.timeOpenHackathon;


        for (i = 0; i < numberOfHackDay; i++){
          var dayP = angular.element('<p>Day '+ i + 1 +'</p>');
          availableDatesDiv.add(dayP);
          var openingDate = new Date(openingDay);
          var currentDay = new Date(openingDate);
          currentDay.setDate(myDate.getDate() + i);
          var input = angular.element('<input min=' + '"'+ currentDay +'"' + ' max=' + '"'+ currentDay +'"' + ' ng-model="user.profile.day' + i + '" type="datetime-local"/>');
          availableDatesDiv.add(input);
        }
      }
      */

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