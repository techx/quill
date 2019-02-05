angular.module('reg')
  .controller('AdminUsersCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    function($scope, $state, $stateParams, UserService){

      $scope.pages = [];
      $scope.users = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
      $scope.selectedUser.sections = generateSections({status: '', confirmation: {
        dietaryRestrictions: []
      }, profile: ''});

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
        .getPage($stateParams.page, $stateParams.size, $stateParams.query, $scope.statusFilters)
        .success(function(data){
          updatePage(data);
        });

      $scope.$watch('queryText', function(queryText){
        UserService
          .getPage($stateParams.page, $stateParams.size, queryText, $scope.statusFilters)
          .success(function(data){
            updatePage(data);
          });
      });

      $scope.applyStatusFilter = function () {
        UserService
          .getPage($stateParams.page, $stateParams.size, $scope.queryText, $scope.statusFilters)
          .success(function (data) {
            updatePage(data);
          });
      };

      $scope.goToPage = function(page){
        $state.go('app.admin.users', {
          page: page,
          size: $stateParams.size || 50
        });
      };

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $state.go('app.admin.user', {
          id: user._id
        });
      };

      $scope.toggleCheckIn = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.checkedIn){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to check in " + user.profile.name + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, check them in.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .checkIn(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Accepted", user.profile.name + ' has been checked in.', "success");
                });
            }
          );
        } else {
          UserService
            .checkOut(user._id)
            .success(function(user){
              $scope.users[index] = user;
              swal("Accepted", user.profile.name + ' has been checked out.', "success");
            });
        }
      };

      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "Whoa, wait a minute!",
          text: "You are about to accept " + user.profile.name + "!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, accept them.",
          closeOnConfirm: false
          }, function(){

            swal({
              title: "Are you sure?",
              text: "Your account will be logged as having accepted this user. " +
                "Remember, this power is a privilege.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, accept this user.",
              closeOnConfirm: false
              }, function(){

                UserService
                  .admitUser(user._id)
                  .success(function(user){
                    $scope.users[index] = user;
                    swal("Accepted", user.profile.name + ' has been admitted.', "success");
                  });

              });

          });

      };

      $scope.acceptCompleted = function(){
        UserService.countCompleted().success((data) => {
          swal({
          title: "Whoa, wait a minute!",
          text: "You are about to accept " + data + " users!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yeah, do it.",
          closeOnConfirm: false
        }, () => {
          UserService
            .acceptAll()
            .success(() => {
              swal("Updated!", "Accepted everyone", "success");
            })
            .error(() => {
              return swal("Oops", "Something went wrong.\nIs there anyone to accept? ", "error");
            });
        });
        }).error( () => {
          return swal("Oops", "Something went wrong.\nIs there anyone to accept? ", "error");
        });
      };

      $scope.acceptChecked = function(){
        // Tracking info for mass admit
        var numToAccept = 0;

        // Stupid error handling
        for (let i = 0; i < $scope.users.length; i++){
          if($scope.users[i].markedForAcceptance) {
            numToAccept += 1;
          }
        }
        if (numToAccept == 0){
          swal("Oops", "No one was checked", "info");
          return;
        }

        // Stupid check pt. 2
        swal({
          title: "Whoa, wait a minute!",
          text: "You are about to accept " + numToAccept + " users!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yeah, do it.",
          closeOnConfirm: false
        }, function() {
          for (let i = 0; i < $scope.users.length; i++){
            const user = $scope.users[i];
            if(user.markedForAcceptance){
              // I just log or err the callbacks but I should like count
              // them up and show a sweet alert or something later
              UserService
                .admitUser(user._id)
                .success(function(user){
                  // Update them on the page
                  $scope.users[i] = user;
                  $scope.$apply();
                })
                .error(function(user){
                  console.error("Couldn't admit " + user.profile.name + " (" + user.email + ")");
                });

              // Uncheck them
              user.markedForAcceptance = false;
            }
          }
          // Just say its accepted, Promises are hard rn...
          swal("Accepted", 'All marked users have been accepted', "success");
        });
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
                name: 'Resume',
                value: user.confirmation.resume
              },{
                name: 'Needs Hardware',
                value: user.confirmation.wantsHardware,
                type: 'boolean'
              },{
                name: 'Hardware Requested',
                value: user.confirmation.hardware
              },{
                name: 'Additional Notes',
                value: user.confirmation.notes
              }
            ]
          }
          // {
          //   name: 'Hosting',
          //   fields: [
          //     {
          //       name: 'Needs Hosting Friday',
          //       value: user.confirmation.hostNeededFri,
          //       type: 'boolean'
          //     },{
          //       name: 'Needs Hosting Saturday',
          //       value: user.confirmation.hostNeededSat,
          //       type: 'boolean'
          //     },{
          //       name: 'Gender Neutral',
          //       value: user.confirmation.genderNeutral,
          //       type: 'boolean'
          //     },{
          //       name: 'Cat Friendly',
          //       value: user.confirmation.catFriendly,
          //       type: 'boolean'
          //     },{
          //       name: 'Smoking Friendly',
          //       value: user.confirmation.smokingFriendly,
          //       type: 'boolean'
          //     },{
          //       name: 'Hosting Notes',
          //       value: user.confirmation.hostNotes
          //     }
          //   ]
          // },{
          //   name: 'Travel',
          //   fields: [
          //     {
          //       name: 'Needs Reimbursement',
          //       value: user.confirmation.needsReimbursement,
          //       type: 'boolean'
          //     },{
          //       name: 'Received Reimbursement',
          //       value: user.confirmation.needsReimbursement && user.status.reimbursementGiven
          //     },{
          //       name: 'Address',
          //       value: user.confirmation.address ? [
          //         user.confirmation.address.line1,
          //         user.confirmation.address.line2,
          //         user.confirmation.address.city,
          //         ',',
          //         user.confirmation.address.state,
          //         user.confirmation.address.zip,
          //         ',',
          //         user.confirmation.address.country,
          //       ].join(' ') : ''
          //     }
          //   ]
          // }
        ];
      }

      $scope.selectUser = selectUser;

    }]);