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
      $scope.selectedUser.sections = generateSections({status: '', confirmation: '', profile: {
        dietaryRestrictions: [],
        emergencyContact: []
      }});

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
        .getPage($stateParams.page, $stateParams.size, $stateParams.query)
        .success(function(data){
          updatePage(data);
        });

      $scope.$watch('queryText', function(queryText){
        UserService
          .getPage($stateParams.page, $stateParams.size, queryText)
          .success(function(data){
            updatePage(data);
          });
      });

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
            text: "You are about to check in " + user.profile.firstName + " " + user.profile.lastName + "!",
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
                  swal("Accepted", user.profile.firstName + ' ' + user.profile.lastName + ' has been checked in.', "success");
                });
            }
          );
        } else {
          UserService
            .checkOut(user._id)
            .success(function(user){
              $scope.users[index] = user;
              swal("Accepted", user.profile.firstName + ' ' + user.profile.lastName + ' has been checked out.', "success");
            });
        }
      };

      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "Whoa, wait a minute!",
          text: "You are about to accept " + user.profile.firstName + ' ' + user.profile.lastName + "!",
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
                    swal("Accepted", user.profile.firstName + ' ' + user.profile.lastName + ' has been admitted.', "success");
                  });

              });

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
              }
            ]
          },{
            name: 'Profile',
            fields: [
              {
                name: 'First Name',
                value: user.profile.firstName
              },{
                name: 'Last Name',
                value: user.profile.lastName
              },{
                name: 'Phone Number',
                value: user.profile.phoneNumber
              },{
                name: 'Gender',
                value: user.profile.gender
              },{
                name: 'Adult',
                value: user.profile.adult,
              },{
                name: 'Shirt Size',
                value: user.profile.shirtSize,
              }
            ]
          },{
            name: 'Emergency Contact',
            fields: [
              {
                name: 'Name',
                value: user.profile.emergencyContact.name
              }, {
                name: 'Work Number',
                value: user.profile.emergencyContact.workNumber
              }, {
                name: 'Cell Number',
                value: user.profile.emergencyContact.cellNumber
              }, {
                name: 'Relationship',
                value: user.profile.emergencyContact.relationship
              }
            ]
          },{
            name: 'School',
            fields: [
              {
                name: 'School Name',
                value: user.profile.school
              },{
                name: 'School Year',
                value: user.profile.schoolYear
              },{
                name: 'Major',
                value: user.profile.major
              },{
                name: 'Minor',
                value: user.profile.minor
              }
            ]
          },{
            name: 'Logistics',
            fields: [
              {
                name: 'Dietary Restrictions',
                value: user.profile.dietaryRestrictions.join(', ')
              },{
                name: 'Needs Reimbursement',
                value: user.profile.needsReimbursement,
                type: 'boolean'
              },{
                name: 'Reimbursement Location',
                value: user.profile.reimbursementYes,
              }
            ]
          },{
            name: 'Bitcamp',
            fields: [
              {
                name: 'Number of Hackathons',
                value: user.profile.amtHackathons,
              }, {
                name: 'Why Bitcamp',
                value: user.profile.whyBitcamp
              },{
                name: 'Build at Bitcamp',
                value: user.profile.buildBitcamp
              }
            ]
          },{
            name: 'Professional',
            fields: [
              {
                name: "Interested In",
                value: user.profile.interestedIn
              },{
                name: "Github",
                value: user.profile.github
              },{
                name: "Devpost",
                value: user.profile.devpost
              },{
                name: "Website",
                value: user.profile.website
              }
            ]
          },{
            name: 'Legal',
            fields: [
              {
                name: 'Code of Conduct',
                value: user.profile.mlhCOC,
                type: 'boolean'
              },{
                name: 'Terms and Conditions',
                value: user.profile.mlhTAC,
                type: 'boolean'
              },{
                name: 'Waiver',
                value: user.profile.bitcampWaiver,
                type: 'boolean'
              }
            ]
          },{
            name: 'Additional',
            fields: [
              {
                name: 'Anything Else',
                value: user.profile.additional
              }
            ]
          }
        ];
      }

      $scope.selectUser = selectUser;

    }]);











































