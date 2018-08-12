import sweetAlert from "sweetalert";

angular.module("reg").controller("AdminUserCtrl", [
    "$scope",
    "$http",
    "user",
    "UserService",
    "EVENT_INFO",
    function ($scope, $http, User, UserService, EVENT_INFO) {
        $scope.EVENT_INFO = EVENT_INFO;

        $scope.selectedUser = User.data;

        // Populate the school dropdown
        populateSchools();

        console.log($scope.selectedUser);

        /**
             * TODO: JANK WARNING
             */
        function populateSchools() {
            $http.get("/assets/schools.json").then((res) => {
                const schools = res.data;
                const email = $scope.selectedUser.email.split("@")[1];

                if (schools[email]) {
                    $scope.selectedUser.profile.school = schools[email].school;
                    $scope.autoFilledSchool = true;
                }
            });
        }


        $scope.updateProfile = function () {
            UserService.updateProfile($scope.selectedUser._id, $scope.selectedUser.profile).success((data) => {
                $selectedUser = data;
                sweetAlert("Updated!", "Profile updated.", "success");
            }).error(() => {
                sweetAlert("Oops, you forgot something.");
            });
        };
    }]);
