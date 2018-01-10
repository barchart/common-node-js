const gulp = require('gulp');

const bump = require('gulp-bump'),
    exec = require('child_process').exec,
    git = require('gulp-git'),
    gitStatus = require('git-get-status'),
    jasmine = require('gulp-jasmine'),
    jshint = require('gulp-jshint'),
    runSequence = require('run-sequence'),
    util = require('gulp-util');

const fs = require('fs');

function getVersionFromPackage() {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
}

gulp.task('ensure-clean-working-directory', () => {
    gitStatus(function(err, status) {
        if (err, !status.clean) {
            throw new Error('Unable to proceed, your working directory is not clean.');
        }
    });
});

gulp.task('bump-version', () => {
    return gulp.src([ './package.json' ])
        .pipe(bump({ type: 'patch' }).on('error', util.log))
        .pipe(gulp.dest('./'));
});

gulp.task('document', function (cb) {
	exec('jsdoc . -c jsdoc.json -r -d docs', (error, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);

		cb();
	});
});

gulp.task('commit-changes', () => {
    return gulp.src([ './', './package.json' ])
        .pipe(git.add())
        .pipe(git.commit('Release. Bump version number'));
});

gulp.task('push-changes', (cb) => {
    git.push('origin', 'master', cb);
});

gulp.task('create-tag', (cb) => {
    const version = getVersionFromPackage();

    git.tag(version, 'Release ' + version, function (error) {
        if (error) {
            return cb(error);
        }

        git.push('origin', 'master', { args: '--tags' }, cb);
    });
});

gulp.task('execute-node-tests', () => {
    return gulp.src(['test/specs/**/*.js'])
        .pipe(jasmine());
});

gulp.task('execute-tests', (callback) => {
    runSequence(
        'execute-node-tests',

        function (error) {
            if (error) {
                console.log(error.message);
            }

            callback(error);
        });
});

gulp.task('release', (callback) => {
    runSequence(
        'ensure-clean-working-directory',
        'execute-node-tests',
        'document',
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

gulp.task('lint', () => {
    return gulp.src([ './**/*.js', './test/specs/**/*.js', '!./node_modules/**', '!./test/dist/**', '!./docs/**' ])
        .pipe(jshint({'esversion': 6}))
        .pipe(jshint.reporter('default'));
});

gulp.task('test', [ 'execute-tests' ]);

gulp.task('default', [ 'lint' ]);