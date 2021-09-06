angular.module('reg')
  .controller('AttendeesCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'currentUser',
    'UserService',
    function($scope, $state, $stateParams, currentUser, UserService){

      $scope.currentUser = currentUser.data;
      $scope.pages = [];
      $scope.users = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};

      function updatePage(data){
        $scope.users = data.users;
        $scope.currentPage = data.page;
        $scope.pageSize = data.size;

        console.log(data.users);
        console.log(data.page);
        console.log(data.size);

        var p = [];
        for (var i = 0; i < data.totalPages; i++){
          p.push(i);
        }
        $scope.pages = p;
      }

      UserService
        .getAttendeesPage($stateParams.page, $stateParams.size, $stateParams.query)
        .then(response => {
          updatePage(response.data);
        });

      $scope.$watch('queryText', function(queryText){
        UserService
          .getAttendeesPage($stateParams.page, $stateParams.size, queryText)
          .then(response => {
            updatePage(response.data);
          });
      });

      $scope.goToPage = function(page){
        $state.go('app.attendees', {
          page: page,
          size: $stateParams.size || 50
        });
      };

      $scope.rowClass = function(user) {
        if (user.mentor){
          return 'mentor';
        }
        if (user._id == $scope.currentUser.id) {
          return 'positive';
        }
      };

      function selectUser(user){
        $scope.selectedUser = user;
        $('.long.user.modal')
          .modal('show');
      }

      $scope.selectUser = selectUser;

    }]);
