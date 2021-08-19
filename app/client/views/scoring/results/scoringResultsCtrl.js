angular.module('reg')
    .controller('ScoringResultsCtrl', [
        '$scope',
        'allUsers',
        'UserService',
        function ($scope, allUsers, UserService) {
            function containsObject(name, list) {
                var i;
                for (i = 0; i < list.length; i++) {
                    if (list[i].key === name) {
                        return true;
                    }
                }

                return false;
            }

            function getAverage(allGrades){
                var sum = 0;
                for (let i = 0; i < allGrades.length; i++) {
                    sum += allGrades[i];
                }
                return (sum / allGrades.length).toFixed(2);
            }

            $scope.allUsers = allUsers.data;
            $scope.teamMap = [];

            var average;

            for (let i = 0; i < $scope.allUsers.length; i++) {
                if ($scope.allUsers[i].teamCode) {
                    if (!containsObject($scope.allUsers[i].teamCode, $scope.teamMap)) {
                        var allGrades = $scope.allUsers[i].grades;
                        average = getAverage(allGrades);

                        $scope.teamMap.push({
                            key: $scope.allUsers[i].teamCode,
                            value: parseFloat(average),
                        });
                    }
                }
            }

            function compare(a, b) {
                if (a.value < b.value){
                    return 1;
                }
                if (a.value > b.value){
                    return -1;
                }
                return 0;
            }

            $scope.teamMap.sort(compare);

            function getMembers(team){
                var members = [];
                for (let i = 0; i < $scope.allUsers.length; i++) {
                    if ($scope.allUsers[i].teamCode === team) {
                        members.push($scope.allUsers[i].profile.name);
                    }
                }

                return members;
            }

            for (let i = 0; i < $scope.teamMap.length; i++) {
                $scope.teamMap[i].rank = i + 1;
                $scope.teamMap[i].members = getMembers( $scope.teamMap[i].key);
            }

        }]);
