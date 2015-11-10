'use strict';

var gulp = require('gulp'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    sass = require('gulp-sass'),
    assign = require('object-assign'),
    del = require('del');

var customOptions = {
    entries: ['./client/js/app.js'],
    debug: true,
    transform: [reactify]
};
var options = assign({}, watchify.args, customOptions);
var b = watchify(browserify(options));

gulp.task('javascript', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

function bundle() {
    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'browserify error'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./dist/js'));
}

gulp.task('clean', function(callback) {
    del([
        'dist/js/*',
        'dist/css/*'
    ], callback);
});

gulp.task('sass', function() {
    gulp.src('./client/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', ['clean'], function() {
    var watching = false;
    gulp.start('javascript', 'sass', function() {
        if (!watching) {
            watching = true;

            gulp.watch('client/scss/*.scss', ['sass']);

            nodemon({
                script: 'server.js',
                ignore: ["config/*"]
            });
        }
    });
});

gulp.task('default', ['watch']);
