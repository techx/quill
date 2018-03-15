require('dotenv').load({silent: true});

var gulp = require('gulp');
var replace = require('gulp-replace');
var ifElse = require('gulp-if-else');
var url = require("url");
var root_path = url.parse(process.env.ROOT_URL).pathname;
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

gulp.task('inject-base-href', function() {
  return gulp.src('app/client/src/index.html')
    .pipe(replace('<base href="/">', function(match) {
      console.log('Replace called on', match);
        return '<base href="' + root_path + '/">'
     }
     ))
    .pipe(gulp.dest('app/client'));
});

gulp.task('js', function () {
  console.log(root_path);
  gulp.src(['app/client/src/**/*.js', 'app/client/views/**/*.js'])
    .pipe(replace('var base = \'\'', 'var base = \'' + root_path + '\''))
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
      .pipe(ngAnnotate())
      .on('error', swallowError)
      .pipe( ifElse(environment !== 'dev', uglify, sourcemaps.write) )
    .pipe(gulp.dest('app/client/build'));

});

gulp.task('sass', function () {
  gulp.src('app/client/stylesheets/site.scss')
    .pipe(sass())
      .on('error', sass.logError)
    .pipe(minifyCss())
    .pipe(gulp.dest('app/client/build'));
});

gulp.task('build', ['js', 'sass', 'inject-base-href'], function(){
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

gulp.task('server', ['watch', 'inject-base-href'], function(){
  nodemon({
    script: 'app.js',
    env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV' },
    watch: [
      'app/server'
    ]
  });
});
