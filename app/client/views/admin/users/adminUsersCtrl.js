import moment from "moment";
import sweetAlert from "sweetalert";

angular.module("reg").controller("AdminUsersCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "UserService",
    function ($scope, $state, $stateParams, UserService) {
        $scope.pages = [];
        $scope.users = [];

        // Semantic-UI moves modal content into a dimmer at the top level.
        // While this is usually nice, it means that with our routing will generate
        // multiple modals if you change state. Kill the top level dimmer node on initial load
        // to prevent this.
        $(".ui.dimmer").remove();
        // Populate the size of the modal for when it appears, with an arbitrary user.
        $scope.selectedUser = {};
        $scope.selectedUser.sections = generateSections({
            status: "",
            confirmation: {
                dietaryRestrictions: [],
            },
            profile: "",
        });

        function updatePage(data) {
            $scope.users = data.users;
            $scope.currentPage = data.page;
            $scope.pageSize = data.size;

            const p = [];
            for (let i = 0; i < data.totalPages; i++) {
                p.push(i);
            }
            $scope.pages = p;
        }

        UserService.getPage($stateParams.page, $stateParams.size, $stateParams.query).success((data) => {
            updatePage(data);
        });

        $scope.$watch("queryText", (queryText) => {
            UserService.getPage($stateParams.page, $stateParams.size, queryText).success((data) => {
                updatePage(data);
            });
        });

        $scope.goToPage = function (page) {
            $state.go("app.admin.users", {
                page,
                size: $stateParams.size || 50,
            });
        };

        $scope.goUser = function ($event, user) {
            $event.stopPropagation();

            $state.go("app.admin.user", {
                id: user._id,
            });
        };

        $scope.toggleCheckIn = function ($event, user, index) {
            $event.stopPropagation();

            if (!user.status.checkedIn) {
                sweetAlert({
                    title: "Whoa, wait a minute!",
                    text: `You are about to check in ${user.profile.name}!`,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, check them in.",
                    closeOnConfirm: false,
                }, () => {
                    UserService.checkIn(user._id).success((user) => {
                        $scope.users[index] = user;
                        sweetAlert("Accepted", `${user.profile.name} has been checked in.`, "success");
                    });
                });
            }
            else {
                UserService.checkOut(user._id).success((user) => {
                    $scope.users[index] = user;
                    sweetAlert("Accepted", `${user.profile.name} has been checked out.`, "success");
                });
            }
        };

        $scope.acceptUser = function ($event, user, index) {
            $event.stopPropagation();

            sweetAlert({
                title: "Whoa, wait a minute!",
                text: `You are about to accept ${user.profile.name}!`,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, accept them.",
                closeOnConfirm: false,
            }, () => {
                sweetAlert({
                    title: "Are you sure?",
                    text: "Your account will be logged as having accepted this user. "
                + "Remember, this power is a privilege.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, accept this user.",
                    closeOnConfirm: false,
                }, () => {
                    UserService.admitUser(user._id).success((user) => {
                        $scope.users[index] = user;
                        sweetAlert("Accepted", `${user.profile.name} has been admitted.`, "success");
                    });
                });
            });
        };

        $scope.acceptUserAndTeam = function ($event, user, index) {
            $event.stopPropagation();
            sweetAlert({
                title: "Whoa, wait a minute!",
                text: `You are about to accept ${user.profile.name} and their team!`,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, accept them.",
                closeOnConfirm: false,
            }, () => {
                sweetAlert({
                    title: "Are you sure?",
                    text: "Your account will be logged as having accepted this user and their team. "
                + "Remember, this power is a privilege.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, accept this user.",
                    closeOnConfirm: false,
                }, () => {
                    UserService.admitUserAndTeammates(user._id).success(() => {
                        $scope.users[index] = user;
                        sweetAlert("Accepted", `${user.profile.name} and their team has been admitted. Reload the page to confirm the team is accepted.`, "success");
                    });
                });
            });
        };

        $scope.downloadCSV = function () {
            UserService.downloadCSV().success((content) => {
                const now = new moment().format("MMMM Do YYYY, h:mm:ss a");
                const hiddenElement = document.createElement("a");
                hiddenElement.href = `data:attachment/csv,${encodeURI(content)}`;
                hiddenElement.target = "_blank";
                hiddenElement.download = `BigRedHacks_${now}.csv`;
                hiddenElement.click();
            });
        };

        function formatTime(time) {
            if (time) {
                return moment(time).format("MMMM Do YYYY, h:mm:ss a");
            }
        }

        $scope.rowClass = function (user) {
            if (user.admin) {
                return "admin";
            }
            if (user.status.confirmed) {
                return "positive";
            }
            if (user.status.admitted && !user.status.confirmed) {
                return "warning";
            }
        };

        function selectUser(user) {
            $scope.selectedUser = user;
            console.log(user);
            $scope.selectedUser.sections = generateSections(user);
            $(".long.user.modal").modal("show");
        }

        function generateSections(user) {
            return [
                {
                    name: "Basic Info",
                    fields: [
                        {
                            name: "Created On",
                            value: formatTime(user.timestamp),
                        }, {
                            name: "Last Updated",
                            value: formatTime(user.lastUpdated),
                        }, {
                            name: "Confirm By",
                            value: formatTime(user.status.confirmBy) || "N/A",
                        }, {
                            name: "Checked In",
                            value: formatTime(user.status.checkInTime) || "N/A",
                        }, {
                            name: "Email",
                            value: user.email,
                        }, {
                            name: "Team",
                            value: user.teamCode || "None",
                        },
                    ],
                }, {
                    name: "Profile",
                    fields: [
                        {
                            name: "Name",
                            value: user.profile.name,
                        }, {
                            name: "Gender",
                            value: user.profile.gender,
                        }, {
                            name: "School",
                            value: user.profile.school,
                        }, {
                            name: "Graduation Year",
                            value: user.profile.graduationYear,
                        }, {
                            name: "Description",
                            value: user.profile.description,
                        }, {
                            name: "Essay",
                            value: user.profile.essay,
                        },
                    ],
                }, {
                    name: "Confirmation",
                    fields: [
                        {
                            name: "Phone Number",
                            value: user.profile.phoneNumber,
                        }, {
                            name: "Dietary Restrictions",
                            value: user.profile.dietaryRestrictions instanceof Array
                                ? user.profile.dietaryRestrictions.join(", ")
                                : "None",
                        }, {
                            name: "Shirt Size",
                            value: user.profile.shirtSize,
                        }, {
                            name: "Major",
                            value: user.profile.major,
                        }, {
                            name: "GitHub",
                            value: user.profile.github,
                        }, {
                            name: "Website",
                            value: user.profile.website,
                        }, {
                            name: "Needs Hardware",
                            value: user.profile.wantsHardware,
                            type: "boolean",
                        }, {
                            name: "Hardware Requested",
                            value: user.profile.hardware,
                        },
                    ],
                }, {
                    name: "Travel",
                    fields: [
                        {
                            name: "Needs Reimbursement",
                            value: user.profile.needsReimbursement,
                            type: "boolean",
                        }, {
                            name: "Received Reimbursement",
                            value: user.profile.needsReimbursement && user.status.reimbursementGiven,
                        }, {
                            name: "Address",
                            value: user.profile.address ? [
                                user.profile.address.line1,
                                user.profile.address.line2,
                                user.profile.address.city,
                                ",",
                                user.profile.address.state,
                                user.profile.address.zip,
                                ",",
                                user.profile.address.country,
                            ].join(" ") : "",
                        }, {
                            name: "Additional Notes",
                            value: user.profile.notes,
                        },
                    ],
                },
            ];
        }

        $scope.selectUser = selectUser;
    }]);
