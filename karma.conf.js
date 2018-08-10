// Karma configuration
// Generated on Thu Aug 09 2018 19:31:32 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      "./app/client/plugins/angular/angular.js",
      "./app/client/plugins/angular-mocks/angular-mocks.js",
      "./app/client/plugins/angular-ui-router/release/angular-ui-router.js",
      "./app/client/src/app.js",
      "./app/client/src/interceptors/AuthInterceptor.js",
      "./app/client/src/modules/Session.js",
      "./app/client/src/modules/Utils.js",
      "./app/services/AuthService.js",
      "./app/client/src/services/SettingsService.js",
      "./app/client/src/services/UserService.js",
      "./app/client/src/routes.js",
      "./app/client/src/constants.js",
      "./app/client/views/volunteer/volunteer.html",
      "./app/client/views/volunteer/volunteerCtrl.js",
      "./app/client/views/volunteer/volunteerCtrl.spec.js"
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Safari', 'Firefox', 'IE'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
