const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminUsersCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    'APPLICATION',
    function($scope, $state, $stateParams, UserService, APPLICATION){

      $scope.pages = [];
      $scope.users = [];
      $scope.sortOptions = [{
        name: 'Default',
        value: 'timestamp',
        order: 'asc'
      },{
        name: 'Name',
        value: 'profile.name',
        order: 'asc'
      },{
        name: 'Rank',
        value: 'review.overallRating',
        order: 'desc'
      }];
      $scope.sortOption = $stateParams.sort || 'profile.name:asc';

      $scope.APPLICATION = APPLICATION;

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
      $scope.selectedUser.sections = generateSections({
        status: '',
        review: '',
        confirmation: {
            dietaryRestrictions: []
        },
        profile: ''});

      function updatePage(data){
        $scope.users = data.users;
        $scope.currentPage = data.page;
        $scope.pageSize = data.size;

        var p = [];
        for (var i = 0; i < data.totalPages; i++){
          p.push(i);
        }
        $scope.pages = p;
      }

      UserService
        .getPage($stateParams.page, $stateParams.size, $stateParams.sort, $stateParams.query)
        .then(response => {
          updatePage(response.data);
        });

      $scope.sortBy = function(sortOption){
        UserService
            .getPage($stateParams.page, $stateParams.size, sortOption, $stateParams.query)
            .then(response => {
              updatePage(response.data);
            });
      };

      $scope.$watch('queryText', function(queryText){
        UserService
          .getPage($stateParams.page, $stateParams.size, $stateParams.sort, queryText)
          .then(response => {
            updatePage(response.data);
          });
      });

      $scope.goToPage = function(page){
        $state.go('app.admin.users', {
          page: page,
          size: $stateParams.size || 50,
          sort: $scope.sortOption || $stateParams.sort,
          query: $scope.queryText || $stateParams.query
        });
      };

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $state.go('app.admin.user', {
          id: user._id
        });
      };

      $scope.setOverallRating = function($event, user, index, rating){
        var text = rating >= 100 ? 'admit' : 'reject';
        UserService
            .setOverallRating(user._id, rating)
            .then(response => {
              $scope.users[index] = response.data;
              swal('Marked for ' + text, response.data.profile.name + ' has been marked for ' + text, "success");
            });
      };

      $scope.admitUser = function($event, user, index) {
        $event.stopPropagation();

        console.log(user);

        swal({
          buttons: {
            cancel: {
              text: "Cancel",
              value: null,
              visible: true
            },
            accept: {
              className: "danger-button",
              closeModal: false,
              text: "Yes, admit them",
              value: true,
              visible: true
            }
          },
          dangerMode: true,
          icon: "warning",
          text: "You are about to accept " + user.profile.name + "!" +
              "\nYour account will be logged as having admitted this user.",
          title: "Admit?"
        }).then(value => {
          if (!value) {
            return;
          }

          UserService
              .admitUser(user._id)
              .then(response => {
                $scope.users[index] = response.data;
                swal("Admitted", response.data.profile.name + ' has been admitted.', "success");
              });
        });
      };

      $scope.rejectUser = function($event, user, index) {
        $event.stopPropagation();

        console.log(user);

        swal({
          buttons: {
            cancel: {
              text: "Cancel",
              value: null,
              visible: true
            },
            accept: {
              className: "danger-button",
              closeModal: false,
              text: "Yes, reject them",
              value: true,
              visible: true
            }
          },
          dangerMode: true,
          icon: "warning",
          text: "You are about to reject " + user.profile.name + "!" +
              "\nYour account will be logged as having rejected this user.",
          title: "Reject?"
        }).then(value => {
          if (!value) {
            return;
          }

          UserService
              .rejectUser(user._id)
              .then(response => {
                $scope.users[index] = response.data;
                swal("Rejected", response.data.profile.name + ' has been rejected.', "success");
              });
        });
      };

      $scope.waitlistUser = function($event, user, index) {
        $event.stopPropagation();

        console.log(user);

        swal({
          buttons: {
            cancel: {
              text: "Cancel",
              value: null,
              visible: true
            },
            accept: {
              className: "danger-button",
              closeModal: false,
              text: "Yes, waitlist them",
              value: true,
              visible: true
            }
          },
          dangerMode: true,
          icon: "warning",
          text: "You are about to waitlist " + user.profile.name + "!" +
              "\nYour account will be logged as having waitlisted this user.",
          title: "Waitlist?"
        }).then(value => {
          if (!value) {
            return;
          }

          UserService
              .waitlistUser(user._id)
              .then(response => {
                $scope.users[index] = response.data;
                swal("Waitlisted", response.data.profile.name + ' has been waitlisted.', "success");
              });
        });
      };

      $scope.toggleCheckIn = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.checkedIn){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to check in " + user.profile.name + "!",
            icon: "warning",
            buttons: {
              cancel: {
                text: "Cancel",
                value: null,
                visible: true
              },
              checkIn: {
                className: "danger-button",
                closeModal: false,
                text: "Yes, check them in",
                value: true,
                visible: true
              }
            }
          })
          .then(value => {
            if (!value) {
              return;
            }

            UserService
              .checkIn(user._id)
              .then(response => {
                $scope.users[index] = response.data;
                swal("Accepted", response.data.profile.name + " has been checked in.", "success");
              });
          });
        } else {
          UserService
            .checkOut(user._id)
            .then(response => {
              $scope.users[index] = response.data;
              swal("Accepted", response.data.profile.name + ' has been checked out.', "success");
            });
        }
      };

      $scope.toggleAdmin = function($event, user, index) {
        $event.stopPropagation();

        if (!user.admin){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about make " + user.profile.name + " an admin!",
            icon: "warning",
            buttons: {
              cancel: {
                text: "Cancel",
                value: null,
                visible: true
              },
              confirm: {
                text: "Yes, make them an admin",
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
              .makeAdmin(user._id)
              .then(response => {
                $scope.users[index] = response.data;
                swal("Made", response.data.profile.name + ' an admin.', "success");
              });
            }
          );
        } else {
          UserService
            .removeAdmin(user._id)
            .then(response => {
              $scope.users[index] = response.data;
              swal("Removed", response.data.profile.name + ' as admin', "success");
            });
        }
      };

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      $scope.rowClass = function(user) {
        if (user.admin){
          return 'admin';
        }
        if (user.status.confirmed) {
          return 'positive';
        }
        if (user.status.admitted && !user.status.confirmed) {
          return 'warning';
        }
      };

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
                name: 'Checked In',
                value: formatTime(user.status.checkInTime) || 'N/A'
              },{
                name: 'Email',
                value: user.email
              },{
                name: 'Team',
                value: user.teamCode || 'None'
              },{
                name: 'Transportation',
                value: user.profile.transportation,
                type: 'boolean'
              }
            ]
          },{
            name: 'Review',
            fields: [{
                name: 'Overall Rating',
                value: user.review.overallRating
              },{
                name: 'Reviewers',
                value: user.review.reviewers,
                type: 'reviewers'
              }
            ]
          },{
            name: 'Profile',
            fields: [{
                name: 'First Name',
                value: user.profile.firstName
              },{
                name: 'Last Name',
                value: user.profile.lastName
              },{
                name: 'Gender',
                value: user.profile.gender
              },{
                name: 'Ethnicity',
                value: user.profile.ethnicity
              },{
                name: 'School',
                value: user.profile.school
              },{
                name: 'Year',
                value: user.profile.year
              },{
                name: 'Major',
                value: user.profile.major
              },{
                name: 'Experience',
                value: user.profile.experience
              },{
                name: 'Resume',
                title: (user.profile.resume ? user.profile.resume.name : ''),
                value: (user.profile.resume ? user.profile.resume.link : ''),
                type: 'link'
              },{
                name: APPLICATION.ESSAY1_TITLE,
                value: user.profile.essay1
              },{
                name: APPLICATION.ESSAY2_TITLE,
                value: user.profile.essay2
              },{
                name: APPLICATION.ESSAY3_TITLE,
                value: user.profile.essay3
              },{
                name: 'Skills',
                value: user.profile.skills
              },{
                name: 'LinkedIn',
                value: user.profile.linkedin
              },{
                name: 'Github',
                value: user.profile.github
              },{
                name: 'Other',
                value: user.profile.other
              },{
                name: 'Role',
                value: (user.profile.role ?
                          ((user.profile.role.developer ? 'Developer, ' : '')
                          + (user.profile.role.designer ? 'Designer, ' : '')
                          + (user.profile.role.productManager ? 'Product Manager, ' : '')
                          + (user.profile.role.other ? user.profile.other : '')) : '')
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
          }
        ];
      }

      $scope.selectUser = selectUser;

    }]);
