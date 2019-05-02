const angular = require('angular');
const SettingsService = require('./services/SettingsService.js');
const UserService = require('./services/UserService.js');

const AdminCtrl = require('../views/admin/adminCtrl.js');
const AdminSettingsCtrl = require('../views/admin/settings/adminSettingsCtrl.js');
const AdminStatsCtrl = require('../views/admin/stats/adminStatsCtrl.js');
const AdminUserCtrl = require('../views/admin/user/adminUserCtrl.js');
const AdminUsersCtrl = require('../views/admin/users/adminUsersCtrl.js');
const ApplicationCtrl = require('../views/application/applicationCtrl.js');
const ConfirmationCtrl = require('../views/confirmation/confirmationCtrl.js');
const DashboardCtrl = require('../views/dashboard/dashboardCtrl.js');
const LoginCtrl = require('../views/login/loginCtrl.js');
const ResetCtrl = require('../views/reset/resetCtrl.js');
const SidebarCtrl = require('../views/sidebar/sidebarCtrl.js');
const TeamCtrl = require('../views/team/teamCtrl.js');
const VerifyCtrl = require('../views/verify/verifyCtrl.js');

angular.module('reg')
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    function(
      $stateProvider,
      $urlRouterProvider,
      $locationProvider) {

    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/404");

    // Set up de states
    $stateProvider
      .state('login', {
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
      .state('app', {
        views: {
          '': {
            templateUrl: "views/base.html"
          },
          'sidebar@app': {
            templateUrl: "views/sidebar/sidebar.html",
            controller: 'SidebarCtrl',
            resolve: {
              settings: function(SettingsService) {
                return SettingsService.getPublicSettings();
              }
            }
          }
        },
        data: {
          requireLogin: true
        }
      })
      .state('app.dashboard', {
        url: "/",
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
      .state('app.confirmation', {
        url: "/confirmation",
        templateUrl: "views/confirmation/confirmation.html",
        controller: 'ConfirmationCtrl',
        data: {
          requireAdmitted: true
        },
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
  .run($transitions => {
    $transitions.onStart({}, transition => {
      const Session = transition.injector().get("Session");

      var requireLogin = transition.to().data.requireLogin;
      var requireAdmin = transition.to().data.requireAdmin;
      var requireVerified = transition.to().data.requireVerified;
      var requireAdmitted = transition.to().data.requireAdmitted;

      if (requireLogin && !Session.getToken()) {
        return transition.router.stateService.target("login");
      }

      if (requireAdmin && !Session.getUser().admin) {
        return transition.router.stateService.target("app.dashboard");
      }

      if (requireVerified && !Session.getUser().verified) {
        return transition.router.stateService.target("app.dashboard");
      }

      if (requireAdmitted && !Session.getUser().status.admitted) {
        return transition.router.stateService.target("app.dashboard");
      }
    });

    $transitions.onSuccess({}, transition => {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
  });
