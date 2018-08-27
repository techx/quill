import moment from "moment";

angular.module("reg").factory("Utils", [
    function () {
        return {
            isRegOpen(settings) {
                return Date.now() > settings.timeOpen && Date.now() < settings.timeClose;
            },
            isAfter(time) {
                return Date.now() > time;
            },
            formatTime(time) {
                if (!time) {
                    return "Invalid Date";
                }

                const date = new Date(time);
                // Hack for timezone
                const [,,
                    tz1, tz2, tz3,
                ] = date.toTimeString().split(" ");
                return `${moment(date).format("dddd, MMMM Do YYYY, h:mm a")} ${tz1} ${tz2} ${tz3}`;
            },
        };
    }]);
