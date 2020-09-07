const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminSponsorsCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    function($scope, $state, $stateParams, UserService){
      $scope.queryText = $stateParams.query;

      $scope.pages = [];
      $scope.sponsors = [];
      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      //$('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
      $scope.selectedUser.sections = generateSections({status: '', confirmation: {
        dietaryRestrictions: []
      }, profile: '', sponsorFields: ''});

      function updatePage(data){
        $scope.sponsors = data.users;
        $scope.currentPage = data.page;
        $scope.pageSize = data.size;

        var p = [];
        for (var i = 0; i < data.totalPages; i++){
          p.push(i);
        }
        $scope.pages = p;
      }


      UserService
        .getSponsorPage($stateParams.page, $stateParams.size, $stateParams.query)
        .then(response => {
          updatePage(response.data);
        });

      $scope.$watch('queryText', function(queryText){
        UserService
          .getSponsorPage($stateParams.page, $stateParams.size, queryText)
          .then(response => {
            updatePage(response.data);
          });
      });

      $scope.goToPage = function(page){
        $state.go('app.admin.sponsors', {
          page: page,
          size: $stateParams.size || 50
        });
      };

      $scope.goUser = function($event, sponsor){
        $event.stopPropagation();
        $state.go('app.admin.user', {
          id: sponsor._id
        });
      };

      $scope.toggleResumeAccess = function($event, user, index) {
        $event.stopPropagation();
        var name = "";
        if(typeof user.profile.name == 'undefined') {
          if(typeof user.sponsorFields.companyName == 'undefined') {
            name = user.email;
          }
          else {
            name = user.sponsorFields.companyName;
          }
        }
        else {
          name = user.profile.name;
        }

        if (user.sponsorFields.sponsorStatus == 'completedProfile'){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about give " + name + " resume access!",
            icon: "warning",
            buttons: {
              cancel: {
                text: "Cancel",
                value: null,
                visible: true
              },
              confirm: {
                text: "Yes, grant them resume access",
                className: "danger-button",
                closeModal: false,
                value: true,
                visible: true
              }
            }
          }).then(value => {
            if (!value) {
              return;
            }

            UserService
              .grantResumeAccess(user._id)
              .then(response => {
                $scope.sponsors[index] = response.data;
                swal("Success!", "Gave " + name + ' resume access.', "success");
              });
            }
          );
        } else {
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about remove " + name + "'s resume access!",
            icon: "warning",
            buttons: {
              cancel: {
                text: "Cancel",
                value: null,
                visible: true
              },
              confirm: {
                text: "Yes, remove their resume access",
                className: "danger-button",
                closeModal: false,
                value: true,
                visible: true
              }
            }
          }).then(value => {
            if (!value) {
              return;
            }
            UserService
              .removeResumeAccess(user._id)
              .then(response => {
                $scope.sponsors[index] = response.data;
                swal("Success!", "Removed " + name + "'s resume access.", "success");
              });
            }
          );
        }
      };

      // Creates a new sponsor based on an email from a text field
      $scope.createSponsor = function(){
        UserService.newSponsor($scope.email)
        .then(response => {
                ($scope.sponsors).push(response.data);
                UserService
                .getSponsorPage($stateParams.page, $stateParams.size, $stateParams.query)
                .then(response => {
                  updatePage(response.data);
                });
                swal("Success", $scope.email + ' has been made a sponsor.', "success");
         });;
      };

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      function selectUser(user){
        $scope.selectedUser = user;
        $scope.selectedUser.sections = generateSections(user);
        $('.long.user.modal')
          .modal('show');
      }

      function generateSections(user){
        console.log(user)
        return [
          {
            name: 'Basic Info',
            fields: [
              {
                name: 'Created On',
                value: formatTime(user.timestamp)
              },{
                name: 'Last Updated',
                value: formatTime(user.lastUpdated)
              },{
                name: 'Email',
                value: user.email
              }
            ]
          },{
            name: 'Company Profile',
            fields: [
              {
                name: 'Company Name',
                value: user.sponsorFields.companyName
              },{
                name: 'Representative Name',
                value: user.sponsorFields.representativeFirstName + " " + user.sponsorFields.representativeLastName
              },{
                name: 'Representative Email',
                value: user.sponsorFields.representativeEmail
              },{
                name: 'Sponsorship Tier',
                value: user.sponsorFields.tier
              },{
                name: 'Include Workshop',
                value: user.sponsorFields.workshop
              },{
                name: 'Opening Statement Time',
                value: user.sponsorFields.openingStatementTime
              },{
                name: 'Closing Remarks Time',
                value: user.sponsorFields.closingStatementTime
              },{
                name: 'Estimated Cost',
                value: user.sponsorFields.estimatedCost
              },{
                name: 'Already Paid',
                value: user.sponsorFields.paid
              },{
                name: 'Other Notes',
                value: user.sponsorFields.otherNotes
              }
            ]
          }
        ];
      }

      $scope.selectUser = selectUser;

    }]);
