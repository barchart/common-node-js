var gulp = require('gulp');

var bump = require('gulp-bump');
var git = require('gulp-git');
var gitModified = require('gulp-gitmodified');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var util = require('gulp-util');

var fs = require('fs');

function getVersionFromPackage() {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
}

function getVersionForComponent() {
    return getVersionFromPackage().split('.').slice(0, 2).join('.');
}

gulp.task('ensure-clean-working-directory', function() {
    return gulp.src('./**/*')
        .pipe(gitModified('M', 'A', 'D', 'R', 'C', 'U', '??'))
        .on('data', function (file) {
            if (file) {
                throw new Error('Unable to proceed, your working directory is not clean.');
            }
        });
});

gulp.task('bump-version', function () {
    return gulp.src([ './package.json' ])
        .pipe(bump({ type: 'patch' }).on('error', util.log))
        .pipe(gulp.dest('./'));
});

gulp.task('commit-changes', function () {
    return gulp.src([ './', './dist/' ])
        .pipe(git.add())
        .pipe(gitModified('M', 'A'))
        .pipe(git.commit('Release. Bump version number'));
});

gulp.task('push-changes', function (cb) {
    git.push('origin', 'master', cb);
});

gulp.task('create-tag', function (cb) {
    var version = getVersionFromPackage();

    git.tag(version, 'Release ' + version, function (error) {
        if (error) {
            return cb(error);
        }

        git.push('origin', 'master', { args: '--tags' }, cb);
    });
});

gulp.task('execute-node-tests', function () {
    return gulp.src(['index.js', 'test/specs/**/*.js'])
        .pipe(jasmine());
});

gulp.task('execute-tests', function (callback) {
    runSequence(
        'execute-node-tests',

        function (error) {
            if (error) {
                console.log(error.message);
            }

            callback(error);
        });
});

gulp.task('release', function (callback) {
    runSequence(
        'ensure-clean-working-directory',
        'execute-node-tests',
        'bump-version',
        'commit-changes',
        'push-changes',
        'create-tag',

        function (error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log('Release complete');
            }

            callback(error);
        });
});

gulp.task('lint', function() {
    return gulp.src([ './**/*.js', './test/specs/**/*.js', '!./node_modules/**', '!./test/dist/**' ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('test', [ 'execute-tests' ]);

gulp.task('default', [ 'lint' ]);