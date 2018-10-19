angular.module("reg").factory("AuthInterceptor", [
    "Session",
    function (Session) {
        return {
            request(config) {
                const token = Session.getToken();
                if (token) {
                    config.headers["x-access-token"] = token;
                }
                return config;
            },
        };
    }]);
