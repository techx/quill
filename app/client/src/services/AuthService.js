angular.module("reg").factory("AuthService", [
    "$http",
    "$rootScope",
    "$state",
    "$window",
    "Session",
    function ($http, $rootScope, $state, $window, Session) {
        const authService = {};

        function loginSuccess(data, cb) {
            // Winner winner you get a token
            Session.create(data.token, data.user);

            if (cb) {
                cb(data.user);
            }
        }

        function loginFailure(data, cb) {
            $state.go("login");
            if (cb) {
                cb(data);
            }
        }

        function registerFailure(data, cb) {
            $state.go("register");
            if (cb) {
                cb(data);
            }
        }

        authService.loginWithPassword = function (email, password, onSuccess, onFailure) {
            return $http
                .post("/auth/login", {
                    email,
                    password,
                })
                .success((data) => {
                    loginSuccess(data, onSuccess);
                })
                .error((data) => {
                    loginFailure(data, onFailure);
                });
        };

        authService.loginWithToken = function (token, onSuccess, onFailure) {
            return $http
                .post("/auth/login", {
                    token,
                })
                .success((data) => {
                    loginSuccess(data, onSuccess);
                })
                .error((data, statusCode) => {
                    console.log(data, statusCode);
                    if (statusCode === 400) {
                        Session.destroy(loginFailure);
                    }
                });
        };

        authService.logout = function (callback) {
            // Clear the session
            Session.destroy(callback);
            $state.go("login");
        };

        authService.register = function (email, password, onSuccess, onFailure) {
            return $http
                .post("/auth/register", {
                    email,
                    password,
                })
                .success((data) => {
                    loginSuccess(data, onSuccess);
                })
                .error((data) => {
                    registerFailure(data, onFailure);
                });
        };

        authService.verify = function (token, onSuccess, onFailure) {
            return $http
                .get(`/auth/verify/${token}`)
                .success((user) => {
                    Session.setUser(user);
                    if (onSuccess) {
                        onSuccess(user);
                    }
                })
                .error((data) => {
                    if (onFailure) {
                        onFailure(data);
                    }
                });
        };

        authService.resendVerificationEmail = function (onSuccess, onFailure) {
            return $http
                .post("/auth/verify/resend", {
                    id: Session.getUserId(),
                });
        };

        authService.sendResetEmail = function (email) {
            return $http
                .post("/auth/reset", {
                    email,
                });
        };

        authService.resetPassword = function (token, pass, onSuccess, onFailure) {
            return $http
                .post("/auth/reset/password", {
                    token,
                    password: pass,
                })
                .success(onSuccess)
                .error(onFailure);
        };

        return authService;
    },
]);
