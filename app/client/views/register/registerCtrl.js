angular.module("reg").controller("RegisterCtrl", [
    "$scope",
    "$http",
    "$state",
    "settings",
    "Utils",
    "AuthService",
    function ($scope, $http, $state, settings, Utils, AuthService) {
        // Is registration open?
        const Settings = settings.data;
        $scope.regIsOpen = Utils.isRegOpen(Settings);

        // Start state for login
        $scope.loginState = "register";

        function onSuccess() {
            $state.go("app.dashboard");
        }

        function onError(data) {
            $scope.error = data.message;
        }

        function resetError() {
            $scope.error = null;
        }

        $scope.register = function () {
            resetError();
            if ($scope.password !== $scope.confirm_password) {
                $scope.error = "Please make sure your passwords match!";
            }
            else {
                AuthService.register(
                    $scope.email, $scope.password, onSuccess, onError,
                );
            }
        };
    },
]);
