const swal = require("sweetalert");

angular.module('reg')
    .controller('ScoringGradeCtrl', [
        '$scope',
        'allUsers',
        'Utils',
        'UserService',
        function ($scope, allUsers, Utils, UserService) {

            function _setupForm() {
                // Semantic-UI form validation
                $('.ui.form').form({
                    inline: true,
                    fields: {
                        team: {
                            identifier: 'team',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: "Please choose a team."
                                }
                            ]
                        },
                    }
                });
            }

            $scope.allUsers = allUsers.data;
            var teamMap = new Map();
            var teamNamesMap = new Map();

            _setupForm();

            for (let i = 0; i < $scope.allUsers.length; i++) {
                if ($scope.allUsers[i].teamCode) {
                    if (teamMap.has($scope.allUsers[i].teamCode)) {
                        teamMap.get($scope.allUsers[i].teamCode).push($scope.allUsers[i]._id);
                        teamNamesMap.get($scope.allUsers[i].teamCode).push($scope.allUsers[i].profile.name);
                    } else {
                        teamMap.set($scope.allUsers[i].teamCode, [$scope.allUsers[i]._id]);
                        teamNamesMap.set($scope.allUsers[i].teamCode, [$scope.allUsers[i].profile.name]);
                    }
                }

            }

            $scope.allTeams = Array.from(teamMap.keys());

            $scope.teamSelected = function () {
                $scope.members = Array.from(teamNamesMap.get($scope.formData.selectedTeam));
                $scope.idMembers = Array.from(teamMap.get($scope.formData.selectedTeam));
            };

            function _resetForm() {
                $scope.formData = {};
                $scope.scoringForm.$setPristine(true);
                $scope.ratings[0].current = 5;
                $scope.ratings[1].current = 5;
                $scope.ratings[2].current = 5;
            }

            $scope.submitForm = function () {
                if ($('.ui.form').form('is valid')) {
                    $scope.gradeAverage = ($scope.ratings[0].current + $scope.ratings[1].current + $scope.ratings[2].current) / 3;
                    $scope.gradeAverage = $scope.gradeAverage.toFixed(2);
                    var gradeString = $scope.formData.selectedTeam + "'s " + "Grade: " + $scope.gradeAverage;
                    _resetForm();
                    _updateGradeTeam(gradeString);
                } else {
                    swal("Uh oh!", "Please Fill The Required Fields", "error");
                }
            };

            function _updateGradeTeam(gradeString) {
                for (let i = 0; i < $scope.idMembers.length; i++) {
                    UserService
                        .addGrade($scope.idMembers[i], $scope.gradeAverage)
                        .then(response => {
                            swal("Grade updated !", gradeString, "success");
                        }, response => {
                            console.log(response);
                        });
                }
            }

            $scope.ratings = [{
                name: "Idea",
                current: 5,
                max: 10
            },
                {
                    name: "Code",
                    current: 5,
                    max: 10
                },
                {
                    name: "Presentation",
                    current: 5,
                    max: 10
                }];
        }]).directive('starRating', function () {
            return {
                restrict: 'A',
                template: '<ul class="rating">' +
                    '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
                    '\u2605' +
                    '</li>' +
                    '</ul>',
                scope: {
                    ratingValue: '=',
                    max: '=',
                    onRatingSelected: '&'
                },
                link: function (scope, elem, attrs) {

                    var updateStars = function () {
                        scope.stars = [];
                        for (var i = 0; i < scope.max; i++) {
                            scope.stars.push({
                                filled: i < scope.ratingValue
                            });
                        }
                    };

                    scope.toggle = function (index) {
                        scope.ratingValue = index + 1;
                        scope.onRatingSelected({
                            rating: index + 1
                        });
                    };

                    scope.$watch('ratingValue', function (oldVal, newVal) {
                        if (newVal) {
                            updateStars();
                        }
                    });
                }
            };
        });
