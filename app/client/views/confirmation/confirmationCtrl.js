import sweetAlert from "sweetalert";

angular.module("reg").controller("ConfirmationCtrl", [
    "$scope",
    "$rootScope",
    "$state",
    "currentUser",
    "Utils",
    "UserService",
    function ($scope, $rootScope, $state, currentUser, Utils, UserService) {
        // Set up the user
        const user = currentUser.data;
        $scope.user = user;

        $scope.pastConfirmation = Date.now() > user.status.confirmBy;

        $scope.formatTime = Utils.formatTime;

        _setupForm();

        $scope.fileName = `${user._id}_${user.profile.name.split(" ").join("_")}`;

        // -------------------------------
        // All this just for dietary restriction checkboxes fml

        const dietaryRestrictions = {
            Vegetarian: false,
            Vegan: false,
            Halal: false,
            Kosher: false,
            "Nut Allergy": false,
        };

        if (user.profile.dietaryRestrictions instanceof Array) {
            user.profile.dietaryRestrictions.forEach((restriction) => {
                if (restriction in dietaryRestrictions) {
                    dietaryRestrictions[restriction] = true;
                }
            });
        }

        $scope.dietaryRestrictions = dietaryRestrictions;

        // -------------------------------

        function _updateUser(e) {
            const confirmation = $scope.user.profile;
            // Get the dietary restrictions as an array
            const drs = [];
            Object.keys($scope.dietaryRestrictions).forEach((key) => {
                if ($scope.dietaryRestrictions[key]) {
                    drs.push(key);
                }
            });
            confirmation.dietaryRestrictions = drs;

            UserService.updateConfirmation(user._id, confirmation, true).success((data) => {
                sweetAlert({
                    title: "Woo!",
                    text: "You're confirmed!",
                    type: "success",
                    confirmButtonColor: "#e76482",
                }, () => {
                    $state.go("app.dashboard");
                });
            }).error((res) => {
                sweetAlert("Uh oh!", "Something went wrong.", "error");
            });
        }

        function _setupForm() {
            // Semantic-UI form validation
            $(".ui.form").form({
                fields: {
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
                    signatureLiability: {
                        identifier: "signatureLiabilityWaiver",
                        rules: [
                            {
                                type: "empty",
                                prompt: "Please type your digital signature.",
                            },
                        ],
                    },
                    signaturePhotoRelease: {
                        identifier: "signaturePhotoRelease",
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
            if ($(".ui.form").form("is valid")) {
                _updateUser();
            }
        };
    }]);
