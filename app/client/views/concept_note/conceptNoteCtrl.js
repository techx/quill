const swal = require("sweetalert");

// Theme - Restoring Public Transport Ridership
// Sub Theme - Covid-19 Recovery
//                      Cost-effective Solutions

// Theme- Achieving Sustainable Transport and Resilience
// Sub Theme - Multi-modal integration
//                       Sustainable Transport Modes

// Theme - Equity in Mobility
// Sub Theme - Gender and Safety
//                      Inclusivity and Efficiency Improvement
const S3 = require("aws-sdk/clients/s3");

angular
  .module("reg")
  .directive("fileModel", [
    "$parse",
    function ($parse) {
      return {
        restrict: "A",
        link: function (scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          element.bind("change", function () {
            scope.$apply(function () {
              modelSetter(scope, element[0].files[0]);
            });
          });
        },
      };
    },
  ])
  .controller("ConceptNoteCtrl", [
    "$scope",
    "currentUser",
    "settings",
    "$state",
    "Utils",
    "UserService",
    "$http",
    function (
      $scope,
      currentUser,
      settings,
      $state,
      Utils,
      UserService,
      $http
    ) {
      // Set up the user
      $scope.user = currentUser.data;
      var participateName = currentUser.data.profile.name;

      // $scope.pastConfirmation = Date.now() > user.status.confirmBy;
      $scope.pastConfirmation = new Date(Date.now());
      // $scope.conceptNoteStartDate = new Date(Date.now());
      $scope.conceptNoteStartDate = Utils.formatTime(
        settings.data.timeConceptNoteOpen
      );

      $scope.formatTime = Utils.formatTime;
      var themeList = {
        "Restoring Public Transport Ridership": [
          "Covid-19 Recovery",
          "Cost-effective Solutions",
        ],
        "Achieving Sustainable Transport and Resilience": [
          "Multi-modal integration",
          "Sustainable Transport Modes",
        ],
        "Equity in Mobility": [
          "Sub Gender and Safety",
          "Inclusivity and Efficiency Improvement",
        ],
      };
      
      $scope.themes = [
        "Restoring Public Transport Ridership",
        "Achieving Sustainable Transport and Resilience",
        "Equity in Mobility",
      ];
      
      $scope.subthemes = themeList;
      var docfiles = [];
      // console.log($scope.user);
      // $scope.submitForm = function () {
      //   UserService.updateTheme($scope.user._id, $scope.user.theme, $scope.user.subtheme).then(
      //     (response) => {
      //       swal("Theme Saved").then((value) => {
      //         $state.go("app.note");
      //       });
      //     },
      //     (response) => {
      //       swal("Uh oh!", "Something went wrong.", "error");
      //     }
      //   );
      // };

      $scope.onFileChange = function (files) {
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          docfiles.push({ data: file, inProgress: false, progress: 0 });
        }

        docfiles.forEach((file) => {
          uploadFile(file);
        });
      };

      $scope.submitConceptNote = function () {
        UserService.updateTheme($scope.user._id, $scope.user.theme, $scope.user.subtheme).then(
          (response) => {
            console.log(response);
          },
          (error) => {
            console.log(error);
          }
        );
        var file = $scope.fileUpload;
        uploadFile(file);
      };
      uploadFile = function (file) {
        // console.log(file, participateName);
        const imageObject = {};

        for (const key in file) {
          const value = file[key];
          const notFunction = typeof value !== "function";
          notFunction && (imageObject[key] = value);
        }
        // fileData.append('participateName',participateName);
        // console.log(fileData);
        UserService.submitNote(imageObject).then(
          (response) => {
            console.log(response);
            swal("File uploaded successfully").then((value) => {
              $state.go("app.note");
            });
          },
          (error) => {
            swal("Uh oh!", "Something went wrong.", "error");
            console.log(error);
          }
        );
      };
    },
  ]);
