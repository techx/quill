angular.module('reg')
  .controller('AdminQueueCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    '$http',
    '$window',
    function($scope, $state, $stateParams, UserService, $http, $window){
      $scope.stats = [];
      $scope.users = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();

      UserService
        .getQueue()
        .success(function(data){
          $scope.stats = data.stats;
          $scope.users = data.users;
        });

      $scope.acceptAllFromQueue = function($event, user, index) {
        swal({
          title: "Whoa, wait a minute!",
          text: "You are about to accept all users from the queue!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, accept them.",
          closeOnConfirm: false
          }, function(){

            swal({
              title: "Are you sure?",
              text: "Your account will be logged as having accepted all users from the queue. " +
                "Remember, this power is a privilege.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, accept the queued users.",
              closeOnConfirm: false
              }, function(){

                UserService
                  .admitUser(user._id)
                  .success(function(user){
                    $scope.users[index] = user;
                    swal("Accepted", "All queued users have been accepted!", "success");
                  });

              });

        });
      }

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