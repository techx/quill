const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
    .controller('AdminReviewCtrl',[
        '$scope',
        'UserService',
        'ReviewService',
        'APPLICATION',
        function($scope, UserService, ReviewService, APPLICATION){
            $scope.empty = true;

            $scope.user = {};
            $scope.users = []; // array of userIDs

            $scope.APPLICATION = APPLICATION;

            $scope.user = {};
            $scope.user.sections = generateSections({
                status: '',
                profile: ''});

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
                ReviewService.updateReview($scope.user.id, $scope.rating, $scope.comment)
                    .then(response => {
                        swal('Great!', 'Review Updated', 'success');
                        nextUser();
                    }, err => {
                        swal('Oops!', 'Something went wrong', 'error');
                    });
            };

            getReviewQueue();

            function getReviewQueue(){
                ReviewService.getReviewQueue()
                    .then(response => {
                        $scope.users = response.data;
                        $scope.empty = response.data === undefined || response.data.length === 0;
                        nextUser();
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
                    $scope.empty = $scope.users.length > 0;
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
