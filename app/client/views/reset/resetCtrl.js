const swal = require('sweetalert');

angular.module('reg')
  .controller('ResetCtrl', [
    '$scope',
    '$stateParams',
    '$state',
    'AuthService',
    function($scope, $stateParams, $state, AuthService){
      var token = $stateParams.token;

      $scope.loading = true;

      $scope.changePassword = function(){
        var password = $scope.password;
        var confirm = $scope.confirm;

        if (password !== confirm){
          $scope.error = "两次新密码输入不一致";
          $scope.confirm = "";
          return;
        }

        AuthService.resetPassword(
          token,
          $scope.password,
          message => {
            swal("重置成功!", "你的密码已经被修改", "success").then(value => {
              $state.go("login");
            });
          },
          data => {
            $scope.error = data.message;
            $scope.loading = false;
        });
      };
    }]);
