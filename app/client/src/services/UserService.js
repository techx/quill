angular.module('reg')
  .factory('UserService', [
  '$http',
  'Session',
  function($http, Session){

    var users = '/api/users';
    var base = users + '/';

    return {

      // ----------------------
      // Basic Actions
      // ----------------------
      getCurrentUser: function(){
        return Session.getUserId() ? $http.get(base + Session.getUserId()) : '';
      },

      get: function(id){
        return $http.get(base + id);
      },

      getAll: function(){
        return $http.get(base);
      },

      getPage: function(page, size, text){
        return $http.get(users + '?' + $.param(
          {
            text: text,
            page: page ? page : 0,
            size: size ? size : 50
          })
        );
      },

      updateProfile: function(id, profile){
        profile.name = profile.firstname + ' ' + profile.lastname;
        
        return $http.put(base + id + '/profile', {
          profile: profile
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

      // -------------------------
      // Admin Only
      // -------------------------

      getStats: function(){
        return $http.get(base + 'stats');
      },

      getQueue: function(){
        return $http.get(base + 'viewQueue');
      },

      addQueue: function(id){
        return $http.post(base + id + '/queue')
      }, 

      removeQueue: function(id){
        return $http.delete(base + id + '/queue');
      },

      admitQueue: function(id){
        return $http.post(base + 'acceptQueue');
      },
            
      admitUser: function(id){
        return $http.post(base + id + '/admit');
      },

      checkIn: function(id){
        return $http.post(base + id + '/checkin');
      },

      checkOut: function(id){
        return $http.post(base + id + '/checkout');
      },

      markWaiverAsSigned: function(id){
        return $http.post(base + id + '/sign');
      },

      sendAdmittedEmail: function(){
        return $http.post(base + 'emailAdmitted');
      },

      sendWaiverEmail: function(id){
        return $http.post(base + id + '/sendwaiver');
      },

    };
  }
  ]);
