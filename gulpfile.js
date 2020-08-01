var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var browserSync = require('browser-sync').create();
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssvariables = require('postcss-css-variables');
var calc = require('postcss-calc');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var ghPages = require('gulp-gh-pages-will');
const fileinclude = require('gulp-file-include');

// js file paths
var utilJsPath = 'main/assets/js'; // util.js path - you may need to update this if including the framework as external node module
var componentsJsPath = 'main/assets/js/components/*.js'; // component js files
var scriptsJsPath = '.dist/assets/js'; //folder for final scripts.js/scripts.min.js files

// css file paths
var cssFolder = '.dist/assets/css'; // folder for final style.css/style-custom-prop-fallbac.css files
var scssFilesPath = 'main/assets/css/**/*.scss'; // scss files to watch

var paths = {
	scripts: {
		src: './',
		dest: '.dist/'
	}
};

function reload(done) {
	browserSync.reload();
	done();
}

gulp.task('sass', function () {
	return gulp.src(scssFilesPath)
		.pipe(sassGlob())
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(postcss([autoprefixer()]))
		.pipe(gulp.dest(cssFolder))
		.pipe(browserSync.reload({
			stream: true
		}))
		.pipe(rename('style-fallback.css'))
		.pipe(postcss([cssvariables(), calc()]))
		.pipe(gulp.dest(cssFolder));
});

gulp.task('scripts', function () {
	return gulp.src([utilJsPath + '/util.js', componentsJsPath])
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest(scriptsJsPath))
		.pipe(browserSync.reload({
			stream: true
		}))
		.pipe(rename('scripts.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(scriptsJsPath))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('browserSync', gulp.series(function (done) {
	browserSync.init({
		server: {
			baseDir: '.dist'
		},
		notify: false
	})
	done();
}));

gulp.task('fileinclude', function () {
	return gulp.src([
			'main/**/*.html'
		])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest('.dist/'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('copyimages', function () {
	return gulp.src([
			'main/assets/img/**/*.{gif,jpg,png,svg}'
		])
		.pipe(gulp.dest('.dist/assets/img'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('copyBatNojekyll', function () {
	return gulp.src([
			'main/.nojekyll'
		])
		.pipe(gulp.dest('.dist/'))
});

gulp.task('copyBatWellKnown', function () {
	return gulp.src([
			'main/.well-known/**/*'
		])
		.pipe(gulp.dest('.dist/.well-known'))
});

gulp.task('default', gulp.series(['fileinclude', 'copyBatNojekyll', 'copyBatWellKnown', 'copyimages', 'browserSync', 'sass', 'scripts'], function () {
	gulp.watch('main/assets/img/**/*.{gif,jpg,png,svg}', gulp.series(['copyimages']));
	gulp.watch('main/**/*.html', gulp.series(['fileinclude']));
	gulp.watch('main/assets/css/**/*.scss', gulp.series(['sass']));
	gulp.watch(componentsJsPath, gulp.series(['scripts']));
}));

gulp.task('deploy', function () {
	return gulp.src(".dist/**/*")
		.pipe(ghPages({
			branch: 'master'
		}))
});