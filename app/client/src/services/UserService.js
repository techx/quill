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
        return $http.get(base + Session.getUserId());
      },

      get: function(id){
        return $http.get(base + id);
      },

      getAll: function(){
        return $http.get(base);
      },

      getAllForForum: function (){
        return $http.get(base + "generalForum");
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
        return $http.put(base + id + '/profile', {
          profile: profile
        });
      },

      updateForums: function(id, forums){
        var forumsArr = [];

        for (let key of forums.keys()) {
          forumsArr.push({
            id: key,
            lastMessage: forums.get(key).lastMessage,
            forumType: forums.get(key).forumType
          });
        }

        return $http.put(base  + 'forums', {
          id: id,
          forums: forumsArr
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


      getMembersByTeam: function(team){
        return $http.get(base + team + '/membersteam');
      },

      // -------------------------
      // Mentors
      // -------------------------

      getMentors: function (){
        return $http.get(base + '/mentors');
      },

      getMentorForumMembers: function(teamName){
        return $http.get(base + teamName + '/mentorforum');
      },


      // ------------------------
      // Grade
      // ------------------------
      addGrade: function(id, grade){
        return $http.put(base + id + '/grades', {
          grade: grade
        });
      },

      getGrades: function(){
        return $http.get(base + 'kaki');
      },

      getTeamNames: function(){
        return $http.get(base + 'teamNames');
      },

      // -------------------------
      // Admin Only
      // -------------------------


      getCSV: function(){
        $http.get(base + 'exportcsv').then(function (data, status, headers) {
        var linkElement = document.createElement('a');
        try {
            linkElement.setAttribute('href', data.data.path);
            linkElement.setAttribute("download", data.data.filename);
            var clickEvent = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            linkElement.dispatchEvent(clickEvent);
        } catch (ex) {
            console.log(ex);
        }

        }, function (data) {
          console.log(data);
        });
      },

      getStats: function(){
        return $http.get(base + 'stats');
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

      makeAdmin: function(id){
        return $http.post(base + id + '/makeadmin');
      },

      removeAdmin: function(id){
        return $http.post(base + id + '/removeadmin');
      },
    };
  }
]);
