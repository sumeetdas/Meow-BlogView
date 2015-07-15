/**
 * Created by sumedas on 30-Mar-15.
 */
var gulp             = require('gulp'),
    runSequence      = require('run-sequence'),
    clean            = require('del'),
    templateCache    = require('gulp-angular-templatecache'),
    concat           = require('gulp-concat'),
    uglify           = require('gulp-uglify'),
    exec             = require('child_process').exec,
    watch            = require('gulp-watch'),
    less             = require('gulp-less');

gulp.task('clean', function (cb) {
    clean(['src/templates.js', 'dist/*'], cb)
});

gulp.task('build-templates', function () {
    return gulp
        .src('templates/**/*.tpl.html')
        .pipe(templateCache({
            standalone: true,
            module: 'blogViewTemplates'
        }))
        .pipe(gulp.dest('src'));
});

gulp.task('build-less', function () {
    return gulp
        .src('less/*.less')
        .pipe(less())
        .pipe(gulp.dest('dist'));
});

gulp.task('build-src', function () {
    return gulp
        .src(['src/blogview.js', 'src/blogview.service.js', 'src/blogview.directive.js',
              'src/blogview.controllers.js', 'src/templates.js'])
        .pipe(concat('blogview.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-bundle', function () {
    return gulp
        .src(['dist/blogview.js'])
        .pipe(concat('blogview.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('build-combo-bundle', function () {
    return gulp
        .src([
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/marked/lib/marked.js',
            'bower_components/angular-marked/angular-marked.min.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-socialshare/angular-socialshare.js',
            'bower_components/angular-utils-disqus/dirDisqus.js',
            'dist/blogview.js'])
        .pipe(concat('blogview.combo.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-combo-css-bundle', function () {
    return gulp
        .src([
            'bower_components/bootstrap-css-only/css/bootstrap.css',
            'bower_components/angular-ui-select/dist/select.css',
            'bower_components/angular-socialshare/angular-socialshare.css',
            'dist/*.css'
        ])
        .pipe(concat('blogview.combo.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', function () {
    runSequence('clean', 'build-templates', 'build-less', 'build-src', 'build-bundle', function () {
        console.log('gulp tasks done!');
    });
});

gulp.task('combo', function () {
    runSequence('clean', 'build-templates', 'build-less', 'build-src', 'build-combo-bundle', 'build-combo-css-bundle', function () {
        exec('cp C:/Users/sumedas/Meow-BlogViewer/dist/* C:/Users/sumedas/Meow-Github/public');
        console.log('gulp tasks done!');
    });
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