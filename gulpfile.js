var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
//
gulp.task('js', function(){
   gulp.src('client/scripts/**/*.js')
   .pipe(concat('client.js'))
   .pipe(uglify())
   .pipe(gulp.dest('public/scripts/'));
});
//
gulp.task('css', function(){
   gulp.src('client/styles/*.css')
   .pipe(concat('styles.css'))
   .pipe(minify())
   .pipe(gulp.dest('public/styles/'));
});
//
gulp.task('default',['js','css'],function(){
});
