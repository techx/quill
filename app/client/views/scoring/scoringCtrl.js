angular.module('reg')
    .controller('ScoringCtrl', [
        '$scope',
        'SettingsService',
        function ($scope, SettingsService) {
            // $scope.loading = true;
            SettingsService
                .getOpenScoring()
                .then(response => {
                    $scope.openScoringSystem = response.data;
                });
        }]);