'use strict';

const gulp = require('gulp');
const del = require('del');
const install = require('gulp-install');

// Clean up. Removes the dist folder.
const clean = () => {
  return del(['./dist']);
};

// Install the production packages using npm to dist. Setting the production flag to true
// will ignore the devDependencies section in the package.json.
const npm = () => {
  return gulp.src('./package.json')
    .pipe(gulp.dest('./dist/'))
    .pipe(install({production: true}));
};

const copyIndex = () => {
    return gulp.src(['./index.js'])
      .pipe(gulp.dest('./dist/'));
};

const copyLib = () => {
    return gulp.src(['lib/**/*'])
      .pipe(gulp.dest('./dist/lib'));
};

// More complex tasks
const build = gulp.series(
  clean,
  gulp.parallel(copyIndex, copyLib, npm)
);

// Exports
exports.clean = clean;
exports.build = build;
