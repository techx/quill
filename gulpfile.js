require('dotenv').load({silent: true});

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var browserifyNgAnnotate = require('browserify-ngannotate');
var buffer = require('gulp-buffer');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var log = require('gulplog');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');

var environment = process.env.NODE_ENV;

var nodemon = require('gulp-nodemon');

function swallowError (error) {
    //If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
}

gulp.task('default', function(){
  console.log('yo. use gulp watch or something');
});

gulp.task('js', function (done) {
  if (environment !== 'dev'){
    // Minify for non-development
    gulp.src(['app/client/src/**/*.js', 'app/client/views/**/*.js'])
      .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        .on('error', swallowError)
        .pipe(uglify())
      .pipe(gulp.dest('app/client/build'));
  } else {
    var b = browserify({
        entries: 'app/client/src/app.js',
        // entries: ['./app/client/src/**/*.js', './app/client/views/**/*.js'],
        debug: true,
        // require: ['./node_modules'],
        // require: ['./app/client/src/interceptors', './app/client/src/modules', './app/client/src/services'],
        // require: ['./app/client/src/**/*.js', './app/client/views/**/*.js'],
        transform: [browserifyNgAnnotate]
    });

    // gulp.src(['app/client/src/**/*.js', 'app/client/views/**/*.js'])
    //   // transform file objects using gulp-tap plugin
    //   .pipe(tap(function (file) {
    //
    //     log.info('bundling ' + file.path);
    //
    //     // replace file contents with browserify's bundle stream
    //     file.contents = browserify(file.path, {debug: true}).bundle();
    //
    //   }))

      // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
    return b.bundle()
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
        // .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        .on('error', swallowError)
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('app/client/build'));
  }

  done();
});

gulp.task('sass', function(done) {
  gulp.src('app/client/stylesheets/site.scss')
    .pipe(sass())
      .on('error', sass.logError)
    .pipe(cleanCss())
    .pipe(gulp.dest('app/client/build'));

  done();
});

gulp.task('build', gulp.series('js', 'sass', function(done) {
  // Yup, build the js and sass.
  done();
}));

gulp.task('watch', gulp.series('js', 'sass', function(done) {
  gulp.watch('app/client/src/**/*.js', gulp.series('js'));
  gulp.watch('app/client/views/**/*.js', gulp.series('js'));
  gulp.watch('app/client/stylesheets/**/*.scss', gulp.series('sass'));

  done();
}));

gulp.task('server', gulp.series('watch', function(done) {
  nodemon({
    script: 'app.js',
    env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV' },
    watch: [
      'app/server'
    ]
  });

  done();
}));
