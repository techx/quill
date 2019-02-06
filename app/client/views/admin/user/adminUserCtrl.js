const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
    .controller('AdminUserCtrl', [
        '$scope',
        '$http',
        'user',
        'UserService',
        'FileService',
        'APPLICATION',
        function ($scope, $http, User, UserService, FileService, APPLICATION) {

            // Set up the user
            $scope.selectedUser = User.data;
            console.log($scope.selectedUser.status);

            $scope.APPLICATION = APPLICATION;

            // Populate the school dropdown
            populateSchools();
            // Populate the major dropdown
            populateMajors();

            $scope.formatTime = function(time){
                if (time) {
                    return moment(time).format('MMMM Do YYYY, h:mm:ss a');
                }
            };

            function populateSchools() {
                $http
                    .get('/assets/schools.json')
                    .then(function (res) {
                        var schools = res.data;
                        var email = $scope.selectedUser.email.split('@')[1];

                        if (schools[email]) {
                            $scope.selectedUser.profile.school = schools[email].school;
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
                                    $scope.selectedUser.profile.school = result.title.trim();
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
                                    $scope.selectedUser.profile.major = result.title.trim();
                                }
                            })
                    });
            }

            $scope.uploadFile = function (event) {
                if (event.files.length < 1) {
                    return;
                }
                var file = event.files[0];
                if (file.size > 1000000) {
                    swal("Exceeded Maximum File Size", "Please select a file smaller or equal to 1mb.", "error");
                    return;
                }
                var reader = new FileReader();

                // Read the file and attempt to upload
                reader.onloadend = function () {
                    var metadata = {
                        name: file.name,
                        type: file.type
                    };
                    if ($scope.selectedUser.profile.resume !== undefined && $scope.selectedUser.profile.resume.id !== undefined) {
                        _updateFile(metadata, reader.result);
                    } else {
                        _uploadFile(metadata, reader.result);
                    }
                };

                reader.onerror = function(){
                    swal("Error reading file", "Please select a different file.", "error")
                };

                reader.readAsDataURL(file);
            };

            function _uploadFile(metadata, file) {
                $scope.fileLoading = true;
                FileService
                    .uploadFile(Session.getUserId(), metadata, file)
                    .then((response) => {
                            var data = response.data;
                            $scope.selectedUser.profile.resume = {
                                name: data.name,
                                id: data.id,
                                link: data.webViewLink
                            };
                            $scope.fileLoading = false;
                            swal("Success!", "Your resume has been uploaded.", "success");
                        }, (response) => {
                            $scope.fileLoading = false;
                            swal("Uh oh!", "Something went wrong.", "error");
                        }
                    );
            }

            function _updateFile(metadata, file) {
                $scope.fileLoading = true;
                FileService
                    .updateFile(Session.getUserId(), $scope.selectedUser.profile.resume.id, metadata, file)
                    .then((response) => {
                            var data = response.data;
                            $scope.selectedUser.profile.resume = {
                                name: data.name,
                                id: data.id,
                                link: data.webViewLink
                            };
                            swal("Success!", "Your resume has been updated.", "success");
                            $scope.fileLoading = false;
                        }, (response) => {
                            // Attempt to upload as new file
                            _uploadFile(metadata, file);
                        }
                    );
            }

            function _updateUser(e) {
                UserService
                    .updateProfile(Session.getUserId(), $scope.selectedUser.profile)
                    .then(response => {
                        swal("Awesome!", "Your application has been saved.", "success").then(value => {
                            // do nothing - stay on same page
                        });
                    }, response => {
                        swal("Uh oh!", "Something went wrong.", "error");
                    });
            }

            $scope.updateProfile = function() {
                _updateUser();
            };
        }]);
