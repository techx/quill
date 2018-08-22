angular.module("reg").controller("HomeCtrl", [
    "$scope",
    "$http",
    "$state",
    function ($scope, $http, $state) {
        $scope.showSidebar = false;
        $(".ui.accordion").accordion();
    },
]);
