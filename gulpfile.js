/**
 * Created by sumedas on 30-Mar-15.
 */
require('shelljs/global');

var gulp             = require('gulp'),
    runSequence      = require('run-sequence'),
    clean            = require('del'),
    templateCache    = require('gulp-angular-templatecache'),
    concat           = require('gulp-concat'),
    uglify           = require('gulp-uglify'),
    minifyCss        = require('gulp-minify-css'),
    rename           = require('gulp-rename'),
    exec             = require('child_process').exec,
    watch            = require('gulp-watch'),
    less             = require('gulp-less');

gulp.task('clean', function (cb) {
    clean(['dist/*', 'dev_dump/*'], cb)
});

gulp.task('build-templates', function () {
    return gulp
        .src('templates/**/*.tpl.html')
        .pipe(templateCache({
            standalone: true,
            module: 'blogViewTemplates'
        }))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-less', function () {
    return gulp
        .src('less/*.less')
        .pipe(less())
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-src', function () {
    return gulp
        .src(['src/blogview.js', 'src/blogview.service.js', 'src/blogview.directive.js',
              'src/blogview.controllers.js', 'dev_dump/templates.js'])
        .pipe(concat('blogview.js'))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-combo-bundle', function () {
    return gulp
        .src([
            'bower_components/angular/angular.js',
            'bower_components/marked/lib/marked.js',
            'bower_components/angular-marked/angular-marked.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-socialshare/angular-socialshare.js',
            'bower_components/angular-utils-disqus/dirDisqus.js',
            'dev_dump/blogview.js'])
        .pipe(concat('blogview.combo.js'))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-combo-css-bundle', function () {
    return gulp
        .src([
            'bower_components/bootstrap-css-only/css/bootstrap.css',
            'bower_components/angular-socialshare/angular-socialshare.css',
            'dev_dump/*.css'
        ])
        .pipe(concat('blogview.combo.css'))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('minify-js', function () {
    return gulp
        .src(['dev_dump/blogview.combo.js', 'dev_dump/blogview.js'])
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function () {
    mkdir('-p', './dist/fonts');
    cp('./bower_components/bootstrap-css-only/fonts/*', './dist/fonts');
    return gulp
        .src(['dev_dump/blogview.combo.css', 'dev_dump/blogview.css'])
        .pipe(minifyCss())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-all', function () {
   runSequence('minify-js', 'minify-css', function () {
       console.log('minification done!');
   });
});

gulp.task('combo', function () {
    runSequence('clean', 'build-templates', 'build-less', 'build-src', 'build-combo-bundle', 'build-combo-css-bundle', 'minify-all');
});

gulp.task('combo-watch', function () {
    watch('src/blogview.js', function () {
        gulp.run('combo');
    });
    watch('templates/*', function () {
        gulp.run('combo');
    });
});

gulp.task('watch', function () {
    watch('src/blogview.js', function () {
        gulp.run('default');
    });
    watch('templates/*', function () {
        gulp.run('default');
    });
});