const angular = require('angular');
const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
    .controller('AdminReviewCtrl',[
        '$scope',
        'UserService',
        'SettingsService',
        'ReviewService',
        'APPLICATION',
        function($scope, UserService, SettingsService, ReviewService, APPLICATION){
            $scope.APPLICATION = APPLICATION;
            $scope.loading = false;
            $scope.users = []; // array of userIDs
            $scope.user = {};
            $scope.user.sections = generateSections({
                status: '',
                profile: ''});
            $scope.ratings = [0,0,0];
            $scope.comments = '';

            $scope.$on('$viewContentLoaded', function() {
                // Need to settimeout 0 to properly load element properties
                setTimeout(function() {
                    angular.element('.ui.sticky')
                        .sticky({
                            context: '#review'
                        });
                },1000);
            });

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
                    title: "Release?"
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
            };

            $scope.assignReviews = function(){
                ReviewService.assignReviews()
                    .then(response => {
                        swal('Success!', 'All submissions have been assigned for review', 'success');
                    }, err => {
                        swal('Oops!', 'Something went wrong', 'error');
                    })
            };

            $scope.refresh = getReviewQueue;

            $scope.updateReview = function() {
                // check in range
                for(var i = 0; i < $scope.ratings.length; i++){
                    if($scope.ratings[i] < 0 || $scope.ratings[i] > 5){
                        swal('Oops', 'Scores must be between 0 and 5.', 'error');
                        return;
                    }
                }
                ReviewService.updateReview($scope.user._id, $scope.ratings, $scope.comments)
                    .then(response => {
                        //swal('Great!', 'Review Updated', 'success');
                        // clear for next user
                        $scope.user = {};
                        $scope.ratings = [0, 0, 0];
                        $scope.comments = '';
                        // get next user
                        nextUser();
                    }, err => {
                        swal('Oops!', 'Something went wrong', 'error');
                    });
            };

            // Get criteria
            SettingsService
                .getReview()
                .then(response => {
                    $scope.reviewCriteria = response.data.reviewCriteria;
                });

            // Populate queue
            getReviewQueue();

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
                    // Get user data
                    UserService.get($scope.users.shift())
                        .then(response => {
                            var user = response.data;
                            $scope.user = user;
                            $scope.user.sections = generateSections(user);
                        }, err => {
                            swal('Uh oh!', 'Something went wrong.', 'error');
                        });
                }
            }

            function formatTime(time){
                if (time) {
                    return moment(time).format('MMMM Do YYYY, h:mm:ss a');
                }
            }

            function generateSections(user){
                return [
                    {
                        name: 'Basic Info',
                        fields: [
                            {
                                name: 'Created On',
                                value: formatTime(user.timestamp)
                            },{
                                name: 'Last Updated',
                                value: formatTime(user.lastUpdated)
                            },{
                                name: 'Checked In',
                                value: formatTime(user.status.checkInTime) || 'N/A'
                            },{
                                name: 'Email',
                                value: user.email
                            },{
                                name: 'Team',
                                value: user.teamCode || 'None'
                            },{
                                name: 'Transportation',
                                value: user.profile.transportation,
                                type: 'boolean'
                            }
                        ]
                    },{
                        name: 'Profile',
                        fields: [
                            {
                                name: 'Name',
                                value: user.profile.Name
                            },{
                                name: 'FirstName',
                                value: user.profile.firstName
                            },{
                                name: 'LastName',
                                value: user.profile.lastName
                            },{
                                name: 'Gender',
                                value: user.profile.gender
                            },{
                                name: 'Ethnicity',
                                value: user.profile.ethnicity
                            },{
                                name: 'School',
                                value: user.profile.school
                            },{
                                name: 'Year',
                                value: user.profile.year
                            },{
                                name: 'Major',
                                value: user.profile.major
                            },{
                                name: 'Experience',
                                value: user.profile.experience
                            },{
                                name: 'Resume',
                                title: (user.profile.resume ? user.profile.resume.name : ''),
                                value: (user.profile.resume ? user.profile.resume.link : ''),
                                type: 'link'
                            },{
                                name: APPLICATION.ESSAY1_TITLE,
                                value: user.profile.essay1
                            },{
                                name: APPLICATION.ESSAY2_TITLE,
                                value: user.profile.essay2
                            },{
                                name: APPLICATION.ESSAY3_TITLE,
                                value: user.profile.essay3
                            },{
                                name: 'Skills',
                                value: user.profile.skills
                            },{
                                name: 'LinkedIn',
                                value: user.profile.linkedin
                            },{
                                name: 'Github',
                                value: user.profile.github
                            },{
                                name: 'Other',
                                value: user.profile.other
                            },{
                                name: 'Role',
                                value: (user.profile.role ?
                                    ((user.profile.role.developer ? 'Developer, ' : '')
                                        + (user.profile.role.designer ? 'Designer, ' : '')
                                        + (user.profile.role.productManager ? 'Product Manager, ' : '')
                                        + (user.profile.role.other ? user.profile.other : '')) : '')
                            }
                        ]
                    },
                ];
            }
        }]);
