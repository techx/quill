const moment = require('moment');
const swal = require('sweetalert');

angular.module('reg')
  .controller('AdminSponsorsCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'SponsorService',
    function($scope, $state, $stateParams, SponsorService){
      $scope.createText = $stateParams.email;

      $scope.pages = [];
      $scope.sponsors = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      //$('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
    

      $scope.createSponsor = function() {
        var email = $scope.email;
        console.log(email);
        SponsorService
        .createSponsor(email, function(){
          console.log("success!");
        })
        .then(response => {
          swal("Looks good!", "Sponsor Created!", "success");
        });
	  } 

    }]);
