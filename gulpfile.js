const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const rsync = require('gulp-rsync');
const sync = require('browser-sync').create();
const svgmin = require('gulp-svgmin');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const jsmin = require('gulp-jsmin');
const cssnext = require("gulp-cssnext");

// HTML

gulp.task('html', () => {
  return gulp.src('src/**/*.html')
    .pipe(htmlmin({
      removeComments: true
    }))
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream({
      once: true
    }));
});

// CSS

gulp.task('css', () => {
  return gulp.src('src/styles/**/*.css')
    .pipe(plumber())
    .pipe(concat('style.css'))
    .pipe(cssnext())
    .pipe(postcss([autoprefixer]))
    .pipe(csso())
    .pipe(gulp.dest('dest/styles'))
    .pipe(sync.stream({
      once: true
    }));
});

// JS

gulp.task('scripts', () => {
  return gulp.src('src/scripts/*.js')
    .pipe(jsmin())
    .pipe(gulp.dest('dest/scripts'))
    .pipe(sync.stream({
      once: true
    }));
});

// Images

gulp.task('svg', () => {
  return gulp.src('src/images/**/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('dest/images'));
});

// Copy

gulp.task('copy', () => {
  return gulp.src([
      'src/*',
      'src/fonts/*',
      'src/images/**/*.{jpg,png}',
      '!src/styles/*',
      '!src/scripts/*',
      '!src/**/*.html'
    ], {
      base: 'src'
    })
    .pipe(gulp.dest('dest'))
    .pipe(sync.stream({
      once: true
    }));
});

// Server

gulp.task('server', () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: 'dest'
    }
  });
});

// Watch

gulp.task('watch:svg', () => {
  return gulp.watch('src/images/**/*.svg', gulp.series('svg'));
});

gulp.task('watch:html', () => {
  return gulp.watch('src/**/*.html', gulp.series('html'));
});

gulp.task('watch:css', () => {
  return gulp.watch('src/styles/**/*.css', gulp.series('css'));
});

gulp.task('watch:scripts', () => {
  return gulp.watch('src/scripts/*.js', gulp.series('scripts'));
});

gulp.task('watch:copy', () => {
  return gulp.watch([
    'src/*',
    'src/fonts/*',
    'src/images/**/*.{jpg,png}',
    '!src/styles/*',
    '!src/scripts/*',
    '!src/**/*.html'
  ], gulp.series('copy'));
});

gulp.task('watch', gulp.parallel(
  'watch:svg',
  'watch:html',
  'watch:css',
  'watch:scripts',
  'watch:copy'
));

// Build

gulp.task('build', gulp.parallel(
  'svg',
  'html',
  'css',
  'scripts',
  'copy'
));

// Deploy

gulp.task('deploy', () => {
	return gulp.src('dest/**')
		.pipe(rsync({
			root: 'dest',
			hostname: 'pitercss.com',
			destination: '/var/www/pitercss.com/html/',
			recursive: true,
			clean: true,
			incremental: true,
			exclude: '.DS_Store'
		}));
});

// Default

gulp.task('default', gulp.series(
  'build',
  gulp.parallel(
    'watch',
    'server'
  )
));
