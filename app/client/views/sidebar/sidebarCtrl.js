angular.module("reg").controller("SidebarCtrl", [
    "$rootScope",
    "$scope",
    "settings",
    "Utils",
    "AuthService",
    "Session",
    "EVENT_INFO",
    function ($rootScope, $scope, Settings, Utils, AuthService, Session, EVENT_INFO) {
        const settings = Settings.data;
        const user = $rootScope.currentUser;

        $scope.EVENT_INFO = EVENT_INFO;

        $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);

        $scope.logout = function () {
            AuthService.logout();
        };

        $scope.showSidebar = false;
        $scope.toggleSidebar = function () {
            $scope.showSidebar = !$scope.showSidebar;
        };

        // oh god jQuery hack
        $(".item").on("click", () => {
            $scope.showSidebar = false;
        });
    }]);
