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
      }, profile: ''});

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

        if (user.sponsorFields.sponsorStatus == 'completedProfile'){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about make " + user.profile.name + " resume access!",
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
                swal("Gave", response.data.profile.name + ' resume access.', "success");
              });
            }
          );
        } else {
          UserService
            .removeResumeAccess(user._id)
            .then(response => {
              $scope.sponsors[index] = response.data;
              swal("Removed", response.data.profile.name + ' resume access.', "success");
            });
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
                name: 'Confirm By',
                value: formatTime(user.status.confirmBy) || 'N/A'
              },{
                name: 'Checked In',
                value: formatTime(user.status.checkInTime) || 'N/A'
              },{
                name: 'Email',
                value: user.email
              },{
                name: 'Team',
                value: user.teamCode || 'None'
              }
            ]
          },{
            name: 'Profile',
            fields: [
              {
                name: 'Name',
                value: user.profile.name
              },{
                name: 'Gender',
                value: user.profile.gender
              },{
                name: 'School',
                value: user.profile.school
              },{
                name: 'Graduation Year',
                value: user.profile.graduationYear
              },{
                name: 'Description',
                value: user.profile.description
              },{
                name: 'Essay',
                value: user.profile.essay
              }
            ]
          },{
            name: 'Confirmation',
            fields: [
              {
                name: 'Phone Number',
                value: user.confirmation.phoneNumber
              },{
                name: 'Dietary Restrictions',
                value: user.confirmation.dietaryRestrictions.join(', ')
              },{
                name: 'Shirt Size',
                value: user.confirmation.shirtSize
              },{
                name: 'Major',
                value: user.confirmation.major
              },{
                name: 'Github',
                value: user.confirmation.github
              },{
                name: 'Website',
                value: user.confirmation.website
              },{
                name: 'Needs Hardware',
                value: user.confirmation.wantsHardware,
                type: 'boolean'
              },{
                name: 'Hardware Requested',
                value: user.confirmation.hardware
              }
            ]
          },{
            name: 'Hosting',
            fields: [
              {
                name: 'Needs Hosting Friday',
                value: user.confirmation.hostNeededFri,
                type: 'boolean'
              },{
                name: 'Needs Hosting Saturday',
                value: user.confirmation.hostNeededSat,
                type: 'boolean'
              },{
                name: 'Gender Neutral',
                value: user.confirmation.genderNeutral,
                type: 'boolean'
              },{
                name: 'Cat Friendly',
                value: user.confirmation.catFriendly,
                type: 'boolean'
              },{
                name: 'Smoking Friendly',
                value: user.confirmation.smokingFriendly,
                type: 'boolean'
              },{
                name: 'Hosting Notes',
                value: user.confirmation.hostNotes
              }
            ]
          },{
            name: 'Travel',
            fields: [
              {
                name: 'Needs Reimbursement',
                value: user.confirmation.needsReimbursement,
                type: 'boolean'
              },{
                name: 'Received Reimbursement',
                value: user.confirmation.needsReimbursement && user.status.reimbursementGiven
              },{
                name: 'Address',
                value: user.confirmation.address ? [
                  user.confirmation.address.line1,
                  user.confirmation.address.line2,
                  user.confirmation.address.city,
                  ',',
                  user.confirmation.address.state,
                  user.confirmation.address.zip,
                  ',',
                  user.confirmation.address.country,
                ].join(' ') : ''
              },{
                name: 'Additional Notes',
                value: user.confirmation.notes
              }
            ]
          }
        ];
      }

      $scope.selectUser = selectUser;

    }]);
