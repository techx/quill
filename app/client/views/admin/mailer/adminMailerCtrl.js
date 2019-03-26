const showdown = require('showdown');
const swal = require('sweetalert');

angular.module('reg')
    .controller('AdminMailerCtrl', [
        '$scope',
        '$sce',
        'MailService',
        'UserService',
        function ($scope, $sce, MailService, UserService) {

            $scope.sender = 'team@hacksc.com';
            $scope.recipient = 'verified';
            $scope.customRecipients = [];
            $scope.schoolRecipient = 'all';
            $scope.mailTitle = '';
            $scope.mailText = '';

            $scope.senderOptions = [
                'team@hacksc.com',
                'noreply@hacksc.com',
                'outreach@hacksc.com'
            ];

            $scope.recipientOptions = [
                'unverified',
                'verified',
                'verified and not submitted',
                'submitted',
                'admitted',
                'rejected',
                'waitlisted',
                'admitted and not confirmed',
                'confirmed',
                'confirmed and need transporation',
                'custom'
            ];

            // Load Schools Dropdown
            UserService.getStats().then(stats => {
               $scope.schools = stats.data.demo.schools;
            });

            // HTML Preview
            var converter = new showdown.Converter();
            $scope.markdownPreview = function (text) {
                return $sce.trustAsHtml(converter.makeHtml(text));
            };

            // Send Mass Mail
            $scope.sendMail = function (title, text) {
                // Check email
                if (title == null || title === '') {
                    swal('Title is empty', 'Please fill out the title!', 'warning');
                    return;
                } else if (text == null || text === '') {
                    swal('Body is empty', 'Please fill out the body!', 'warning');
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
                            text: "Send",
                            value: true,
                            visible: true
                        }
                    },
                    dangerMode: true,
                    icon: "warning",
                    text: "You are about to send a mass email, to hundreds of applicants",
                    title: "Send?"
                }).then(value => {
                    if (!value) {
                        return;
                    }

                    var recipients = ($scope.recipient === 'custom') ? $scope.customRecipients.replace(/ /g, '').split(',') : $scope.recipient;
                    console.log(recipients);
                    MailService.sendMail($scope.sender, title, text, recipients, $scope.schoolRecipient)
                        .then(response => {
                            swal('Success', 'Mail has been queued and are being sent out', 'success');
                        }, err => {
                            swal('Error', err, 'error');
                        });
                });
            }

        }]);
