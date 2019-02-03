const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
    .controller('ApplicationCtrl', [
        '$scope',
        '$rootScope',
        '$state',
        '$http',
        'currentUser',
        'settings',
        'Session',
        'UserService',
        'FileService',
        function ($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService, FileService) {

            // Set up the user
            $scope.user = currentUser.data;

            // //Not in use because we don't allow minors (no exceptions)
            // // Is the student from USC?
            // $scope.isUSCStudent = $scope.user.email.split('@')[1] == 'usc.edu';
            //
            // // If so, default them to adult: true
            // if ($scope.isUSCStudent){
            //   $scope.user.profile.adult = true;
            // }

            // Populate the school dropdown
            populateSchools();
            // Populate the major dropdown
            populateMajors();
            _setupForm();

            $scope.regIsClosed = Date.now() > settings.data.timeClose;

            /**
             * TODO: JANK WARNING
             */
            function populateSchools() {
                $http
                    .get('/assets/schools.json')
                    .then(function (res) {
                        var schools = res.data;
                        var email = $scope.user.email.split('@')[1];

                        if (schools[email]) {
                            $scope.user.profile.school = schools[email].school;
                            $scope.autoFilledSchool = true;
                        }
                    });

                $http
                    .get('/assets/schools.csv')
                    .then(function (res) {
                        $scope.schools = res.data.split('\n');
                        $scope.schools.push('Other');

                        var content = [];

                        for (let i = 0; i < $scope.schools.length; i++) {
                            $scope.schools[i] = $scope.schools[i].trim();
                            content.push({title: $scope.schools[i]})
                        }

                        $('#school.ui.search')
                            .search({
                                source: content,
                                cache: true,
                                onSelect: function (result, response) {
                                    $scope.user.profile.school = result.title.trim();
                                }
                            })
                    });
            }

            function populateMajors() {
                $http
                    .get('/assets/majors.csv')
                    .then(function (res) {
                        $scope.majors = res.data.split('\n');
                        $scope.majors.push('Other');

                        var content = [];

                        for (let i = 0; i < $scope.majors.length; i++) {
                            $scope.majors[i] = $scope.majors[i].trim();
                            content.push({title: $scope.majors[i]})
                        }

                        $('#major.ui.search')
                            .search({
                                source: content,
                                cache: true,
                                onSelect: function (result, response) {
                                    $scope.user.profile.major = result.title.trim();
                                }
                            })
                    });
            }

            $scope.uploadFile = function (event) {
                if (event.files.length < 1) {
                    swal("Please upload a resume.", "error");
                }
                var file = event.files[0];
                var reader = new FileReader();

                // Read the file and attempt to upload
                reader.onloadend = function () {
                    var metadata = {
                        name: file.name,
                        type: file.type
                    };
                    _uploadFile(metadata, reader.result);
                };
                reader.readAsDataURL(file);
            };

            function _uploadFile(metadata, file) {
                FileService
                    .uploadFile(Session.getUserId(), metadata, file)
                    .then((response) => {
                            var data = response.data;
                            console.log(data);
                            $scope.user.profile.resume = {
                                name: data.name,
                                id: data.id,
                                link: data.webViewLink
                            };
                            swal("Success!", "Your resume has been uploaded.", "success");
                        }, (response) => {
                            swal("Uh oh!", "Something went wrong.", "error");
                        }
                    );
            }

            function _updateUser(e) {
                UserService
                    .updateProfile(Session.getUserId(), $scope.user.profile)
                    .then(response => {
                        swal("Awesome!", "Your application has been saved.", "success").then(value => {
                            $state.go("app.dashboard");
                        });
                    }, response => {
                        swal("Uh oh!", "Something went wrong.", "error");
                    });
            }

            function isMinor() {
                return !$scope.user.profile.adult;
            }

            function minorsAreAllowed() {
                return settings.data.allowMinors;
            }

            function minorsValidation() {
                // Are minors allowed to register?
                if (isMinor() && !minorsAreAllowed()) {
                    return false;
                }
                return true;
            }

            function _setupForm() {
                // Custom minors validation rule
                $.fn.form.settings.rules.allowMinors = function (value) {
                    return minorsValidation();
                };

                // Semantic-UI form validation
                $('.ui.form').form({
                    inline: true,
                    fields: {
                        firstName: {
                            identifier: 'firstName',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please enter your first name.'
                                }
                            ]
                        },
                        lastName: {
                            identifier: 'lastName',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please enter your last name.'
                                }
                            ]
                        },
                        gender: {
                            identifier: 'gender',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please select your gender.'
                                }
                            ]
                        },
                        ethnicity: {
                            identifier: 'ethnicity',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please select your ethnicity.'
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
                        year: {
                            identifier: 'year',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please select your school year.'
                                }
                            ]
                        },
                        major: {
                            identifier: 'major',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please enter your major.'
                                }
                            ]
                        },
                        experience: {
                            identifier: 'experience',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please select your experience.'
                                }
                            ]
                        },
                        adult: {
                            identifier: 'adult',
                            rules: [
                                {
                                    type: 'allowMinors',
                                    prompt: 'You must be over 18 by the time HackSC begins.'
                                }
                            ]
                        }
                    }
                });
            }

            $scope.submitForm = function () {
                if ($('.ui.form').form('is valid')) {
                    _updateUser();
                } else {
                    swal("Uh oh!", "Please Fill The Required Fields", "error");
                }
            };
        }]);
