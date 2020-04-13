const moment = require('moment');
const swal = require('sweetalert');
const pdfjsLib = require('pdfjs-dist');

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

angular.module('reg')
  .controller('ResumesCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    function ($scope, $state, $stateParams, UserService) {

      $scope.pages = [];
      $scope.users = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
      $scope.selectedUser.sections = generateSections({
        status: '',
        confirmation: {
          dietaryRestrictions: []
        },
        profile: ''
      });

      function updatePage(data) {
        $scope.users = data.users;
        $scope.currentPage = data.page;
        $scope.pageSize = data.size;

        var p = [];
        for (var i = 0; i < data.totalPages; i++) {
          p.push(i);
        }
        $scope.pages = p;
      }

      UserService
        .getPage($stateParams.page, $stateParams.size, $stateParams.query)
        .then(response => {
          updatePage(response.data);
        });

      $scope.$watch('queryText', function (queryText) {
        UserService
          .getPage($stateParams.page, $stateParams.size, queryText)
          .then(response => {
            updatePage(response.data);
          });
      });

      $scope.goToPage = function (page) {
        UserService
        .getPage(page, $stateParams.size || 50, $stateParams.query)
        .then(response => {
          updatePage(response.data);
        });
      };

      function formatTime(time) {
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      function getResume(user) {
        if (user._id) {
          UserService
            .getResume(user._id)
            .then(pdfPath => {
              // Asynchronous download of PDF
              var loadingTask = pdfjsLib.getDocument(pdfPath.data.Body);
              loadingTask.promise.then(function (pdf) {
                console.log('PDF loaded');

                // Fetch the first page
                var pageNumber = 1;
                pdf.getPage(pageNumber).then(function (page) {
                  console.log('Page loaded');

                  var scale = 1.0;
                  var viewport = page.getViewport({
                    scale: scale
                  });

                  // Prepare canvas using PDF page dimensions
                  var canvas = document.getElementById('resume-canvas');
                  var context = canvas.getContext('2d');
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;

                  // Render PDF page into canvas context
                  var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                  };
                  var renderTask = page.render(renderContext);
                  renderTask.promise.then(function () {
                    console.log('Page rendered');
                  });
                });
              }, function (reason) {
                // PDF loading error
                console.error(reason);
              });
            });
        }
      }

      $scope.rowClass = function (user) {
        if (user.admin) {
          return 'admin';
        }
        if (user.status.confirmed) {
          return 'positive';
        }
        if (user.status.admitted && !user.status.confirmed) {
          return 'warning';
        }
      };

      function selectUser(user) {
        $scope.selectedUser = user;
        $scope.selectedUser.sections = generateSections(user);
        getResume(user);
        $('.long.user.modal')
          .modal('show');
      }

      function generateSections(user) {
        return [{
          name: 'Basic Info',
          fields: [{
            name: 'Created On',
            value: formatTime(user.timestamp)
          }, {
            name: 'Last Updated',
            value: formatTime(user.lastUpdated)
          }, {
            name: 'Confirm By',
            value: formatTime(user.status.confirmBy) || 'N/A'
          }, {
            name: 'Checked In',
            value: formatTime(user.status.checkInTime) || 'N/A'
          }, {
            name: 'Email',
            value: user.email
          }, {
            name: 'Team',
            value: user.teamCode || 'None'
          }]
        }, {
          name: 'Profile',
          fields: [{
            name: 'Name',
            value: user.profile.name
          }, {
            name: 'Gender',
            value: user.profile.gender
          }, {
            name: 'School',
            value: user.profile.school
          }, {
            name: 'Graduation Year',
            value: user.profile.graduationYear
          }, {
            name: 'Description',
            value: user.profile.description
          }, {
            name: 'Essay',
            value: user.profile.essay
          }]
        }, {
          name: 'Confirmation',
          fields: [{
            name: 'Phone Number',
            value: user.confirmation.phoneNumber
          }, {
            name: 'Dietary Restrictions',
            value: user.confirmation.dietaryRestrictions.join(', ')
          }, {
            name: 'Shirt Size',
            value: user.confirmation.shirtSize
          }, {
            name: 'Major',
            value: user.confirmation.major
          }, {
            name: 'Github',
            value: user.confirmation.github
          }, {
            name: 'Website',
            value: user.confirmation.website
          }, {
            name: 'Needs Hardware',
            value: user.confirmation.wantsHardware,
            type: 'boolean'
          }, {
            name: 'Hardware Requested',
            value: user.confirmation.hardware
          }]
        }, {
          name: 'Hosting',
          fields: [{
            name: 'Needs Hosting Friday',
            value: user.confirmation.hostNeededFri,
            type: 'boolean'
          }, {
            name: 'Needs Hosting Saturday',
            value: user.confirmation.hostNeededSat,
            type: 'boolean'
          }, {
            name: 'Gender Neutral',
            value: user.confirmation.genderNeutral,
            type: 'boolean'
          }, {
            name: 'Cat Friendly',
            value: user.confirmation.catFriendly,
            type: 'boolean'
          }, {
            name: 'Smoking Friendly',
            value: user.confirmation.smokingFriendly,
            type: 'boolean'
          }, {
            name: 'Hosting Notes',
            value: user.confirmation.hostNotes
          }]
        }, {
          name: 'Travel',
          fields: [{
            name: 'Needs Reimbursement',
            value: user.confirmation.needsReimbursement,
            type: 'boolean'
          }, {
            name: 'Received Reimbursement',
            value: user.confirmation.needsReimbursement && user.status.reimbursementGiven
          }, {
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
          }, {
            name: 'Additional Notes',
            value: user.confirmation.notes
          }]
        }];
      }

      $scope.selectUser = selectUser;

    }
  ]);