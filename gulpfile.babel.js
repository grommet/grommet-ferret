import { argv }  from 'yargs';
import gulp from 'gulp';
import grommetToolbox, { getOptions } from 'grommet-toolbox';
import git from 'gulp-git';
import del from 'del';
import mkdirp from 'mkdirp';

const options = getOptions();

gulp.task('set-webpack-alias', () => {
  if (options.alias && argv.useAlias) {
    options.webpack.resolve.alias = options.alias;
  }
});

gulp.task('release:createTmp', (done) => {
  del.sync(['./tmp']);
  mkdirp('./tmp', (err) => {
    if (err) {
      throw err;
    }
    done();
  });
});

gulp.task('release:heroku', ['dist', 'release:createTmp'], (done) => {
  if (process.env.CI) {
    git.clone('https://' + process.env.GH_TOKEN + '@github.com/grommet/grommet-ferret.git',
      {
        cwd: './tmp/'
      },
      (err) => {
        if (err) {
          throw err;
        }

        process.chdir('./tmp/grommet-ferret');
        git.checkout('heroku', (err) => {
          if (err) {
            throw err;
          }

          gulp.src([
            '../../**',
            '!../../.gitignore',
            '!../../.travis.yml'])
          .pipe(gulp.dest('./')).on('end', () => {
            git.status({
              args: '--porcelain'
            }, (err, stdout) => {
              if (err) {
                throw err;
              }

              if (stdout && stdout !== '') {
                gulp.src('./')
                  .pipe(git.add({
                    args: '--all'
                  }))
                  .pipe(git.commit('Heroku dev version update.')).on('end', () => {
                    git.push('origin', 'heroku', { quiet: true }, (err) => {
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

grommetToolbox(gulp);
