import sweetAlert from "sweetalert";

angular.module("reg").controller("ApplicationCtrl", [
    "$scope",
    "$rootScope",
    "$state",
    "$http",
    "currentUser",
    "settings",
    "Session",
    "UserService",
    "EVENT_INFO",
    function ($scope, $rootScope, $state, $http, currentUser, Settings, Session, UserService, EVENT_INFO) {
        const user = currentUser.data;

        $scope.EVENT_INFO = EVENT_INFO;

        // Set up the user
        $scope.user = currentUser.data;

        // Is the student from Cornell?
        $scope.isCornellStudent = $scope.user.email.split("@")[1] === "cornell.edu";

        // If so, default them to adult: true
        if ($scope.isCornellStudent) {
            $scope.user.profile.adult = true;
        }

        // Populate the school dropdown
        populateSchools();
        _setupForm();

        $scope.regIsClosed = Date.now() > Settings.data.timeClose;

        // -------------------------------
        // All this just for dietary restriction checkboxes

        const dietaryRestrictions = {
            Vegetarian: false,
            Vegan: false,
            Halal: false,
            Kosher: false,
            "Nut Allergy": false,
        };

        if (user.confirmation.dietaryRestrictions) {
            user.confirmation.dietaryRestrictions.forEach((restriction) => {
                if (restriction in dietaryRestrictions) {
                    dietaryRestrictions[restriction] = true;
                }
            });
        }

        $scope.dietaryRestrictions = dietaryRestrictions;

        /**
         * TODO: JANK WARNING
         */
        function populateSchools() {
            $http.get("/assets/schools.json").then((res) => {
                const schools = res.data;
                const email = $scope.user.email.split("@")[1];

                if (schools[email]) {
                    $scope.user.profile.school = schools[email].school;
                    $scope.autoFilledSchool = true;
                }
            });

            $http.get("/assets/schools.csv").then((res) => {
                $scope.schools = res.data.split("\n");
                $scope.schools.push("Other");

                const content = [];

                for (i = 0; i < $scope.schools.length; i++) {
                    $scope.schools[i] = $scope.schools[i].trim();
                    content.push({ title: $scope.schools[i] });
                }

                $("#school.ui.search").search({
                    source: content,
                    cache: true,
                    onSelect(result, response) {
                        $scope.user.profile.school = result.title.trim();
                    },
                });
            });
        }

        function _updateUser(e) {
            const updateProfile = new Promise((resolve, reject) => {
                UserService.updateProfile(Session.getUserId(), $scope.user.profile)
                    .success(resolve)
                    .error(reject);
            });
            const updateConfirm = new Promise((resolve, reject) => {
                UserService.updateConfirmation(Session.getUserId(), $scope.user.confirmation)
                    .success(resolve)
                    .error(reject);
            });
            Promise.all([updateProfile, updateConfirm])
                .then((data) => {
                    sweetAlert({
                        title: "Awesome!",
                        text: "Your application has been saved.",
                        type: "success",
                        confirmButtonColor: "#e76482",
                    }, () => {
                        $state.go("app.dashboard");
                    });
                })
                .error((err) => {
                    sweetAlert("Uh oh!", "Something went wrong.", "error");
                });
        }

        function isMinor() {
            return !$scope.user.profile.adult;
        }

        function minorsAreAllowed() {
            return Settings.data.allowMinors;
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
            $(".ui.form").form({
                inline: true,
                fields: {
                    name: {
                        identifier: "name",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please enter your name.",
                            },
                        ],
                    },
                    school: {
                        identifier: "school",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please enter your school name.",
                            },
                        ],
                    },
                    year: {
                        identifier: "year",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please select your graduation year.",
                            },
                        ],
                    },
                    gender: {
                        identifier: "gender",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please select a gender.",
                            },
                        ],
                    },
                    adult: {
                        identifier: "adult",
                        rules: [
                            {
                                type: "allowMinors",
                                prompt: "You must be an adult or an Cornell student.",
                            },
                        ],
                    },
                    shirt: {
                        identifier: "shirt",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please give us a shirt size!",
                            },
                        ],
                    },
                    phone: {
                        identifier: "phone",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please enter a phone number.",
                            },
                        ],
                    },
                    privacyPolicy: {
                        identifier: "privacyPolicy",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please type your digital signature.",
                            },
                        ],
                    },
                    signatureCodeOfConduct: {
                        identifier: "signatureCodeOfConduct",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please type your digital signature.",
                            },
                        ],
                    },
                },
            });
        }


        $scope.submitForm = function () {
            $(".ui.form").form("validate form");
            if ($(".ui.form").form("is valid")) {
                _updateUser();
            }
            else {
                sweetAlert("Uh oh!", "Please fill out the required fields.", "error");
            }
        };
    }]);
