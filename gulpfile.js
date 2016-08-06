/*
		----------------------------------------------------
		Настройки Gulp файла
		----------------------------------------------------
*/


/*
	
	Подключаемые плагины

*/

var gulp            = require('gulp'),
		jade            = require('gulp-jade'),
		sass            = require('gulp-sass'),
		autoprefixer    = require('gulp-autoprefixer'),
		cleanCSS        = require('gulp-clean-css'), // минификация css
		concat          = require('gulp-concat'), // объединение js
		uglify          = require('gulp-uglify'), // минифицируем js
		notify          = require("gulp-notify"), // выводим ошибки
		cache           = require('gulp-cache'),
		rename          = require('gulp-rename'),
		sftp            = require('gulp-sftp'), // отправка файлов на сервер
		del             = require('del'),
		browserSync     = require('browser-sync');





/*
	
	Наши задачи

*/



// Jade
//--------------------------------------------------
gulp.task('jade', function() {
	return gulp.src('app/jade/*.jade')
	.pipe(jade({
			pretty: true
	}))
	.on('error', notify.onError(function(err) {
			return {
				title: 'Jade',
				message: err.message
			}
	}))
	.pipe(gulp.dest('app/'));
});


// Sass
//--------------------------------------------------
gulp.task('sass', function() {
	return gulp.src('app/sass/*.sass')
		.pipe(sass())
		.on('error', notify.onError(function(err) {
			return {
				title: 'Sass',
				message: err.message
			}
		}))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(gulp.dest('app/css/'))
		// .pipe(cleanCSS())
		// .pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/css/'))
		.pipe(browserSync.reload({stream: true}));
})


// Для объединения стороних библиотек
//--------------------------------------------------
gulp.task('css-vendor', function() {
	return gulp.src([
			'app/bower_components/normalize-css/normalize.css',
			'app/bower_components/bootstrap/dist/css/bootstrap.css'
		])
		.pipe(concat('vendor.css')) // объединяем стороние бибилиотеки
		.pipe(cleanCSS())
		.pipe(rename({basename: 'vendor'}))
		.pipe(gulp.dest('app/css'))
})


// Скрипты
//--------------------------------------------------
gulp.task('scripts', function() {
		return gulp.src([
			'app/bower_components/jquery/dist/jquery.js'
			// 'app/js/function.js'
			])
			.pipe(concat('vendor.js')) // объединяем стороние бибилиотеки
			.pipe(uglify())
			.pipe(gulp.dest('app/js'))
});


// Сервер
//--------------------------------------------------
gulp.task('browser-sync', function() {
		browserSync({
				server: {
						baseDir: 'app/'
				},
				notify: false
		});
});


// Отправляем файлы на сервер 
//--------------------------------------------------
gulp.task('sftp', function () {
		return gulp.src('dist/**/*')
				.pipe(sftp({
						host: 'website.com',
						user: 'johndoe',
						pass: '1234'
				}));
});


// Удаляем папку dist
//--------------------------------------------------
gulp.task('clean', function() {
		return del.sync('dist');
});


// Для изображений
//--------------------------------------------------
gulp.task('clear', function() {
		return cache.clearAll();
});



// Собираем проект
//--------------------------------------------------
gulp.task('build', ['clean', 'sass', 'scripts', 'jade'], function() {

		var buildCss = gulp.src('app/css/*')
			.pipe(gulp.dest('dist/css/'))

		var buildFonts = gulp.src('app/fonts/**/*')
			.pipe(gulp.dest('dist/fonts/'));

		var buildJS = gulp.src('app/js/**/*')
			.pipe(gulp.dest('dist/js/'));

		var buildHTML = gulp.src('app/*.html')
			.pipe(gulp.dest('dist/'));

		var buildImg = gulp.src('app/img/**/*')
			.pipe(gulp.dest('dist/img/'));
});



// Наблюдаем за нашими файлами
//--------------------------------------------------
gulp.task('watch', ['browser-sync',  'sass', 'jade', 'scripts'], function() {
		gulp.watch('app/sass/**/*', ['sass']);
		gulp.watch('app/jade/**/*.jade', ['jade']);
		gulp.watch('app/*.html', browserSync.reload);
		gulp.watch('app/js/**/*', browserSync.reload);
})


// Default
//--------------------------------------------------
gulp.task('default', ['watch']);
