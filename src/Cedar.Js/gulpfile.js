var gulp = require('gulp'),
    karma = require('gulp-karma'),
    mergeStreams = require('merge-stream'),
    fs = require('fs');

// gulp.task('watch', function () {
//     gulp.watch([
//     		basePath + '/eVision.IdentityManagement/WebUI/app/**/*.js',
//     		basePath + '/eVision.IdentityManagement.Tests/WebUI/app/**/*.js',
//     ], [ 'scripts', 'karma', 'jshint' ]);

//     gulp.watch(basePath + '/eVision.IdentityManagement/WebUI/less/**/*.less', ['less']);
// });

gulp.task('jsTests', function () {
    
    return gulp.src(['./fake/*.js'])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        })).on('error', function (err) {
            console.log(err)
        });
});

// gulp.task('watch.tests', function () {
//     var testProjectPath = process.cwd().split('/').slice(-1) + '.Tests';
//     gulp.watch(testProjectPath + '/WebUI/**/*.js', ['karma']);
// });

gulp.task('compile', [ 'jsTests']);