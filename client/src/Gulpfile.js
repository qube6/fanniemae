'use strict';
//should correspond to what's in package.json
var gulp    = require('gulp'),
    gutil   = require('gulp-util'),
    jslint  = require('gulp-jslint'),
    sass    = require('gulp-sass'),
    compass    = require('gulp-compass'),
    jade    = require('gulp-jade'),
    notify  = require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    include = require('gulp-include'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    changed = require('gulp-changed'),
    path = require('path'),
    plumber = require('gulp-plumber'),
    bowerFiles = require('main-bower-files'),
    inject = require('gulp-inject'),
    es = require('event-stream');


gulp.task('lint', function() {
  gulp.src(['./js/*.js', '!./bower_components/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('scripts', function() {
  gulp.src(['./js/*.js','./components/**/*.js'])
    .pipe(plumber())
    .pipe(include())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('../build/js'));
});

// gulp.task('styles', function() {
//   gulp.src(['./components/**/*.scss'])
//     .pipe(concat('components-temp.scss'))
//     .pipe(gulp.dest('./scss'));

//   gulp.src(['./scss/style.scss'])
//     .pipe(concat('style.scss'))
//     .pipe(sass({onError: function(e) { console.log(e); } }))
//     .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
//     .pipe(gulp.dest('../build/styles/'));
// });

gulp.task('styles', function() {
  gulp.src(['./components/**/*.scss'])
    .pipe(concat('components-temp.scss'))
    .pipe(gulp.dest('./scss'));
  
  gulp.src('./scss/style.scss')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(compass({
      css: 'static-css/',
      sass: 'scss/'
    }))
    .pipe(gulp.dest('../build/styles/'));
});


gulp.task('markup', function() {
  gulp.src(['./templates/pages/**/*.jade','./templates/*.jade'])
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('../temp/html'));
});


gulp.task('server', function() {
  connect.server({
    livereload: false,
    root: '../build'
  });
});

gulp.task('copy-data', function() {
  gulp.src('./data/*.json')
    .pipe(changed('./data/*.json'))
    .pipe(gulp.dest('../build/data'));
});

gulp.task('copy-lib', function() {
  gulp.src('./js/lib/*')
    .pipe(changed('./js/lib/*'))
    .pipe(gulp.dest('../build/js/lib'));
  gulp.src('./bower_components/**')
    .pipe(gulp.dest('../build/js/lib/bower_components'));
});

gulp.task('copy-media', function() {
  gulp.src('./media/**/*')
    .pipe(changed('./media/**/*'))
    .pipe(gulp.dest('../build/media'));
});

gulp.task('copy-css', function() {
  gulp.src('./static-css/*.css')
    .pipe(changed('./static-css/*.css'))
    .pipe(gulp.dest('../build/styles/'));
});

/* Compile Jade Files, Styles, Scripts, and Libs, then inject all scripts into html */
gulp.task('markup-scripts', ['styles', 'markup', 'scripts', 'copy-css', 'copy-lib'], function(){ 
    var target = gulp.src(['../temp/html/*.html', '../temp/html/**/*.html']);
    var sources = gulp.src(['../build/styles/*.css', '../build/js/*.js'], {read: false});
    var bower = gulp.src(bowerFiles({ paths: { bowerDirectory: '../build/js/lib/bower_components' } }), {read: false});

    target
      .pipe(inject(bower, {name: 'bower', ignorePath: '../build'}))
      .pipe(inject(sources, {ignorePath: '../build'}))
      .pipe(gulp.dest('../build/html'));
});
 

gulp.task('watch', function() {

  gulp.watch([  './components/**/*.jade',
                './templates/**/*.jade',
                './templates/pages/index.jade',
                './templates/pages/**/*.jade',
                './templates/layouts/*.jade'
              ], ['markup-scripts']);
  
  //style sheets
  gulp.watch([  './scss/*.scss',
                './components/**/*.scss', 
                '!./scss/components-temp.scss'
              ], ['styles']);
  
  //plain old copy stuff over
  gulp.watch('./js/lib/*.js', ['copy-lib']);
  gulp.watch('./data/*.json', ['copy-data']);
  gulp.watch('./static-css/*.css', ['copy-css']);
  gulp.watch('./media/*', ['copy-media']);

  //scripts
  gulp.watch([  './js/*.js',
                './components/**/*.js',
                './templates/pages/**/*.js'
              ], ['scripts']);

});

gulp.task('default', ['markup-scripts', 'server', 'copy-data', 'copy-media', 'watch' ]);


