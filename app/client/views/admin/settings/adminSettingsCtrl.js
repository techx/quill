const moment = require('moment');
const showdown = require('showdown');
const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminSettingsCtrl', [
    '$scope',
    '$sce',
    'SettingsService',
    function($scope, $sce, SettingsService){

      $scope.settings = {};
      SettingsService
        .getPublicSettings()
        .then(response => {
          updateSettings(response.data);
        });

      function updateSettings(settings){
        $scope.loading = false;
         // Format the dates in settings.
        settings.timeOpen = new Date(settings.timeOpen);
        settings.timeClose = new Date(settings.timeClose);
        settings.timeCloseUSC = new Date(settings.timeCloseUSC);
        settings.timeConfirm = new Date(settings.timeConfirm);

        $scope.settings = settings;
      }

      // Additional Options --------------------------------------

      $scope.updateAllowMinors = function () {
        SettingsService
          .updateAllowMinors($scope.settings.allowMinors)
          .then(response => {
            $scope.settings.allowMinors = response.data.allowMinors;
            const successText = $scope.settings.allowMinors ?
              "Minors are now allowed to register." :
              "Minors are no longer allowed to register."
            swal("Looks good!", successText, "success");
          });
      };

        $scope.updateAdmissions = function () {
            SettingsService
                .updateAdmissions($scope.settings.admissions)
                .then(response => {
                    $scope.settings.admissions = response.data.admissions;
                    swal("Looks good!", "Admissions Updated. Now accepting" + $scope.settings.admissions + "people.", "success");
                });
        };

      // Review --------------------------------------

      SettingsService
          .getReview()
          .then(response => {
              $scope.reviewers = response.data.reviewers;
              $scope.reviewCriteria = response.data.reviewCriteria.join(", ");
          });

      $scope.updateReview = function() {
          SettingsService
              .updateReview($scope.reviewers, $scope.reviewCriteria.split(',').map(s => s.trim()))
              .then(response => {
                  $scope.settings.reviewers = response.data.reviewers;
                  $scope.settings.reviewCriteria = response.data.reviewCriteria;
                  $scope.reviewCriteria = response.data.reviewCriteria.join(', ');
                  swal('Looks Good!', 'Review Settings Updated', 'success');
              })
      };

        // Judge --------------------------------------

        SettingsService
            .getJudge()
            .then(response => {
                $scope.judges = response.data.judges;
                $scope.judgeCriteria = response.data.judgeCriteria.join(", ");
            });

        $scope.updateJudge = function() {
            SettingsService
                .updateJudge($scope.reviewers, $scope.judgeCriteria.split(',').map(s => s.trim()))
                .then(response => {
                    $scope.settings.judges = response.data.judges;
                    $scope.settings.judgeCriteria = response.data.judgeCriteria;
                    $scope.judgeCriteria = response.data.judgeCriteria.join(', ');
                    swal('Looks Good!', 'Judge Settings Updated', 'success');
                })
        };


      // Whitelist --------------------------------------

      SettingsService
        .getWhitelistedEmails()
        .then(response => {
          $scope.whitelist = response.data.join(", ");
        });

      $scope.updateWhitelist = function(){
        SettingsService
          .updateWhitelistedEmails($scope.whitelist.replace(/ /g, '').split(','))
          .then(response => {
            swal('Looks Good!', 'Whitelist Updated', 'success');
            $scope.whitelist = response.data.whitelistedEmails.join(", ");
          });
      };

      // Registration Times -----------------------------

      $scope.formatDate = function(date){
        if (!date){
          return "Invalid Date";
        }

        // Hack for timezone
        return moment(date).format('dddd, MMMM Do YYYY, h:mm a') +
          " " + date.toTimeString().split(' ')[2];
      };

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

      $scope.updateRegistrationTimes = function(){
        // Clean the dates and turn them to ms.
        var open = cleanDate($scope.settings.timeOpen).getTime();
        var closeUSC = cleanDate($scope.settings.timeCloseUSC).getTime();
        var close = cleanDate($scope.settings.timeClose).getTime();

        if (open < 0 || close < 0 || closeUSC < 0 || open === undefined || close === undefined || closeUSC === undefined){
          return swal('Oops...', 'You need to enter valid times.', 'error');
        }
        if (open >= close || open >= closeUSC){
          swal('Oops...', 'Registration cannot open after it closes.', 'error');
          return;
        }

        SettingsService
          .updateRegistrationTimes(open, close, closeUSC)
          .then(response => {
            updateSettings(response.data);
            swal("Looks good!", "Registration Times Updated", "success");
          });
      };

      // Confirmation Time -----------------------------

      $scope.updateConfirmationTime = function(){
        var confirmBy = cleanDate($scope.settings.timeConfirm).getTime();

        SettingsService
          .updateConfirmationTime(confirmBy)
          .then(response => {
            updateSettings(response.data);
            swal("Sounds good!", "Confirmation Date Updated", "success");
          });
      };

      // Acceptance / Confirmation Text ----------------

      var converter = new showdown.Converter();

      $scope.markdownPreview = function(text){
        return $sce.trustAsHtml(converter.makeHtml(text));
      };

      $scope.updateWaitlistText = function(){
        var text = $scope.settings.waitlistText;
        SettingsService
          .updateWaitlistText(text)
          .then(response => {
            swal("Looks good!", "Waitlist Text Updated", "success");
            updateSettings(response.data);
          });
      };

      $scope.updateAcceptanceText = function(){
        var text = $scope.settings.acceptanceText;
        SettingsService
          .updateAcceptanceText(text)
          .then(response => {
            swal("Looks good!", "Acceptance Text Updated", "success");
            updateSettings(response.data);
          });
      };

      $scope.updateRejectionText = function() {
          var text = $scope.settings.rejectionText;
          SettingsService
              .updateRejectionText(text)
              .then(response => {
                  swal("Looks good!", "Rejection Text Updated", "success");
                  updateSettings(response.data);
              });
      };

      $scope.updateConfirmationText = function(){
        var text = $scope.settings.confirmationText;
        SettingsService
          .updateConfirmationText(text)
          .then(response => {
            swal("Looks good!", "Confirmation Text Updated", "success");
            updateSettings(response.data);
          });
      };

    }]);
