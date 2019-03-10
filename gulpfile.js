
var gulp = require('gulp');
var concat = require('gulp-concat');

function scripts() {
  return gulp.src('client/scripts/**/*.js')
    .pipe(concat('client.js'))
    .pipe(gulp.dest('public/scripts/'));
}

function styles() {
  return gulp.src('client/styles/*.css')
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('public/styles/'));
}



function defaultTask(cb) {
  // place code for your default task here

  scripts();

  styles();

  cb();
}

exports.scripts = scripts;

exports.default = defaultTask;