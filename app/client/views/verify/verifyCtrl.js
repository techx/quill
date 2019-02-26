angular.module('reg')
    .controller('VerifyCtrl', [
        '$scope',
        '$stateParams',
        'AuthService',
        'MailService',
        function ($scope, $stateParams, AuthService, MailService) {
            var token = $stateParams.token;

            $scope.loading = true;

            if (token) {
                AuthService.verify(token,
                    function (user) {
                        $scope.success = true;
                        $scope.loading = false;
                        // send mail once verified
                        sendPostVerificationEmail(user.email);
                    },
                    function (err) {
                        $scope.loading = false;
                    });
            }

            function sendPostVerificationEmail(recipient){
                MailService.sendPostVerificationEmail(recipient)
                    .then(response => {
                        // success
                    }, err => {
                        console.log('error sending additional email');
                    });
            }
        }]);
