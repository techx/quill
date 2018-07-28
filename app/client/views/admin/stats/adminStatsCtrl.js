import moment from "moment";

angular.module("reg").controller("AdminStatsCtrl", [
    "$scope",
    "UserService",
    function ($scope, UserService) {
        UserService.getStats().success((stats) => {
            $scope.stats = stats;
            $scope.loading = false;
        });

        $scope.fromNow = function (date) {
            return moment(date).fromNow();
        };
    }]);
