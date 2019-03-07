const angular = require('angular');
const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
    .controller('AdminReviewCtrl',[
        '$scope',
        '$timeout',
        'UserService',
        'SettingsService',
        'ReviewService',
        'APPLICATION',
        function($scope, $timeout, UserService, SettingsService, ReviewService, APPLICATION){
            $scope.APPLICATION = APPLICATION;

            // Settings and data
            $scope.toast = false;
            $scope.loading = false;
            $scope.blindReview = true;
            $scope.admissions = 0;
            $scope.ratingsRange = [0, 5];
            $scope.reviewersList = [];

            // Display user
            $scope.users = []; // array of userIDs
            $scope.user = {};
            $scope.user.sections = generateSections({
                status: '',
                profile: ''});

            // Rating data
            $scope.ratings = [];
            $scope.comments = '';
            $scope.reviewCriteria = [];

            // Get criteria
            SettingsService
                .getReview()
                .then(response => {
                    $scope.reviewCriteria = response.data.reviewCriteria;
                    $scope.admissions = response.data.admissions;
                    clearCurrentReview();
                });

            // Populate fields
            getReviewQueue();
            getReviewersList();

            $scope.$on('$viewContentLoaded', function() {
                angular.element('#popup')
                    .popup();

                // Need to timeout to properly load element properties
                $timeout(function() {
                    angular.element('.ui.sticky')
                        .sticky({
                            context: '#review'
                        });
                },1000);
            });

            $scope.refresh = function () {
                getReviewQueue();
                getReviewersList();
            };

            $scope.releaseDecisions = function(){
                swal({
                    buttons: {
                        cancel: {
                            text: "Cancel",
                            value: null,
                            visible: true
                        },
                        accept: {
                            className: "danger-button",
                            closeModal: false,
                            text: "Release",
                            value: true,
                            visible: true
                        }
                    },
                    dangerMode: true,
                    icon: "warning",
                    text: "You are about to release all application decisions!",
                    title: "Whoa!"
                }).then(value => {
                    if (!value) {
                        return;
                    }

                    swal({
                        buttons: {
                            cancel: {
                                text: "Cancel",
                                value: null,
                                visible: true
                            },
                            accept: {
                                className: "danger-button",
                                closeModal: false,
                                text: "Actually Release",
                                value: true,
                                visible: true
                            }
                        },
                        dangerMode: true,
                        icon: "warning",
                        text: "Are you ABSOLUTELY SURE? This cannot be undone!!! " +
                            "There will be " + $scope.admissions + " admissions, and the rest will be half waitlisted and half rejected. " +
                            "Decisions will be immediately available, but you'll have to send an email to notify applicants",
                        title: "Are you really sure?"
                    }).then(value => {
                        if (!value) {
                            return;
                        }

                        ReviewService.release()
                            .then(response => {
                                swal('Success!', 'All decisions have been released', 'success');
                            }, err => {
                                swal('Oops!', 'Something went wrong', 'error');
                            })
                    });
                });
            };

            $scope.assignReviews = function(){
                ReviewService.assignReviews()
                    .then(response => {
                        swal('Success!', 'All submissions have been assigned for review', 'success');
                        getReviewQueue();
                    }, err => {
                        swal('Oops!', 'Something went wrong', 'error');
                    })
            };

            $scope.updateReview = function() {
                // check in range
                for(var i = 0; i < $scope.ratings.length; i++){
                    if($scope.ratings[i] === undefined || $scope.ratings[i] < $scope.ratingsRange[0] || $scope.ratings[i] > $scope.ratingsRange[1]){
                        swal('Oops', 'Scores must be between 0 and ' + $scope.ratingsRange, 'error');
                        return;
                    }
                }
                ReviewService.updateReview($scope.user.id, $scope.ratings, $scope.comments)
                    .then(response => {
                        //swal('Great!', 'Review Updated', 'success');
                        // clear for next user
                        clearCurrentReview();
                        // get next user
                        nextUser();
                        $scope.toast = true;
                        $timeout(function(){
                            $scope.toast = false;
                        }, 3000);
                    }, err => {
                        swal('Oops!', 'Something went wrong', 'error');
                    });
            };

            $scope.range = function(min, max, step) {
                step = step || 1;
                var input = [];
                for (var i = min; i <= max; i += step) {
                    input.push(i);
                }
                return input;
            };

            function getReviewQueue(){
                $scope.loading = true;
                ReviewService.getReviewQueue()
                    .then(response => {
                        $scope.users = response.data;
                        nextUser();
                        $scope.loading = false;
                    }, err => {
                        swal('Uh oh!', 'something went wrong, refresh to try again!', 'error');
                    });
            }

            function nextUser(){
                if($scope.users.length > 0){
                    $scope.loading = true;
                    // Get user data
                    UserService.get($scope.users.shift())
                        .then(response => {
                            var user = response.data;
                            $scope.user = user;
                            $scope.user.sections = generateSections(user);
                            $scope.loading = false;
                        }, err => {
                            $scope.loading = false;
                            swal('Uh oh!', 'Something went wrong.', 'error');
                        });
                }
            }

            function getReviewersList(){
                ReviewService.getReviewersList()
                    .then(response => {
                        // sort by reviews
                        $scope.reviewersList = response.data.sort(function(a, b){
                            return b.review.reviewQueue.length - a.review.reviewQueue.length;
                        });
                    });
            }

            function formatTime(time){
                if (time) {
                    return moment(time).format('MMMM Do YYYY, h:mm:ss a');
                }
            }

            function clearCurrentReview(){
                $scope.ratings = new Array($scope.reviewCriteria.length);
                $scope.ratings.fill(0);
                $scope.comments = '';
            }

            function generateSections(user){
                return [
                    {
                        name: 'Basic Info',
                        fields: [
                            {
                                name: 'Created On',
                                value: formatTime(user.timestamp),
                                sensitive: false
                            },{
                                name: 'Last Updated',
                                value: formatTime(user.lastUpdated),
                                sensitive: false
                            },{
                                name: 'Email',
                                value: user.email,
                                sensitive: true
                            },{
                                name: 'Team',
                                value: user.teamCode || 'None',
                                sensitive: false
                            },{
                                name: 'Transportation',
                                value: user.profile.transportation,
                                type: 'boolean',
                                sensitive: false
                            }
                        ]
                    },{
                        name: 'Profile',
                        fields: [
                            {
                                name: 'FirstName',
                                value: user.profile.firstName,
                                sensitive: true,
                            },{
                                name: 'LastName',
                                value: user.profile.lastName,
                                sensitive: true,
                            },{
                                name: 'Gender',
                                value: user.profile.gender,
                                sensitive: true,
                            },{
                                name: 'Ethnicity',
                                value: user.profile.ethnicity,
                                sensitive: true,
                            },{
                                name: 'School',
                                value: user.profile.school,
                                sensitive: true,
                            },{
                                name: 'Year',
                                value: user.profile.year,
                                sensitive: true,
                            },{
                                name: 'Major',
                                value: user.profile.major,
                                sensitive: true,
                            },{
                                name: 'Experience',
                                value: user.profile.experience,
                                sensitive: true,
                            },{
                                name: 'Resume',
                                title: (user.profile.resume ? user.profile.resume.name : ''),
                                value: (user.profile.resume ? user.profile.resume.link : ''),
                                type: 'link',
                                sensitive: false
                            },{
                                name: APPLICATION.ESSAY1_TITLE,
                                value: user.profile.essay1,
                                sensitive: false
                            },{
                                name: APPLICATION.ESSAY2_TITLE,
                                value: user.profile.essay2,
                                sensitive: false
                            },{
                                name: APPLICATION.ESSAY3_TITLE,
                                value: user.profile.essay3,
                                sensitive: false
                            },{
                                name: 'Skills',
                                value: user.profile.skills,
                                sensitive: false
                            },{
                                name: 'LinkedIn',
                                value: user.profile.linkedin,
                                sensitive: false
                            },{
                                name: 'Github',
                                value: user.profile.github,
                                sensitive: false
                            },{
                                name: 'Other',
                                value: user.profile.other,
                                sensitive: false
                            },{
                                name: 'Role',
                                value: (user.profile.role ?
                                    ((user.profile.role.developer ? 'Developer, ' : '')
                                        + (user.profile.role.designer ? 'Designer, ' : '')
                                        + (user.profile.role.productManager ? 'Product Manager, ' : '')
                                        + (user.profile.role.other ? user.profile.other : '')) : ''),
                                sensitive: false
                            }
                        ]
                    },
                ];
            }
        }]);
