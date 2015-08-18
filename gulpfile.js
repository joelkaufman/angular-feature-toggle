var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('default', function () {
    return gulp.src('src/angular-feature-toggle.js')
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.extname = ".min.js"
        }))
        .pipe(gulp.dest('dist'));
});