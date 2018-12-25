angular.module('reg')
  .controller('AdminQueueCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    '$http',
    '$window',
    function($scope, $state, $stateParams, UserService, $http, $window){
      $scope.pages = [];
      $scope.users = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();

      UserService
        .getAll()
        .success(function(data){
          $scope.users = data;
        });

      $scope.$watch('queryText', function(queryText){
        UserService
          .getPage($stateParams.page, $stateParams.size, queryText)
          .success(function(data){

          });
      });

      $scope.removeFromQueue = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "Whoa, wait a minute!",
          text: "You are about to remove " + user.profile.name + " from the queue!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, remove them.",
          closeOnConfirm: false
          }, function(){
              UserService
              .removeQueue(user._id)
              .success(function(user){
                $scope.users[index] = user;
                swal("Removed", user.profile.name + ' has been removed from the queue.', "success");
              });
          });
      }
    }]);