/*
		----------------------------------------------------
		Настройки Gulp файла
		----------------------------------------------------
*/


/*
	
	Подключаемые плагины

*/

'use strict'

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
		browserSync     = require('browser-sync'),

		/*
			png спрайты
			* buffer и merge приведены в официальной документации к spritesmith.
				без них imagemin не хотел работать
		*/
		spritesmith 		= require('gulp.spritesmith'),
		imagemin 				= require('gulp-imagemin'),
		buffer 					= require('vinyl-buffer'), 
		merge 					= require('merge-stream'),

		/*  
			svg спрайты  http://glivera-team.github.io/svg/2016/06/13/svg-sprites-2.html 
		*/
		svgSprite 			= require('gulp-svg-sprite'), // создание спрайта
		svgmin 					= require('gulp-svgmin'), // минификация SVG
		cheerio 				= require('gulp-cheerio'), // удаление лишних атрибутов из svg
		replace 				= require('gulp-replace'); // фиксинг некоторых багов, об этом ниже



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
			'app/bower_components/normalize-css/normalize.css'
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
			'app/bower_components/jquery/dist/jquery.js',
			'app/bower_components/svg4everybody/dist/svg4everybody.js'
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


// SVG спрайты
//--------------------------------------------------
gulp.task('svg-sprite', function() {

	return gulp.src('app/img/icon-svg/icon/*.svg')
		// минифицируем svg
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// убираем все лишнее из спрайта
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
		}))
		// у этого плагина есть баг, он преобразует ">" в '&gt;'
		// исправляем
		.pipe(replace('&gt;', '>'))
		// создаем спрайт и кладем в нужную папку
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "../../../../img/icon-svg/main-sprite.svg",
					render: {
						scss: {
							dest:'../../../../../sass/3-modules/_svg-sprite.scss',
							template: 'app/sass/2-basic/_sprite_template.scss'
						}
					}
				}
			}
		}))
		.pipe(gulp.dest('app/jade/_includes/svg-sprites/'));

});

// PNG спрайты
//--------------------------------------------------
gulp.task('pngSprite', function () {
  var spriteData = gulp.src('app/img/icon-png/icon/*.png')
    .pipe(spritesmith({
        imgName: 'png-sprite.png',
        cssName: '_png-sprite.scss',
    		imgPath: '../img/icon-png/png-sprite.png',
        algorithm: 'binary-tree',
        cssFormat: 'scss',
        padding: 2,
        cssVarMap: function(pngSprite) {
        	pngSprite.name = 'icon-' + pngSprite.name
        }
    }));
  

	  var imgStream = spriteData.img
	  	.pipe(buffer())
	  	.pipe(imagemin())
	  	.pipe(gulp.dest('app/img/icon-png/'));

	  var cssStream = spriteData.css
	  	.pipe(gulp.dest('app/sass/3-modules/'));

	  return merge(imgStream, cssStream);

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
gulp.task('watch', ['browser-sync',  'sass', 'jade', 'scripts', 'css-vendor'], function() {
		gulp.watch('app/sass/**/*', ['sass']);
		gulp.watch('app/jade/**/*.jade', ['jade']);
		gulp.watch('app/*.html', browserSync.reload);
		gulp.watch('app/js/**/*', browserSync.reload);

		// отслеживаем изменения в папках со спрайтами и 
		// запускаем соответствующие задачи
		gulp.watch('app/img/icon-png/icon/*', ['pngSprite']);
		gulp.watch('app/img/icon-svg/icon/*', ['svg-sprite']);
})


// Default
//--------------------------------------------------
gulp.task('default', ['watch']);
