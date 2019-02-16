angular.module("reg").controller("ScheduleCtrl", [
  "$rootScope",
  "$scope",
  "$timeout",
  "$window",
  "$document",
  "$timeout",
  "$http",
  '$location',
  "Utils",
  "EVENT_INFO",
  function(
    $rootScope,
    $scope,
    $timeout,
    $window,
    $document,
    $timeout,
    $http,
    $location,
    Utils,
    EVENT_INFO
  ) {
    var startDate = moment(EVENT_INFO.START_DATE + " " + EVENT_INFO.START_TIME);
    var endDate = moment(EVENT_INFO.END_DATE + " " + EVENT_INFO.END_TIME);
    $scope.currentPath = $location.absUrl() + "#darkGradient"
    $scope.calcCountdown = function() {
      var now = Date.now();
      if (now <= startDate) {
        // countdown to start
        var diff = startDate - now;
        $scope.days = Math.floor(diff / (1000 * 60 * 60 * 24));
        $scope.hours =
          Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) +
          $scope.days * 24;
        $scope.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        $scope.seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if ($scope.minutes < 10) {
          $scope.minutes = "0" + $scope.minutes;
        }

        if ($scope.seconds < 10) {
          $scope.seconds = "0" + $scope.seconds;
        }

        $timeout($scope.calcCountdown, 1000);
      } else if (now <= endDate) {
        console.log("it goes here2");
        // countdown to end
        var diff = endDate - now;
        $scope.days = Math.floor(diff / (1000 * 60 * 60 * 24));
        $scope.hours =
          Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) +
          $scope.days * 24;
        $scope.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        $scope.seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if ($scope.minutes < 10) {
          $scope.minutes = "0" + $scope.minutes;
        }

        if ($scope.seconds < 10) {
          $scope.seconds = "0" + $scope.seconds;
        }

        $timeout($scope.calcCountdown, 1000);
      } else {
        console.log("it goes here3");
        // don't count up!
        $scope.days = 0;
        $scope.hours = "0";
        $scope.minutes = "00";
        $scope.seconds = "00";
      }
    };

    $scope.calcCountdown();

    var originalSchedulePosition, countdownPosition;

    $scope.tintOpacity = 0;

    if ($rootScope.fromState.name === "") {
      originalSchedulePosition =
        document
          .getElementsByClassName("schedule-box")[0]
          .getBoundingClientRect().top - 100;
      countdownPosition =
        document
          .getElementsByClassName("countdown-container")[0]
          .getBoundingClientRect().top - 75;
    } else {
      originalSchedulePosition = document
        .getElementsByClassName("schedule-box")[0]
        .getBoundingClientRect().top;
      countdownPosition =
        document
          .getElementsByClassName("countdown-container")[0]
          .getBoundingClientRect().top + 25;
    }

    $document.on("scroll", function() {
      var schedulePosition = document
        .getElementsByClassName("schedule-box")[0]
        .getBoundingClientRect().top;

      if (schedulePosition <= originalSchedulePosition) {
        // if ((schedulePosition - countdownPosition) >= 0) {
        $scope.$apply(function() {
          $scope.countdownOpacity =
            (schedulePosition - countdownPosition) /
            (originalSchedulePosition - countdownPosition);
        });
        //   $scope.tintOpacity = (1 - $scope.countdownOpacity) / 100 * 25;
        // } else {
        //   $scope.tintOpacity = (1 - $scope.countdownOpacity) / 100 * 25;
        // }
      } else {
        $scope.$apply(function() {
          $scope.countdownOpacity = 1;
        });

        // $scope.tintOpacity = 0;
      }
    });

    $http.get("/assets/schedule.json").then(function(res) {
      $scope.schedule = res.data;
    });
  }
]);
