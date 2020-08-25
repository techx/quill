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
    'SPONSORSHIP_COST',
    function ($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService, SPONSORSHIP_COST) {

      // Set up the user
      $scope.user = currentUser.data;
      $scope.SPONSORSHIP_COST = SPONSORSHIP_COST;
      $scope.isTitle = $scope.user.sponsorFields.tier === "title";
      $scope.isGiga = $scope.user.sponsorFields.tier === "giga";
      $scope.estimatedCost = 0;



      // Cost for timed events, i.e. opening/closing remarks
      var timedCost = 0;
      // Flat costs, i.e. workshops/tiers
      var flatCosts = 0;

      var totalCost = timedCost + flatCosts;

      // Watch for changes in tier/workshop/times, as they effect the cost
      $scope.$watchGroup([
        'user.sponsorFields.tier',
        'user.sponsorFields.workshop',
      ],
      function(newValue, oldValue, scope) {
        console.log($scope.user);
        var isTitle = $scope.user.sponsorFields.tier === "title";
        var isGiga = $scope.user.sponsorFields.tier === "giga";

        flatCosts = 0;

        var newTier = newValue[0], newWorkshopValue = newValue[1];
        // Compute tier cost
        var tierCost = newTier ? $scope.SPONSORSHIP_COST[newTier.toUpperCase()] : 0;
        flatCosts += tierCost;

        // If not title sponsor, charge for workshops
        if(!isTitle) {
          if(newWorkshopValue) {
            flatCosts += SPONSORSHIP_COST['WORKSHOP'];
          }
        }

        if(isGiga) {
          $scope.user.sponsorFields.openingStatementTime = "60";
          $scope.user.sponsorFields.closingStatementTime = "  ";
        }
        else if(isTitle) {
          $scope.user.sponsorFields.openingStatementTime = "120";
          $scope.user.sponsorFields.closingStatementTime = "60";
        }
        else {
          $scope.user.sponsorFields.openingStatementTime = "";
          $scope.user.sponsorFields.closingStatementTime = "";
        }

        totalCost = timedCost + flatCosts;
        $scope.isTitle = isTitle;
        $scope.isGiga = isGiga;
        $scope.estimatedCost = totalCost;
      });

      // Monitor opening/closing remarks
      $scope.$watchGroup([
        'user.sponsorFields.openingStatementTime',
        'user.sponsorFields.closingStatementTime',
      ],
      function(newValue, oldValue, scope) {
        var isTitle = $scope.user.sponsorFields.tier === "title";
        var isGiga = $scope.user.sponsorFields.tier === "giga";

        timedCosts = 0;

        var newOpeningTime = newValue[0], newClosingTime = newValue[1];

        if(isGiga) {
          timedCost = (Number(newClosingTime) / SPONSORSHIP_COST['TIMED_RATE']) * SPONSORSHIP_COST['TIMED_COST'];
        }
        else if(isTitle) {
          // Do nothing, costs already factored in
        }
        else {
          timedCost = ((Number(newOpeningTime) + Number(newClosingTime)) / SPONSORSHIP_COST['TIMED_RATE']) * SPONSORSHIP_COST['TIMED_COST'];
        }

        totalCost = timedCost + flatCosts;
        $scope.estimatedCost = totalCost;
      });

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

      function _setupForm() {
        // Semantic-UI form validation
        // $('.ui.form').form({
        //   inline: true,
        //   fields: {
        //     companyName: {
        //       identifier: 'companyName',
        //       rules: [
        //         {
        //           type: 'empty',
        //           prompt: 'Please enter a company name.'
        //         }
        //       ]
        //     },
        //     PlegeAmount: {
        //       identifier: 'PlegeAmount',
        //       rules: [
        //         {
        //           type: 'empty',
        //           prompt: 'Please enter an amount.'
        //         }
        //       ]
        //     },
        //     RelevantLinks: {
        //       identifier: 'RelevantLinks',
        //       rules: [
        //         {
        //           type: 'empty',
        //           prompt: 'Please list some relevant links for your hackathon idea.'
        //         }
        //       ]
        //     }
        //   },
        //   on: 'blur'
        // });
      }

      $scope.submitForm = function () {
        if ($('.ui.form').form('is valid')) {
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };


    }]);
