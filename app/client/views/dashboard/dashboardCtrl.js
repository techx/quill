const angular = require('angular');
const showdown = require('showdown');
const swal = require('sweetalert');

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
      $scope.uscApplicant = $scope.user.email.split('@')[1] === 'usc.edu';
      $scope.timeClose = Utils.formatTime(Settings.timeClose);
      $scope.timeCloseUSC = Utils.formatTime(Settings.timeCloseUSC);
      $scope.timeConfirm = Utils.formatTime(Settings.timeConfirm);

      $scope.DASHBOARD = DASHBOARD;

      for (var msg in $scope.DASHBOARD) {
        if ($scope.DASHBOARD[msg].includes('[APP_DEADLINE]')) {
          $scope.DASHBOARD[msg] = $scope.DASHBOARD[msg].replace('[APP_DEADLINE]', Utils.formatTime($scope.uscApplicant ? Settings.timeCloseUSC : Settings.timeClose));
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
            return regIsOpen && user.verified && !user.status.submitted;
          case 'openAndSubmitted': // reviewing, can make team
            return regIsOpen && user.status.submitted && !user.status.admitted && !user.status.rejected && !user.status.waitlisted;
          case 'closedAndIncomplete':
            return !regIsOpen && !user.status.submitted && !user.status.admitted && !user.status.rejected && !user.status.waitlisted;
          case 'closedAndSubmitted': // reviewing, cannot make team
            return !regIsOpen && user.status.submitted && !user.status.admitted && !user.status.rejected && !user.status.waitlisted;
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
          case 'rejected':
            return user.status.rejected;
          case 'waitlisted':
            return user.status.waitlisted;
          case 'confirmed':
            return user.status.admitted && user.status.confirmed && !user.status.declined;
          case 'declined':
            return user.status.declined;
        }
        return false;
      };

      $scope.showWaitlist = user.status.waitlisted;

      $scope.showRejected = user.status.rejected;

      $scope.resendEmail = function(){
        AuthService
          .resendVerificationEmail()
          .then(response => {
            swal("Your email has been sent.");
          });
      };


      // -----------------------------------------------------
      // Text!
      // -----------------------------------------------------
      var converter = new showdown.Converter();
      $scope.acceptanceText = $sce.trustAsHtml(converter.makeHtml(Settings.acceptanceText));
      $scope.rejectionText = $sce.trustAsHtml(converter.makeHtml(Settings.rejectionText));
      $scope.waitlistedText = $sce.trustAsHtml(converter.makeHtml(Settings.waitlistText));
      $scope.confirmationText = $sce.trustAsHtml(converter.makeHtml(Settings.confirmationText));

      $scope.declineAdmission = function(){
          swal({
            title: "Whoa!",
            text: "Are you sure you would like to decline your admission? \n\n You can't go back!",
            icon: "warning",
            buttons: {
              cancel: {
                text: "Cancel",
                value: null,
                visible: true
              },
              confirm: {
                text: "Yes, I can't make it",
                value: true,
                visible: true,
                className: "danger-button"
              }
            }
          }).then(value => {
            if (!value) {
              return;
            }

            UserService
              .declineAdmission(user._id)
              .then(response => {
                $rootScope.currentUser = response.data;
                $scope.user = response.data;
              });
          });
      };

        // -----------------------------------------------------
        // Transportation
        // -----------------------------------------------------
        $scope.showTransportation = true;
        $scope.transportation = null;

        populateTransportation();

        function populateTransportation() {
            var transportationInformation = {
                "USC": {
                    school: "University of Southern California",
                    location: "W Jefferson Blvd & Trousdale Pkwy, Los Angeles, CA 90007",
                    time: "5:00 PM - 7:30 PM",
                    coordinators: [{
                        email: "hsiaotuh@usc.edu",
                        name: "Daniel Ho"
                    },{
                        email: "lianwang@usc.edu",
                        name: "Jane Wang"
                    }]
                },
                "Stanford": {
                    school: "Stanford University",
                    location: "473 Via Ortega Dr, Stanford, CA 94305",
                    time: "9:30 AM",
                    coordinators: [{
                        email: "jsutaria@stanford.edu",
                        name: "Jainil Sutaria"
                    }]
                },
                "Berkeley": {
                    school: "UC Berkeley",
                    location: "Springer Gateway, Berkeley, CA 94720",
                    time: "7:30 AM",
                    coordinators: [{
                        email: "jenzou@berkeley.edu",
                        name: "Jennifer Zou"
                    },{
                        email: "sejalmohata@berkeley.edu",
                        name: "Sejal Mohata"
                    }]
                },
                "UCSD": {
                    school: "UC San Diego",
                    location: "Lot P602, San Diego, CA 92161",
                    time: "1:30 PM",
                    coordinators: [{
                        email: "stl005@ucsd.edu",
                        name: "Stanley Lee"
                    },{
                        email: "j7yang@ucsd.edu",
                        name: "Jane Yang"
                    }]
                },
                "UC Irvine": {
                    school: "UC Irvine",
                    location: "Office of Admissions and Relations with Schools, University of California Irvine, 260 Aldrich Hall, Irvine, CA 9269",
                    time: "2:30 PM",
                    coordinators: [{
                        email: "crystc6@uci.edu",
                        name: "Crystal Cheung"
                    },{
                        email: "rjmirand@uci.edu",
                        name: "Ryan Miranda"
                    },{
                        email: "lilyp3@uci.edu",
                        name: "Lily Pham"
                    },{
                        email: "sjng1@uci.edu",
                        name: "Steve Ng"
                    }]
                },
                "UCLA": {
                    school: "UCLA",
                    location: "1 Charles E Young Dr N, Los Angeles, CA 90024",
                    time: "3:00 PM",
                    coordinators: [{
                        email: "kylewong@g.ucla.edu",
                        name: "Kyle Wong"
                    }]
                },
                "UCSB": {
                    school: "UC Santa Barbara",
                    location: "Lot 29, Isla Vista, CA 93117",
                    time: "2:30 PM",
                    coordinators: [{
                        email: "jennifernlai@ucsb.edu",
                        name: "Jennifer Lai"
                    }],
                    note: "Unfortunately, we are unable to provide bus transportation for UCSB. We're sorry about any inconveniences this may have caused, but still hope that you can join us at HackSC!"
                },
            };

            if(user.confirmation !== undefined && user.confirmation.needsTransportation && user.confirmation.busStop !== ""){
                $scope.transportation = transportationInformation[user.confirmation.busStop];
            }else if(user.confirmation !== undefined && user.profile.school === "University of Southern California"){
                // show transportation for all USC students
                $scope.transportation = transportationInformation['USC'];
            }
        }
  }]);
