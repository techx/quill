require('dotenv').load({silent: true});

var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
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

gulp.task('js', function () {
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
    gulp.src(['app/client/src/**/*.js', 'app/client/views/**/*.js'])
      .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        .on('error', swallowError)
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('app/client/build'));
  }

});

gulp.task('sass', function () {
  gulp.src('app/client/stylesheets/site.scss')
    .pipe(sass())
      .on('error', sass.logError)
    .pipe(minifyCss())
    .pipe(gulp.dest('app/client/build'));
});

gulp.task('build', ['js', 'sass'], function(){
  // Yup, build the js and sass.
});

gulp.task('watch', ['js', 'sass'], function () {
  gulp
    .watch('app/client/src/**/*.js', ['js']);
  gulp
    .watch('app/client/views/**/*.js', ['js']);
  gulp
    .watch('app/client/stylesheets/**/*.scss', ['sass']);
});

gulp.task('server', ['watch'], function(){
  nodemon({
    script: 'app.js',
    env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV' },
    watch: [
      'app/server'
    ]
  });
});
