const swal = require("sweetalert");
// import { HttpClient } from '@angular/common/http';
// import * as S3 from 'aws-sdk/clients/s3';
const S3 = require("aws-sdk/clients/s3");

angular.module("reg").directive('fileModel', ['$parse', function ($parse) {
  return {
     restrict: 'A',
     link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.bind('change', function() {
           scope.$apply(function() {
              modelSetter(scope, element[0].files[0]);
           });
        });
     }
  };
}])
.controller("ConceptNoteCtrl", [
  "$scope",
  "currentUser",
  "settings",
  "$state",
  "Utils",
  "UserService",
  "$http",
  function ($scope, currentUser, settings, $state, Utils, UserService, $http) {
    // Set up the user
    $scope.user = currentUser.data;
    var participateName = currentUser.data.profile.name;
    // console.log(user);
    // console.log("in coonroller", currentUser.data);
    // console.log("setting", settings.data);

    // $scope.pastConfirmation = Date.now() > user.status.confirmBy;
    $scope.pastConfirmation = new Date(Date.now());
    $scope.conceptNoteStartDate = new Date(Date.now());
    // $scope.conceptNoteStartDate = Utils.formatTime(
    //   settings.data.timeConceptNoteOpen
    // );

    $scope.formatTime = Utils.formatTime;
    var docfiles = [];

    $scope.submitForm = function () {
      UserService.updateTheme($scope.user._id, $scope.user.theme).then(
        (response) => {
          swal("Theme Saved").then((value) => {
            $state.go("app.note");
          });
        },
        (response) => {
          swal("Uh oh!", "Something went wrong.", "error");
        }
      );
    };

    // bucket = new S3({
    //   accessKeyId: "AKIAJHYIK5IH6KOU6ZLQ",
    //   secretAccessKey: "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",
    //   region: "ap-south-1",
    // });
    bucket = new S3({
      accessKeyId: "AKIA37UO4YSCFKQNOUEH",
      secretAccessKey: "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",
      region: "ap-south-1",
    });
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
      var file=$scope.fileUpload;
      uploadFile(file);
    };
    uploadFile = function (file) {
      var params = {
        Bucket: "smart-move-s3",
        Key: "conceptNote/" + participateName + "/" + file.name,
        Expires: 3600,
        ContentType: file.type,
      };
      var url = bucket.getSignedUrl("putObject", params);
      $http.put(url, file).then(
        function (data) {
          swal("File uploaded successfully").then((value) => {
            $state.go("app.note");
          });
          // console.log("File uploaded successfully");
        },
        function (error) {
          swal("Uh oh!", "Something went wrong.", error);
          console.error("There was an error!", error);
        }
      );
    };
  },
]);
