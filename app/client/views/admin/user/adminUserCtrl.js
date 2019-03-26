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

            $scope.APPLICATION = APPLICATION;

            // Populate the school dropdown
            populateSchools();
            // Populate the major dropdown
            populateMajors();
            // Populate dietary restrictions
            populateDietaryRestrictions();
            // Populate Bus Stops
            populateBusStops();

            $scope.formatTime = function(time){
                if (time) {
                    return moment(time).format('MMMM Do YYYY, h:mm:ss a');
                }
            };

            function populateDietaryRestrictions(){
                var dietaryRestrictions = {
                    'Vegetarian': false,
                    'Vegan': false,
                    'Halal': false,
                    'Kosher': false,
                    'Nut Allergy': false,
                    'Lactose Intolerant': false,
                    'Gluten Free': false
                };

                if ($scope.selectedUser.confirmation.dietaryRestrictions){
                    $scope.selectedUser.confirmation.dietaryRestrictions.forEach(function(restriction){
                        if (restriction in dietaryRestrictions){
                            dietaryRestrictions[restriction] = true;
                        }
                    });
                }

                $scope.dietaryRestrictions = dietaryRestrictions;
            }

            function populateBusStops() {
                if ($scope.selectedUser.confirmation.busStop !== undefined && user.confirmation !== "") {
                    return;
                }

                var email = $scope.selectedUser.email.split('@')[1];

                // Kill Willie for this later
                // I'll kill you 0 consistency - Daniel
                var USC = "USC";
                var STANFORD = "Stanford";
                var BERKELEY = "Berkeley";
                var UCSD = "UCSD";
                var UCI = "UC Irvine";
                var UCLA = "UCLA";
                var UCSB = "UCSB";

                var stops = {
                    "school.edu": USC,
                    "usc.edu": USC,
                    "stanford.edu": STANFORD,
                    "ucsc.edu": STANFORD,
                    "mywvm.wvm.edu": STANFORD,
                    "sjsu.edu": STANFORD,
                    "student.ohlone.edu": STANFORD,
                    "berkeley.edu": BERKELEY,
                    "mail.ccsf.edu": BERKELEY,
                    "sfsu.edu": BERKELEY,
                    "usfca.edu": BERKELEY,
                    "horizon.csueastbay.edu": BERKELEY,
                    "acsmail.ucsd.edu": UCSD,
                    "ucsd.edu": UCSD,
                    "sdsu.edu": UCSD,
                    "my.canyons.edu": UCSD,
                    "sandiego.edu": UCSD,
                    "eng.ucsd.edu": UCSD,
                    "uci.edu": UCI,
                    "csu.fullerton.edu": UCI,
                    "sac.edu": UCI,
                    "ivc.edu": UCI,
                    "orangecoastcollege.edu": UCI,
                    "student.csulb.edu": UCI,
                    "ucla.edu": UCLA,
                    "g.ucla.edu": UCLA,
                    "ucsb.edu": UCSB,
                    "cpp.edu": UCSB,
                    "umail.ucsb.edu": UCSB
                };

                if (stops[email]) {
                    $scope.selectedUser.confirmation.busStop = stops[email];
                }
            }

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
                // Check null
                if (event.files.length < 1) {
                    return;
                }
                var file = event.files[0];

                // Check type
                if (file.name.split('.').pop() !== 'pdf'){
                    swal("Incorrect File Type", "Please select a pdf file!", "error");
                    return;
                }

                // Check size
                if (file.size > 2000000) {
                    swal("Exceeded Maximum File Size", "Please select a file smaller or equal to 2mb.", "error");
                    return;
                }

                var reader = new FileReader();

                // Read the file and attempt to upload
                reader.onloadend = function () {
                    // check metadata
                    if(file.type !== 'application/pdf'){
                        swal("Incorrect File Type", "Please select a pdf file!", "error");
                        return;
                    }
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
                    .uploadFile($scope.selectedUser._id, metadata, file)
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
                    .updateFile($scope.selectedUser._id, $scope.selectedUser.profile.resume.id, metadata, file)
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

            function _updateUserProfile() {
                UserService
                    .updateProfile($scope.selectedUser._id, $scope.selectedUser.profile)
                    .then(response => {
                        swal("Awesome!", "Your application has been saved.", "success").then(value => {
                            // do nothing - stay on same page
                        });
                    }, response => {
                        swal("Uh oh!", "Something went wrong.", "error");
                    });
            }

            $scope.updateProfile = function() {
                _updateUserProfile();
            };

            function _updateUserConfirmation(){
                var confirmation = $scope.selectedUser.confirmation;
                // Get the dietary restrictions as an array
                var drs = [];
                Object.keys($scope.dietaryRestrictions).forEach(function(key){
                    if ($scope.dietaryRestrictions[key]){
                        drs.push(key);
                    }
                });
                confirmation.dietaryRestrictions = drs;

                UserService
                    .updateConfirmation($scope.selectedUser._id, confirmation)
                    .then(response => {
                        swal("Woo!", "You're confirmed!", "success").then(value => {
                            // do nothing - stay on same page
                        });
                    }, response => {
                        swal("Uh oh!", "Something went wrong.", "error");
                    });
            }

            $scope.updateConfirmation = function() {
                _updateUserConfirmation();
            }
        }]);
