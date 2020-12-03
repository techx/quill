angular.module("reg").factory("UserService", [
  "$http",
  "Session",
  function ($http, Session) {
    var users = "/api/users";
    var base = users + "/";

    return {
      // ----------------------
      // Basic Actions
      // ----------------------
      getCurrentUser: function () {
        return $http.get(base + Session.getUserId());
      },

      get: function (id) {
        return $http.get(base + id);
      },

      getAll: function () {
        return $http.get(base);
      },

      getPage: function (page, size, text) {
        return $http.get(
          users +
            "?" +
            $.param({
              text: text,
              page: page ? page : 0,
              size: size ? size : 50,
            })
        );
      },

      updateProfile: function (id, profile) {
        return $http.put(base + id + "/profile", {
          profile: profile,
        });
      },

      updateTheme: function (id, theme) {
        return $http.put(base + id + "/theme", theme);
      },

      updateConfirmation: function (id, confirmation) {
        return $http.put(base + id + "/confirm", {
          confirmation: confirmation,
        });
      },

      declineAdmission: function (id) {
        return $http.post(base + id + "/decline");
      },

      // ------------------------
      // Team
      // ------------------------
      joinOrCreateTeam: function (code) {
        return $http.put(base + Session.getUserId() + "/team", {
          code: code,
        });
      },
      addTeamMates: function (emailAndCode) {
        return $http.put(
          base + Session.getUserId() + "/teammate",
          emailAndCode
        );
      },

      leaveTeam: function () {
        return $http.delete(base + Session.getUserId() + "/team");
      },

      getMyTeammates: function () {
        return $http.get(base + Session.getUserId() + "/team");
      },
      // ------------------------
      // Concept Note Submission
      // ------------------------
      submitNote: function (fileData) {
        return $http.post(base + Session.getUserId() + "/upload", fileData);
      },

      getNote: function (data) {
        return $http.post(base + Session.getUserId() + "/get_note", data);
      },

      // -------------------------
      // Admin Only
      // -------------------------

      getCSV: function () {
        $http.get(base + "exportcsv").then(
          function (data, status, headers) {
            var linkElement = document.createElement("a");
            try {
              linkElement.setAttribute("href", data.data.path);
              linkElement.setAttribute("download", data.data.filename);
              var clickEvent = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: false,
              });
              linkElement.dispatchEvent(clickEvent);
            } catch (ex) {
              console.log(ex);
            }
          },
          function (data) {
            console.log(data);
          }
        );
      },

      getStats: function () {
        return $http.get(base + "stats");
      },

      admitUser: function (id) {
        return $http.post(base + id + "/admit");
      },

      checkIn: function (id) {
        return $http.post(base + id + "/checkin");
      },

      checkOut: function (id) {
        return $http.post(base + id + "/checkout");
      },

      makeAdmin: function (id) {
        return $http.post(base + id + "/makeadmin");
      },

      removeAdmin: function (id) {
        return $http.post(base + id + "/removeadmin");
      },
    };
  },
]);
