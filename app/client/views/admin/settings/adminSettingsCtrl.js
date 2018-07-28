import moment from "moment";
import showdown from "showdown";
import sweetAlert from "sweetalert";

// Showdown Markdown => HTML converter
const converter = new showdown.Converter();

angular.module("reg").controller("AdminSettingsCtrl", [
    "$scope",
    "$sce",
    "SettingsService",
    function ($scope, $sce, SettingsService) {
        $scope.settings = {};
        SettingsService
            .getPublicSettings()
            .success((settings) => {
                updateSettings(settings);
            });

        function updateSettings(settings) {
            $scope.loading = false;
            // Format the dates in settings.
            settings.timeOpen = new Date(settings.timeOpen);
            settings.timeClose = new Date(settings.timeClose);
            settings.timeConfirm = new Date(settings.timeConfirm);

            $scope.settings = settings;
        }

        // Additional Options --------------------------------------

        $scope.updateAllowMinors = function () {
            SettingsService
                .updateAllowMinors($scope.settings.allowMinors)
                .success((data) => {
                    $scope.settings.allowMinors = data.allowMinors;
                    const successText = $scope.settings.allowMinors
                        ? "Minors are now allowed to register."
                        : "Minors are no longer allowed to register.";
                    sweetAlert("Looks good!", successText, "success");
                });
        };

        // Whitelist --------------------------------------

        SettingsService
            .getWhitelistedEmails()
            .success((emails) => {
                $scope.whitelist = emails.join(", ");
            });

        $scope.updateWhitelist = function () {
            SettingsService
                .updateWhitelistedEmails($scope.whitelist.replace(/ /g, "").split(","))
                .success((settings) => {
                    sweetAlert("Whitelist updated.");
                    $scope.whitelist = settings.whitelistedEmails.join(", ");
                });
        };

        // Registration Times -----------------------------

        $scope.formatDate = function (date) {
            if (!date) {
                return "Invalid Date";
            }

            // Hack for timezone
            return `${moment(date).format("dddd, MMMM Do YYYY, h:mm a")
            } ${date.toTimeString().split(" ")[2]}`;
        };

        // Take a date and remove the seconds.
        function cleanDate(date) {
            return new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
            );
        }

        $scope.updateRegistrationTimes = function () {
            // Clean the dates and turn them to ms.
            const open = cleanDate($scope.settings.timeOpen).getTime();
            const close = cleanDate($scope.settings.timeClose).getTime();

            if (open < 0 || close < 0 || open === undefined || close === undefined) {
                return sweetAlert("Oops...", "You need to enter valid times.", "error");
            }
            if (open >= close) {
                sweetAlert("Oops...", "Registration cannot open after it closes.", "error");
                return;
            }

            SettingsService.updateRegistrationTimes(open, close).success((settings) => {
                updateSettings(settings);
                sweetAlert("Looks good!", "Registration Times Updated", "success");
            });
        };

        // Confirmation Time -----------------------------

        $scope.updateConfirmationTime = function () {
            const confirmBy = cleanDate($scope.settings.timeConfirm).getTime();

            SettingsService.updateConfirmationTime(confirmBy).success((settings) => {
                updateSettings(settings);
                sweetAlert("Sounds good!", "Confirmation Date Updated", "success");
            });
        };

        // Acceptance / Confirmation Text -------
        $scope.markdownPreview = function (text) {
            return $sce.trustAsHtml(converter.makeHtml(text));
        };

        $scope.updateWaitlistText = function () {
            const text = $scope.settings.waitlistText;
            SettingsService.updateWaitlistText(text).success((data) => {
                sweetAlert("Looks good!", "Waitlist Text Updated", "success");
                updateSettings(data);
            });
        };

        $scope.updateAcceptanceText = function () {
            const text = $scope.settings.acceptanceText;
            SettingsService.updateAcceptanceText(text).success((data) => {
                sweetAlert("Looks good!", "Acceptance Text Updated", "success");
                updateSettings(data);
            });
        };

        $scope.updateConfirmationText = function () {
            const text = $scope.settings.confirmationText;
            SettingsService.updateConfirmationText(text).success((data) => {
                sweetAlert("Looks good!", "Confirmation Text Updated", "success");
                updateSettings(data);
            });
        };
    }]);
