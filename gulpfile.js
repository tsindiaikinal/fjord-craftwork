const { series } = require('gulp');
const { src, dest } = require('gulp');
const { watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass'), // переводит SASS в CSS
autoprefixer = require('gulp-autoprefixer'), // Проставлет вендорные префиксы в CSS для поддержки старых браузеров
imagemin = require('gulp-imagemin'), // Сжатие изображение
concat = require("gulp-concat"), // Объединение файлов - конкатенация
uglify = require("gulp-uglify"), // Минимизация javascript
rename = require("gulp-rename"), // Переименование файлов
smushit = require('gulp-smushit'), // сжимание изображений
csso = require('gulp-csso'); // Минимизация CSS
// const plumber = require('gulp-plumber');
const notify = require("gulp-notify");

sass.compiler = require('node-sass');

const watcher = watch(['src/*.html', 'src/js/*.js', 'src/sass/*.scss', 'src/css/*.css']);
const watcherSass = watch('src/sass/*.scss');

function copySass() {
    return src('src/sass/*.scss')
    .pipe(dest('dist/tmp/sass/'));
}

function htmlCopy() {
    return src("src/*.html")
        .pipe(dest("dist"));
}

function copyImg() {
    return src('src/img/*.*')
        .pipe(dest('dist/tmp/img/'));
}

function copyFonts() {
    return src('src/fonts/*.*')
        .pipe(dest('dist/tmp/fonts/'));
}

watcher.on('change', function (path, stats) {
    browserSync.reload();
});


watcherSass.on('change', function (path, stats) {
    sassProg();
});

function server() {
    browserSync.init({
        server: {baseDir: "./src/"}
    });
}

function CompressImg() {
    return src('src/img/*.{jpg,jpeg,png}')
        .pipe(smushit())
        .pipe(dest('dist/img'));
}

function imageMin() {
    return src('src/img/*.+(jpg|jpeg|png)')
    .pipe(imagemin())
    .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
            plugins: [
                { removeViewBox: true },
                { cleanupIDs: false }
            ]
        })
    ]))
    .pipe(dest('dists/img'));
}

function sassProg() {
    return src("src/sass/*.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 6 versions'],
            cascade: false
        }))
        .pipe(dest('src/css'));
}
    
function scriptConcat() {
    return src("src/js/*.js") // директория откуда брать исходники
    .pipe(concat('scripts.js')) // объеденим все js-файлы в один 
    .pipe(uglify()) // вызов плагина uglify - сжатие кода
    .pipe(rename({ suffix: '.min' })) // вызов плагина rename - переименование файла с приставкой .min
    .pipe(dest("dist/js")); // директория продакшена, т.е. куда сложить готовый файл
}
    
function cssomin() {
    return src('src/css/*.css')
    .pipe(csso())
    .pipe(concat('style.css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('dist/css'));
}


// exports.watcherSass = watcherSass;
// exports.sass = sass;
exports.server = server;
exports.smushitCompressImg = CompressImg;
exports.cssomin = cssomin;
exports.htmlCopy = htmlCopy;
exports.sassProg = sassProg;
exports.scriptConcat = scriptConcat;
exports.imageMin = imageMin;
exports.copySass = copySass;
exports.copyFonts = copyFonts;
exports.copyImg = copyImg;
exports.default = series(htmlCopy, sassProg, scriptConcat, cssomin, copySass, copyImg, copyFonts);