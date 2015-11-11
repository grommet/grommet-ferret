// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var gulp = require('gulp');
var rsync = require('gulp-rsync');
var nodemon = require('gulp-nodemon');

gulp.task('sync', function() {
  gulp.src('.')
    .pipe(rsync({
      root: '.',
      hostname: 'grommet.us.rdlabs.hpecorp.net',
      username: 'ligo',
      destination: '/var/www/html/examples/ferret/server',
      recursive: true,
      relative: true,
      progress: true,
      incremental: true,
      clean: true,
      silent: true,
      emptyDirectories: true,
      exclude: ['.DS_Store', 'node_modules']
    }));
});

gulp.task('dev', function() {
  nodemon({
    script: 'server.js'
  });
});
