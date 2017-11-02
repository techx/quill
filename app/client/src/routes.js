angular.module('reg')
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    function(
      $stateProvider,
      $urlRouterProvider,
      $locationProvider) {

    // For any unmatched url, redirect to /404
    $urlRouterProvider.otherwise("/404");

    // Set up de states
    $stateProvider
      .state('app', {
        views: {
          '': {
            templateUrl: "views/base.html"
          },
          'navbar@app': {
            templateUrl: "views/navbar/navbar.html",
            controller: 'NavbarCtrl',
            resolve: {
              'settings' : function(SettingsService) {
                return SettingsService.getPublicSettings();
              }
            }

          }
        },
        data: {
          requireLogin: true
        }
      })
      .state('app.home', {
        url: "/",
        templateUrl: "views/home/home.html",
        controller: 'HomeCtrl',
        data: {
          requireLogin: false
        }
      })
      .state('app.login', {
        url: "/login",
        templateUrl: "views/login/login.html",
        controller: 'LoginCtrl',
        data: {
          requireLogin: false
        },
        resolve: {
          'settings': function(SettingsService){
            return SettingsService.getPublicSettings();
          }
        }
      })
      .state('app.apply', {
        url: "/apply",
        templateUrl: "views/apply/apply.html",
        controller: 'ApplyCtrl',
        data: {
          requireLogin: false
        },
        resolve: {
          settings: function(SettingsService){
            return SettingsService.getPublicSettings();
          }
        },
      })
      .state('app.dashboard', {
        url: "/dashboard",
        templateUrl: "views/dashboard/dashboard.html",
        controller: 'DashboardCtrl',
        resolve: {
          currentUser: function(UserService){
            return UserService.getCurrentUser();
          },
          settings: function(SettingsService){
            return SettingsService.getPublicSettings();
          }
        },
      })
      .state('app.application', {
        url: "/application",
        templateUrl: "views/application/application.html",
        controller: 'ApplicationCtrl',
        resolve: {
          currentUser: function(UserService){
            return UserService.getCurrentUser();
          },
          settings: function(SettingsService){
            return SettingsService.getPublicSettings();
          }
        }
      })
      .state('app.confirmation', {
        url: "/confirmation",
        templateUrl: "views/confirmation/confirmation.html",
        controller: 'ConfirmationCtrl',
        resolve: {
          currentUser: function(UserService){
            return UserService.getCurrentUser();
          }
        }
      })
      .state('app.team', {
        url: "/team",
        templateUrl: "views/team/team.html",
        controller: 'TeamCtrl',
        data: {
          requireVerified: true
        },
        resolve: {
          currentUser: function(UserService){
            return UserService.getCurrentUser();
          },
          settings: function(SettingsService){
            return SettingsService.getPublicSettings();
          }
        }
      })
      .state('app.admin', {
        views: {
          '': {
            templateUrl: "views/admin/admin.html",
            controller: 'AdminCtrl'
          }
        },
        data: {
          requireAdmin: true
        }
      })
      .state('app.admin.stats', {
        url: "/admin",
        templateUrl: "views/admin/stats/stats.html",
        controller: 'AdminStatsCtrl'
      })
      .state('app.admin.users', {
        url: "/admin/users?" +
          '&page' +
          '&size' +
          '&query',
        templateUrl: "views/admin/users/users.html",
        controller: 'AdminUsersCtrl'
      })
      .state('app.admin.user', {
        url: "/admin/users/:id",
        templateUrl: "views/admin/user/user.html",
        controller: 'AdminUserCtrl',
        resolve: {
          'user': function($stateParams, UserService){
            return UserService.get($stateParams.id);
          }
        }
      })
      .state('app.admin.settings', {
        url: "/admin/settings",
        templateUrl: "views/admin/settings/settings.html",
        controller: 'AdminSettingsCtrl',
      })
      .state('app.sponsor', {
        url: "/sponsor",
        templateUrl: "views/sponsor/sponsor.html",
        controller: 'SponsorCtrl',
        data: {
          requireLogin: false
        }
      })
      .state('reset', {
        url: "/reset/:token",
        templateUrl: "views/reset/reset.html",
        controller: 'ResetCtrl',
        data: {
          requireLogin: false
        }
      })
      .state('verify', {
        url: "/verify/:token",
        templateUrl: "views/verify/verify.html",
        controller: 'VerifyCtrl',
        data: {
          requireLogin: false
        }
      })
      .state('404', {
        url: "/404",
        templateUrl: "views/404.html",
        data: {
          requireLogin: false
        }
      });

    $locationProvider.html5Mode({
      enabled: true,
    });

  }])
  .run([
    '$rootScope',
    '$state',
    '$timeout',
    'Session',
    function(
      $rootScope,
      $state,
      $timeout,
      Session ){

      $rootScope.$on('$stateChangeSuccess', function() {
         $rootScope.fadeOut = false;
         document.body.scrollTop = document.documentElement.scrollTop = 0;
      });

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var requireLogin = toState.data.requireLogin;
        var requireAdmin = toState.data.requireAdmin;
        var requireVerified = toState.data.requireVerified;

        if (toState.name === 'app.apply') {
          event.preventDefault();
          $state.go('app.home');
        }

        if (!$rootScope.fadeOut) {
          event.preventDefault();
          $rootScope.fadeOut = true;

          $timeout(function() {
            $state.go(toState.name, toParams);
          }, 100);
        }

        if (requireLogin && !Session.getToken()) {
          event.preventDefault();
          $state.go('app.login');
        }

        if (requireAdmin && !Session.getUser().admin) {
          event.preventDefault();
          $state.go('app.dashboard');
        }

        if (requireVerified && !Session.getUser().verified){
          event.preventDefault();
          $state.go('app.dashboard');
        }

      });

    }]);