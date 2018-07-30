                    return $http.get(base);
angular.module("reg").factory("UserService", [
    "$http",
    "Session",
    function ($http, Session) {
        const users = "/api/users";
        const base = `${users}/`;

        return {

            // ----------------------
            // Basic Actions
            // ----------------------
            getCurrentUser() {
                return $http.get(base + Session.getUserId());
            },

            get(id) {
                return $http.get(base + id);
            },

            getAll() {
                return $http.get(base);
            },

            getPage(page, size, text) {
                return $http.get(`${users}?${$.param(
                    {
                        text,
                        page: page || 0,
                        size: size || 50,
                    },
                )}`);
            },

            updateProfile(id, profile) {
                return $http.put(`${base + id}/profile`, {
                    profile,
                });
            },

            updateConfirmation(id, confirmation) {
                return $http.put(`${base + id}/confirm`, {
                    confirmation,
                });
            },

            declineAdmission(id) {
                return $http.post(`${base + id}/decline`);
            },

            // ------------------------
            // Team
            // ------------------------
            joinOrCreateTeam(code) {
                return $http.put(`${base + Session.getUserId()}/team`, {
                    code,
                });
            },

            leaveTeam() {
                return $http.delete(`${base + Session.getUserId()}/team`);
            },

            getMyTeammates() {
                return $http.get(`${base + Session.getUserId()}/team`);
            },

            // -------------------------
            // Admin Only
            // -------------------------

            getStats() {
                return $http.get(`${base}stats`);
            },

            admitUser(id) {
                return $http.post(`${base + id}/admit`);
            },

            checkIn(id) {
                return $http.post(`${base + id}/checkin`);
            },

            checkOut(id) {
                return $http.post(`${base + id}/checkout`);
            },

        };
    },
]);
