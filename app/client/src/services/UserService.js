angular.module('reg')
  .factory('UserService', [
  '$http',
  'Session',
  function($http, Session){

    var users = '/api/users';
    var base = users + '/';

    function sponsorSuccess(data, cb){
       if(cb) 
        cb(data);
    }
    function sponsorFailure(data, cb){
        console.log("failed!");
    }

    return {

      // ----------------------
      // Basic Actions
      // ----------------------
      getCurrentUser: function(){
        return $http.get(base + Session.getUserId());
      },

      get: function(id){
        return $http.get(base + id);
      },

      getAll: function(){
        return $http.get(base);
      },

      getPage: function(page, size, text, gradYears, skills){
        return $http.get(users + '?' + $.param(
          {
            text: text,
            grad: gradYears,
            skills: skills,
            page: page ? page : 0,
            size: size ? size : 50
          })
        );
      },

      updateProfile: function(id, profile){
        return $http.put(base + id + '/profile', {
          profile: profile
        });
      },

      getResume: function(id) {
        return $http.get(base + id + '/resume');
      },

      uploadResume: function(id, resume){
        var formData = new FormData();
        formData.append('resume', resume);
        return $http.put(base + id + '/resume', formData, {
          withCredentials: true,
          headers: {'Content-Type': undefined},
          transformRequest: angular.identity
        });
      },

      updateConfirmation: function(id, confirmation){
        return $http.put(base + id + '/confirm', {
          confirmation: confirmation
        });
      },

      declineAdmission: function(id){
        return $http.post(base + id + '/decline');
      },

      // ------------------------
      // Team
      // ------------------------
      joinOrCreateTeam: function(code){
        return $http.put(base + Session.getUserId() + '/team', {
          code: code
        });
      },

      leaveTeam: function(){
        return $http.delete(base + Session.getUserId() + '/team');
      },

      getMyTeammates: function(){
        return $http.get(base + Session.getUserId() + '/team');
      },

      // -------------------------
      // Admin Only
      // -------------------------

      getStats: function(){
        return $http.get(base + 'stats');
      },

      admitUser: function(id){
        return $http.post(base + id + '/admit');
      },

      grantResumeAccess: function(id){
        return $http.post(base + id + '/grantresumeaccess');
      },

      removeResumeAccess: function(id){
        return $http.post(base + id + '/removeresumeaccess');
      },

      checkIn: function(id){
        return $http.post(base + id + '/checkin');
      },

      checkOut: function(id){
        return $http.post(base + id + '/checkout');
      },

      makeAdmin: function(id){
        return $http.post(base + id + '/makeadmin');
      },

      removeAdmin: function(id){
        return $http.post(base + id + '/removeadmin');
      },


      createWalkin: function(email){
        return $http.post(base + 'createwalkin', {
          email: email
        });
      },

      newSponsor: function(email, onSuccess, onFailure) {
        return $http
          .post(base + 'newsponsor', {
            email: email,
          })
          .then(response => {
            sponsorSuccess(response.data, onSuccess);
          }, response => {
            sponsorFailure(response.data, onFailure);
          })
          .catch(function onError(error) {
            console.log(error);         
          });
      },

      makeSponsor: function(id){
        return $http.post(base + id + '/makesponsor');

      },
    };
  }
  ]);
