angular.module('reg')
  .controller('CheckinCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'AuthService',
    'UserService',
    '$http',
    '$window',
    function($scope, $state, $stateParams, AuthService, UserService, $http, $window){

      $scope.pages = [];
      $scope.users = [];

      // Initialize user object and its nested objects
      $scope.newUser = {
        email: '',
        password: '',
        profile: {
          name: '',
          gender: '',
          school: '',
          major: '',
          graduationYear: '',
          adult: true
        },
      };

      $scope.$watch(
        "newUser.email",
        function() {
          if ($scope.newUser.email && $scope.newUser.email.includes('@')) {
            var domain = $scope.newUser.email.split('@')[1];

            // Is the student from UCI?
            $scope.isUciStudent = domain === 'uci.edu';

            if ($scope.schoolList[domain]) {
              $scope.newUser.profile.school = $scope.schoolList[domain].school;
              $scope.autoFilledSchool = true;
            } else {
              $scope.newUser.profile.school = '';
              $scope.autoFilledSchool = false;
            }
          }
        }
      );

      // Populate the school dropdown
      populateSchools();
      _setupForm();

      function populateSchools() {
        $http
          .get('/assets/schools.json')
          .then(function(res) {
            $scope.schoolList = res.data;
          });

        $http
          .get('/assets/schools.csv')
          .then(function(res){ 
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for(i = 0; i < $scope.schools.length; i++) {
              $scope.schools[i] = $scope.schools[i].trim(); 
              content.push({title: $scope.schools[i]})
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.newUser.profile.school = result.title.trim();
                }
              })
          });
      }

      function _setupForm(){
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
        };

        // Semantic-UI form validation
        $('#registration-modal .ui.form').form({
          fields: {
            name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your name.'
                }
              ]
            },
            email: {
              identifier: 'email',
              rules: [
                {
                  type: 'email',
                  prompt: 'Please enter your email.'
                }
              ]
            },
            password: {
              identifier: 'password',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a password.'
                },
                {
                  type: 'match[confirmPassword]',
                  prompt: 'Your passwords do not match.'
                }
              ]
            },
            confirmPassword: {
              identifier: 'confirmPassword',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your password.'
                },
                {
                  type: 'match[password]',
                  prompt: 'Your passwords do not match.'
                }
              ]
            },
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
                }
              ]
            },
            major: {
              identifier: 'major',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your major.'
                }
              ]
            },
            year: {
              identifier: 'year',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your graduation year.'
                }
              ]
            },
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a gender.'
                }
              ]
            }
          }
        });
      }

      $scope.submitForm = function() {
        if ($('#registration-modal .ui.form').form('is valid')) {
          $scope.submitButtonDisabled = true;
          _apply();
        }
      };

      function _apply(e){
        AuthService.createAccount($scope.newUser.email, $scope.newUser.password, function success(user) {
          UserService
            .updateProfile(user.id, $scope.newUser.profile)
            .success(function(data){
              UserService
                .checkIn(user.id)
                .success(function(data){
                  sweetAlert({
                    title: "Done!",
                    text: "Your account has been created and checked-in.",
                    type: "success",
                    showConfirmButton: false,
                    timer: 1500
                  }, function() {
                    swal.close();
                    $('#registration-modal').modal('hide');
                    $scope.submitButtonDisabled = false;
                  });
                });
            })
            .error(function(err){
              sweetAlert("Uh oh!", "Something went wrong.", "error");
              $scope.submitButtonDisabled = false;
            });
        }, function error(err) {
          if (err.message === 'An account for this email already exists.') {
            sweetAlert('Oops', 'Looks like an account for this email already exists. Please check-in the user from the check-in page.', 'error');
            $scope.submitButtonDisabled = false;
          } else {
            sweetAlert("Uh oh!", "Something went wrong.", "error");
            $scope.submitButtonDisabled = false;
          }
        });
      }

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

      $scope.queryText = $stateParams.query;

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
        .getPage($stateParams.page, $stateParams.size, $scope.queryText)
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
          size: $stateParams.size || 50,
          query: $scope.queryText
        });
      };

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $state.go('app.admin.user', {
          id: user._id
        });
      };

      $scope.resolveClick = function(functionKey, data) {
        $scope[functionKey](data);
      }

      $scope.openResume = function() {
        var id = $scope.selectedUser.id;
        var resumeWindow = $window.open('', '_blank');
        $http
          .get('/api/resume/' + id)
          .then(function(response) {
            resumeWindow.location.href = '/api/resume/view/' + response.data.token;
          })
      }

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
                  swal("Checked-In", user.profile.name + ' has been checked in.', "success");
                });
            }
          );
        } else {
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to check out " + user.profile.name + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, check them out.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .checkOut(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Checked-Out", user.profile.name + ' has been checked out.', "success");
                });
            }
          );
        }
      };

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      $scope.rowClass = function(user) {
        if (user.admin){
          return 'disabled';
        }
        if (user.status.checkedIn) {
          return 'positive';
        }
        if (user.status.confirmed && !user.status.checkedIn) {
          return 'warning';
        }
      };

      $scope.getStatus = function(user) {
        if (user.admin) {
          return 'Admin';
        } else if (user.status.checkedIn) {
          return 'Checked-In';
        } else if (user.status.confirmed) {
          return 'Confirmed';
        } else if (user.status.declined) {
          return 'Declined';
        } else if (user.admin) {
          return 'Admin';
        } else {
          return 'Waitlisted';
        }
      }

      $scope.openRegisterModal = function() {
        $('#registration-modal')
          .modal({
            closable: false,
            onApprove: function() {
              return false;
            }
          })
          .modal('show');
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
                name: 'First Name',
                value: user.profile.firstname
              },{
                name: 'Last Name',
                value: user.profile.lastname
              },{
                name: 'Gender',
                value: user.profile.gender
              },{
                name: 'School',
                value: user.profile.school
              },{
                name: 'Major',
                value: user.profile.major
              },{
                name: 'Graduation Year',
                value: user.profile.graduationYear
              },{
                name: 'LinkedIn',
                value: user.profile.linkedin,
                type: 'link',
                text: user.profile.linkedin
              },{
                name: 'Portfolio',
                value: user.profile.portfolio,
                type: 'link',
                text: user.profile.portfolio
              },{
                name: 'Description',
                value: user.profile.description
              },{
                name: 'Essay',
                value: user.profile.essay
              },{
                name: 'Resume',
                value: 'openResume',
                type: 'click',
                text: 'View Resume'
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