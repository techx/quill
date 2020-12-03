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
        "RPTR": [
          "",
          "Covid-19 Recovery",
          "Cost-effective Solutions",
        ],
        "ASTR": [
          "Multi-modal integration",
          "Sustainable Transport Modes",
        ],
        "EM": [
          "Sub Gender and Safety",
          "Inclusivity and Efficiency Improvement",
        ],
      };
      
      themeMap = {
        "one": "Restoring Public Transport Ridership",
        "two": "Achieving Sustainable Transport and Resilience",
        "three": "Equity in Mobility",
      };
      
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

      $scope.themeChange = () => {
        console.log('theme change')
        $scope.subtheme = ''
      }

      function _setupForm(themeNo) {

        console.log('form setup')

        var fields = {
          fileUpload: {
            identifier: 'fileUpload_' + themeNo,
            rules: [
              {
                type: 'empty',
                prompt: 'Please select a PDF to upload.'
              }
            ]
          },
          subtheme: {
            identifier: 'subtheme_' + themeNo,
            rules: [
              {
                type: 'empty',
                prompt: 'Please select a subtheme.'
              }
            ]
          },
        }
        
        // Semantic-UI form validation
        $('.ui.form.note').form({
          inline: true,
          fields: fields
        });
      }

      $scope.onFileChange = function (files) {
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          docfiles.push({ data: file, inProgress: false, progress: 0 });
        }

        docfiles.forEach((file) => {
          uploadFile(file);
        });
      };

      $scope.previewNote = (themeNo) => {
        var theme = themeMap[themeNo];
        var subtheme = $scope.user['subtheme_' + themeNo];

        UserService.getNote({
          theme: theme,
          subtheme: subtheme
        }).then((res) => {
          window.open(res.data.signedURL, '_blank');
        })
      }

      $scope.submitConceptNote = function (themeNo) {

        console.log(themeNo)

        _setupForm(themeNo);

        if ($('.ui.form.note').form('validate form')){
          console.log('valid form')
          uploadFile(
            $scope['fileUpload_' + themeNo],
            themeMap[themeNo],
            $scope.user['subtheme_' + themeNo],
            themeNo
          )
        } else {
          swal("Uh oh!", "Please Fill The Required Fields Correctly", "error");
        }

        /* UserService.updateTheme($scope.user._id, $scope.user.theme, $scope.user.subtheme).then(
          (response) => {
            console.log(response);
          },
          (error) => {
            console.log(error);
          }
        );
        var file = $scope.fileUpload;
        uploadFile(file); */
      };
      
      uploadFile = function (file, theme, subtheme, themeNo) {
        // console.log(file, participateName);
        const imageObject = {};
        console.log(file)

        for (const key in file) {
          const value = file[key];
          const notFunction = typeof value !== "function";
          notFunction && (imageObject[key] = value);
        }
        imageObject['theme'] = theme
        imageObject['subtheme'] = subtheme
        // fileData.append('participateName',participateName);
        // console.log(fileData);
        UserService.submitNote(imageObject).then((response) => {
          console.log(response);
          $http.put(response.data.signedURL, file, { headers: { 'Content-Type': file.type }}).then((data) => {

            data = {}
            data['theme'] = themeNo
            data['subtheme'] = subtheme

            UserService.updateTheme(
              $scope.user._id,
              data
            ).then( (response) => {
                console.log(response);
                
                swal("Kudos!", "Concept note submitted!", "success");
                location.reload();
              },
              (error) => {
                console.log(error);
              }
            );


              
              // console.log("File uploaded successfully");
          },
          function (error) {
            swal("Uh oh!", "Something went wrong.", error);
            console.error("There was an error!", error);
          });
        }, 
        (error) => {
          swal("Uh oh!", "Something went wrong.", "error");
          console.log(error);
        });
      };
    },
  ]);
