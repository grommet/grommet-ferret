var gulp = require('gulp');
var path = require('path');
//var nodemon = require('gulp-nodemon');
//var gulpTasks = require('grommet/utils/gulp/gulp-tasks');
var gulpTasks = require('../grommet/src/utils/gulp/gulp-tasks');

var opts = {
  base: '.',
  dist: path.resolve(__dirname, 'dist/'),
  copyAssets: [
    'src/index.html',
    {
      asset: 'src/img/**',
      dist: 'dist/img/'
    }
  ],
  scssAssets: ['src/scss/**/*.scss'],
  jsAssets: ['src/js/**/*.js'],
  mainJs: 'src/js/index.js',
  mainScss: 'src/scss/index.scss',
  sync: {
    hostname: 'grommet.us.rdlabs.hpecorp.net',
    username: 'ligo',
    remoteDestination: '/var/www/html/examples/ferret/dist'
  },
  webpack: {
    resolve: {
      alias: { // TODO: remove, just for local dev
        'grommet-index/scss': path.resolve(__dirname, '../grommet-index/src/scss'),
        'grommet-index': path.resolve(__dirname, '../grommet-index/src/js'),
        'grommet/scss': path.resolve(__dirname, '../grommet/src/scss'),
        'grommet': path.resolve(__dirname, '../grommet/src/js')
      },
      root: [
        path.resolve(__dirname, 'src/js'),
        path.resolve(__dirname, 'src/scss'),
        path.resolve(__dirname, 'node_modules')
      ]
    }
  },
  devServerPort: 8001,
  // The 8010 port number needs to align with hostName in index.js
  devServerProxy: {
    "/rest/*": 'http://localhost:8010'
  },
  websocketHost: 'localhost:8010'
  //devPreprocess: ['start-backend']
};

/*
gulp.task('start-backend', function() {
  nodemon({
    watch: ["examples/indexer/server"],
    script: path.resolve(__dirname, 'server/server')
  });
});
*/

gulpTasks(gulp, opts);
