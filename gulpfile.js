var gulp         = require('gulp'),
	plumber      = require('gulp-plumber'),      // уведомления об ошибках
	autoprefixer = require('gulp-autoprefixer'), // установка префиксов
	notify       = require('gulp-notify'),       // всплывающие уведомления
	imagemin     = require('gulp-imagemin'),     // минификация изображений
	sass         = require('gulp-sass'),         // компилятор sass на C без compass
	uglify       = require('gulp-uglify'),       // Минификация js
	csso         = require('gulp-csso'),         // Для минификации css
	babel        = require('gulp-babel'),        // babel
	es2015       = require('babel-preset-es2015'),
	react        = require('babel-preset-react');


/**
 * Пути
 */
var path = {
	build: {
		js:     'build/js/',
		css:    'build/css/',
		img:    'build/img/',
	},
	src: {
		js:         'assets/js/**/**.jsx',
		sass:       'assets/sass/**/*.sass',
		img:        'assets/img/**/*.*',
	}
};


/**
 *  SASS
 */
gulp.task('sass',function () {
	setTimeout(function () {
		gulp.src(path.src.sass)
			.pipe(sass.sync().on('error', sass.logError))
			.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(autoprefixer({
				browsers: ['last 12 versions','> 1%'],
				cascade: false,
				remove: false
			}))
			.pipe(csso())
			.pipe(gulp.dest(path.build.css));
	}, 2000);
});



/**
 * JS
 */
gulp.task('js', function () {
	setTimeout(function () {
		gulp.src(path.src.js)
			.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
			.pipe(babel({
				presets: [
					[es2015],
					[react]
				]
			}))
			.pipe(uglify())
			.pipe(gulp.dest(path.build.js));
	}, 2000);
});


/**
 * IMAGES
 */
gulp.task('img', function () {
	gulp.src(path.src.img)
		.pipe(imagemin({progressive: true }))
		.pipe(gulp.dest(path.build.img));
});



/**
 * WATCH
 */
gulp.task('watch',function () {
	gulp.watch(path.src.sass,['sass']);
	gulp.watch(path.src.js,['js']);
	gulp.watch(path.src.img,['img']);
});


/**
 * START
 */
gulp.task('default', ['sass', 'js', 'img', 'watch']);

