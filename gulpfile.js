var argv = require('yargs').argv;
var gulp = require('gulp');
var path = require('path');
//var nodemon = require('gulp-nodemon');
var gulpTasks = require('grommet/utils/gulp/gulp-tasks');
var git = require('gulp-git');
var del = require('del');
var mkdirp = require('mkdirp');

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
  websocketHost: 'localhost:8010',
  alias: {
    'grommet-index/scss': path.resolve(__dirname, '../grommet-index/src/scss'),
    'grommet-index': path.resolve(__dirname, '../grommet-index/src/js'),
    'grommet/scss': path.resolve(__dirname, '../grommet/src/scss'),
    'grommet': path.resolve(__dirname, '../grommet/src/js')
  },
  devPreprocess: ['set-webpack-alias']
};

gulp.task('set-webpack-alias', function () {
  if (opts.alias && argv.useAlias) {
    console.log('Using local alias for development.');
    opts.webpack.resolve.alias = opts.alias;
  }
});

gulp.task('release:createTmp', function(done) {
  del.sync(['./tmp']);
  mkdirp('./tmp', function(err) {
    if (err) {
      throw err;
    }
    done();
  });
});

gulp.task('release:heroku', ['dist', 'release:createTmp'], function(done) {
  if (process.env.CI) {
    git.clone('https://' + process.env.GH_TOKEN + '@github.com/grommet/grommet-ferret.git',
      {
        cwd: './tmp/'
      },
      function(err) {
        if (err) {
          throw err;
        }

        process.chdir('./tmp/grommet-ferret');
        git.checkout('heroku', function(err) {
          if (err) {
            throw err;
          }

          gulp.src([
            '../../**',
            '!../../.gitignore',
            '!../../.travis.yml'])
          .pipe(gulp.dest('./')).on('end', function() {
            git.status({
              args: '--porcelain'
            }, function(err, stdout) {
              if (err) {
                throw err;
              }

              if (stdout && stdout !== '') {
                gulp.src('./')
                  .pipe(git.add({
                    args: '--all'
                  }))
                  .pipe(git.commit('Heroku dev version update.')).on('end', function() {
                    git.push('origin', 'heroku', { quiet: true }, function(err) {
                      if (err) {
                        throw err;
                      }

                      process.chdir(__dirname);
                      done();
                    });
                  });
              } else {
                console.log('No difference since last commit, skipping heroku release.');

                process.chdir(__dirname);
                done();
              }
            });
          });
        });
      }
    );
  } else {
    console.warn('Skipping release. Release:heroku task should be executed by CI only.');
  }
});

gulpTasks(gulp, opts);
