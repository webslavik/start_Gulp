var gulp            = require('gulp'),
    jade            = require('gulp-jade'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    cleanCSS        = require('gulp-clean-css'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglify'),
    notify          = require("gulp-notify"),
    cache           = require('gulp-cache'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    browserSync     = require('browser-sync');


gulp.task('jade', function() {
    return gulp.src('src/jade/index.jade')
    .pipe(jade({
        pretty: true
    }))
    .on('error', notify.onError(function(err) {
        return {
          title: 'Sass',
          message: err.message
        }
    }))
    .pipe(gulp.dest('src/'));
});

gulp.task('sass', function() {
    return gulp.src('src/sass/main.sass')
        .pipe(sass())
        .on('error', notify.onError(function(err) {
            return {
              title: 'Sass',
              message: err.message
            }
        }))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('src/css/'))
        .pipe(cleanCSS())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('src/css/'))
        .pipe(browserSync.reload({stream: true}));
})

// gulp.task('css-min', ['sass'], function() {
//   return gulp.src('src/css/main.css')
//     .pipe(cleanCSS())
//     .pipe(rename({suffix: '.min'}))
//     .pipe(gulp.dest('src/css'));
// })


gulp.task('scripts', function() {
    return gulp.src([
        'src/js/jquery-3.0.0.min.js',
        'src/js/function.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js'));
})


gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'src/'
        },
        notify: false
    });
});


gulp.task('watch', ['browser-sync',  'sass', 'jade', 'scripts'], function() {
    gulp.watch('src/sass/**/*', ['sass']);
    gulp.watch('src/jade/**/*.jade', ['jade']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*', browserSync.reload);
})



// Images
//--------------------------------------------------
gulp.task('clean', function() {
    return del.sync('dist');
});

gulp.task('clear', function() {
    return cache.clearAll();
});



// Build project
//--------------------------------------------------
gulp.task('build', ['clean', 'sass', 'scripts', 'jade'], function() {

    var buildCss = gulp.src('src/css/*')
      .pipe(gulp.dest('dist/css/'))

    var buildFonts = gulp.src('src/fonts/**/*')
      .pipe(gulp.dest('dist/fonts/'));

    var buildJS = gulp.src('src/js/**/*')
      .pipe(gulp.dest('dist/js/'));

    var buildHTML = gulp.src('src/*.html')
      .pipe(gulp.dest('dist/'));

    var buildImg = gulp.src('src/img/**/*')
      .pipe(gulp.dest('dist/img/'));
});


// Default
//--------------------------------------------------
gulp.task('default', ['watch']);
