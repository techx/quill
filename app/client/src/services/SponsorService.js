angular.module('reg')
  .factory('SponsorService', [
  '$http',
  function($http){

    var base = '/api/settings/';

    return {
      createSponsor: function(email, callback){
        return $http.get(base + "newSponsor", {
            email: email,
            callback: callback
        });
      }
    };
}
]);