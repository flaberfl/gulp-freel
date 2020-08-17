let project_folder = "dist";
let source_folder = "#src";

let path = {
  build: {
    html: project_folder + "/", // Куда ложим скомпиленные файлы
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
  },
  clean: "./" + project_folder + "/"
}

// ПЕРЕМЕННЫЕ с ФУНКЦИЯМИ

let {
  src,
  dest,
  parallel
} = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"), // Переменная плагина сборки файлов HTML
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  group_media = require("gulp-group-css-media-queries"),
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin");



function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude()) // Подключаем плагин сборки файлов HTML
    .pipe(dest(path.build.html)) // Кидаем файлы HTML в dist
    .pipe(browsersync.stream()) // Обновляем браузер
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe( // Сортировка медиа-запросов
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(dest(path.build.css)) // Выгружаем файл CSS
    .pipe(clean_css()) // Сжимаем файл CSS
    .pipe(
      rename({ // Переименовываем в min.css
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css)) // Выгружаем файл CSS
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude()) // Подключаем плагин сборки файлов JS
    .pipe(dest(path.build.js)) // Кидаем файлы JS в dist
    .pipe(
      uglify() // Сжимаем JS файл плагином uglify
    )
    .pipe(
      rename({ // Переименовываем в min.css
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js)) // Кидаем файлы JS в dist
    .pipe(browsersync.stream()) // Обновляем браузер
}

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlagins
      })
    )
    .pipe(browsersync.stream()) // Обновляем браузер
}

function watchFiles(arguments) { // Функция слежки за файлами
  gulp.watch([path.watch.html], html); // Слежка за HTML файлами
  gulp.watch([path.watch.css], css); // Слежка за CSS файлами
  gulp.watch([path.watch.js], js);
}

function clean(arguments) {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html));
let watch = gulp.parallel(build, watchFiles, browserSync); // Сценарий выполнения функций

exports.js = js;
exports.css = css;
exports.html = html;
exports.buld = build;
exports.watch = watch;
exports.default = watch;