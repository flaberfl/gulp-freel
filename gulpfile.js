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
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp"),
  webphtml = require("gulp-webp-html"),
  webpcss = require("gulp-webpcss"),
  svgSprite = require("gulp-svg-sprite"),
  ttf2woff = require("gulp-ttf2woff"),
  ttf2woff2 = require("gulp-ttf2woff2"),
  fonter = require("gulp-fonter");



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
    .pipe(webphtml())
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
    .pipe(webpcss({
      webpClass: '.webp',
      noWebpClass: '.no-webp'
    }))
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
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        interlaced: true,
        optimizationlevel: 3
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream()) // Обновляем браузер
}

function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
};

gulp.task('otf2ttf', function () {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ["ttf"]
    }))
    .pipe(dest(source_folder + '/fonts/'));
})

gulp.task('svgSprite', function () {
  return gulp.src([source_folder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../icons/icons.svg",
          // example: true
        }
      },
    }))
    .pipe(dest(path.build.img))
})

function fontsStyle() {
  // body
}

function cb() {
  // body
}

function watchFiles(arguments) { // Функция слежки за файлами
  gulp.watch([path.watch.html], html); // Слежка за HTML файлами
  gulp.watch([path.watch.css], css); // Слежка за CSS файлами
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

function clean() {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync); // Сценарий выполнения функций

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.buld = build;
exports.watch = watch;
exports.default = watch;