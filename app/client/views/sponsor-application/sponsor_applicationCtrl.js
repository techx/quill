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

      var storedOpeningStatementTime = currentUser.data.sponsorFields.openingStatementTime + "";
      var storedClosingStatementTime = currentUser.data.sponsorFields.closingStatementTime + "";
      $scope.user.sponsorFields.openingStatementTime = storedOpeningStatementTime;
      $scope.user.sponsorFields.closingStatementTime = storedClosingStatementTime;
      $scope.SPONSORSHIP_COST = SPONSORSHIP_COST;
      $scope.isTitle = $scope.user.sponsorFields.tier === "title";
      $scope.isGiga = $scope.user.sponsorFields.tier === "giga";

      // Cost for timed events, i.e. opening/closing remarks
      var addOnsCost = 0;
      // Flat costs, i.e. workshops/tiers
      var tierCost = 0;

      var totalCost = addOnsCost + tierCost;

      // Watch for changes in tier/workshop/times, as they effect the cost
      $scope.$watchGroup([
        'user.sponsorFields.tier',
      ],
      function(newValue, oldValue, scope) {
        console.log($scope.user);
        var isTitle = $scope.user.sponsorFields.tier === "title";
        var isGiga = $scope.user.sponsorFields.tier === "giga";

        var newTier = newValue[0];
        // Compute tier cost
        tierCost = newTier ? $scope.SPONSORSHIP_COST[newTier.toUpperCase()] : 0;

        if(isGiga) {
          $scope.user.sponsorFields.openingStatementTime = "60";
          $scope.user.sponsorFields.closingStatementTime = storedClosingStatementTime;
        }
        else if(isTitle) {
          $scope.user.sponsorFields.openingStatementTime = "120";
          $scope.user.sponsorFields.closingStatementTime = "60";
        }
        else {
          $scope.user.sponsorFields.openingStatementTime = storedOpeningStatementTime;
          $scope.user.sponsorFields.closingStatementTime = storedClosingStatementTime;
        }

        totalCost = tierCost + addOnsCost;
        $scope.isTitle = isTitle;
        $scope.isGiga = isGiga;
        $scope.user.sponsorFields.estimatedCost = totalCost;
      });

      // Monitor add-ons
      $scope.$watchGroup([
        'user.sponsorFields.openingStatementTime',
        'user.sponsorFields.closingStatementTime',
        'user.sponsorFields.workshop',
      ],
      function(newValue, oldValue, scope) {
        var isTitle = $scope.user.sponsorFields.tier === "title";
        var isGiga = $scope.user.sponsorFields.tier === "giga";

        addOnsCost = 0;

        var newOpeningTime = newValue[0], newClosingTime = newValue[1],  newWorkshopValue = newValue[2];

        // If not title sponsor, charge for workshops
        if(!isTitle) {
          if(newWorkshopValue) {
            addOnsCost += SPONSORSHIP_COST['WORKSHOP'];
          }
        }

        // Compute rate for opening/closing remarks
        if(isGiga) {
          addOnsCost += (Number(newClosingTime) / SPONSORSHIP_COST['TIMED_RATE']) * SPONSORSHIP_COST['TIMED_COST'];
        }
        else if(isTitle) {
          // Do nothing, costs already factored in
        }
        else {
          addOnsCost += ((Number(newOpeningTime) + Number(newClosingTime)) / SPONSORSHIP_COST['TIMED_RATE']) * SPONSORSHIP_COST['TIMED_COST'];
        }

        totalCost = tierCost + addOnsCost;
        $scope.user.sponsorFields.estimatedCost = totalCost;
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

        $.fn.form.settings.rules.dollarAmount = function (inputValue) {
          return inputValue > 0;
        }

        //Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            companyName: {
              identifier: 'companyName',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a company name.'
                }
              ]
            },
            representativeEmail: {
              identifier: 'representativeEmail',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a email.'
                },
                {
                  type: 'email',
                  prompt: 'Please enter a valid email.'
                }
              ]
            },
            representativeFirstName: {
              identifier: 'representativeFirstName',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a first name.'
                }
              ]
            },
            representativeLastName: {
              identifier: 'representativeLastName',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a first name.'
                }
              ]
            },
            tier: {
              identifier: 'tier',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a valid tier.'
                }
              ]
            },
            estimatedCost: {
              identifier: 'estimatedCost',
              rules: [
                {
                  type: 'number',
                  prompt: 'Please input a valid dollar amount.'
                },
                {
                  type: 'dollarAmount',
                  prompt: 'Please input a valid dollar amount.'
                }
              ]
            }
          },
          on: 'blur'
        });
      }

      $scope.submitForm = function () {
        if ($('.ui.form').form('is valid')) {
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };


    }]);
