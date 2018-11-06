require('dotenv').load({silent: true});

var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
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
    gulp.src(['app/client/src/**/*.js', 'app/client/views/**/*.js'])
      .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
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
