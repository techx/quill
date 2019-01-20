angular.module('reg')
  .controller('DashboardCtrl', [
    '$rootScope',
    '$scope',
    '$sce',
    'currentUser',
    'settings',
    'Utils',
    'AuthService',
    'UserService',
    'EVENT_INFO',
    'DASHBOARD',
    function($rootScope, $scope, $sce, currentUser, settings, Utils, AuthService, UserService, EVENT_INFO, DASHBOARD){
      var Settings = settings.data;
      var user = currentUser.data;
      $scope.user = user;
      $scope.timeClose = Utils.formatTime(Settings.timeClose);
      $scope.timeConfirm = Utils.formatTime(user.status.confirmBy);

      $scope.DASHBOARD = DASHBOARD;

      for (var msg in $scope.DASHBOARD) {
        if ($scope.DASHBOARD[msg].includes('[APP_DEADLINE]')) {
          $scope.DASHBOARD[msg] = $scope.DASHBOARD[msg].replace('[APP_DEADLINE]', Utils.formatTime(Settings.timeClose));
        }
        if ($scope.DASHBOARD[msg].includes('[CONFIRM_DEADLINE]')) {
          $scope.DASHBOARD[msg] = $scope.DASHBOARD[msg].replace('[CONFIRM_DEADLINE]', Utils.formatTime(user.status.confirmBy));
        }
      }

      // Is registration open?
      var regIsOpen = $scope.regIsOpen = Utils.isRegOpen(Settings);

      // Is it past the user's confirmation time?
      var pastConfirmation = $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);

      $scope.dashState = function(status){
        var user = $scope.user;
        switch (status) {
          case 'unverified':
            return !user.verified;
          case 'openAndIncomplete':
            return regIsOpen && user.verified && !user.status.completedProfile;
          case 'openAndSubmitted':
            return regIsOpen && user.status.completedProfile && !user.status.admitted;
          case 'closedAndIncomplete':
            return !regIsOpen && !user.status.completedProfile && !user.status.admitted;
          case 'closedAndSubmitted': // Waitlisted State
            return !regIsOpen && user.status.completedProfile && !user.status.admitted;
          case 'admittedAndCanConfirm':
            return !pastConfirmation &&
              user.status.admitted &&
              !user.status.confirmed &&
              !user.status.declined;
          case 'admittedAndCannotConfirm':
            return pastConfirmation &&
              user.status.admitted &&
              !user.status.confirmed &&
              !user.status.declined;
          case 'confirmed':
            return user.status.admitted && user.status.confirmed && !user.status.declined;
          case 'declined':
            return user.status.declined;
        }
        return false;
      };

      $scope.showAppInReview = !regIsOpen && user.status.completedProfile && !user.status.admitted;

      if (user.confirmation.signatureLiability && user.confirmation.signatureLiability !== '') {
        $scope.hasSignedLiability = true;
      }

      $scope.resendEmail = function(){
        AuthService
          .resendVerificationEmail()
          .then(function(){
            sweetAlert('Resend Verification Email', 'Your email has been sent.', 'success');
          });
      };


      // -----------------------------------------------------
      // Text!
      // -----------------------------------------------------
      var converter = new showdown.Converter();
      $scope.acceptanceText = $sce.trustAsHtml(converter.makeHtml(Settings.acceptanceText));
      $scope.waitlistText = $sce.trustAsHtml(converter.makeHtml(Settings.waitlistText));

      if ($scope.dashState('confirmed')) {
        if ($scope.hasSignedLiability) {
          $scope.confirmationText = $sce.trustAsHtml(converter.makeHtml('Your confirmation and waiver documents have been received.<br>We look forward to seeing you at HackUCI!'));
        } else {
          $scope.confirmationText = $sce.trustAsHtml(converter.makeHtml('We have received your confirmation. Please make sure to sign both waivers when they arrive in your inbox.'));
        }
      }

      $scope.declineAdmission = function(){

        swal({
          title: "Whoa!",
          text: "Are you sure you would like to decline your admission? \n\n You can't go back!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, I can't make it.",
          closeOnConfirm: true
          }, function(){

            UserService
              .declineAdmission(user._id)
              .success(function(user){
                $rootScope.currentUser = user;
                $scope.user = user;
              });
        });
      };

    }]);
