angular.module("reg").factory("SettingsService", ["$http", function ($http) {
    const base = "/api/settings/";

    return {
        getPublicSettings() {
            return $http.get(base);
        },
        updateRegistrationTimes(open, close) {
            return $http.put(`${base}times`, {
                timeOpen: open,
                timeClose: close,
            });
        },
        updateConfirmationTime(time) {
            return $http.put(`${base}confirm-by`, {
                time,
            });
        },
        getWhitelistedEmails() {
            return $http.get(`${base}whitelist`);
        },
        updateWhitelistedEmails(emails) {
            return $http.put(`${base}whitelist`, {
                emails,
            });
        },
        updateWaitlistText(text) {
            return $http.put(`${base}waitlist`, {
                text,
            });
        },
        updateAcceptanceText(text) {
            return $http.put(`${base}acceptance`, {
                text,
            });
        },
        updateConfirmationText(text) {
            return $http.put(`${base}confirmation`, {
                text,
            });
        },
        updateAllowMinors(allowMinors) {
            return $http.put(`${base}minors`, {
                allowMinors,
            });
        },
    };
},
]);
