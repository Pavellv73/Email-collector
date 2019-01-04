'use strict';

// Подключение плагинов через переменные
var gulp = require('gulp'), // Gulp
    debug = require('gulp-debug'), // Отслеживание работы тасков в терминале
    del = require('del'), // Удаление папок и файлов
    inlineCss = require('gulp-inline-css'), // Создание инлайн-стилей
    notify = require("gulp-notify"), // Вывод надписей при ошибках
    plumber = require('gulp-plumber'), // Обработка ошибок
    pug = require('gulp-pug'), // Pug
    sass = require('gulp-sass'); // Sass

// Задание путей к используемым файлам и папкам
var paths = {
  dir: {
    assets: './assets', // Путь к development-папке
    dist: './build' // Путь к production-папке
  },
  watch: {
    html: './assets/pug/**/*.pug', // Путь для вотчера Pug-файлов
    css: './assets/sass/**/*.scss' // Путь для вотчера Sass-файлов
  },
  assets: {
    html: { // Пути для таска html
      src: './assets/pug/*.pug', // Путь к Pug-файлам для таска html
      dest: './assets/layout' // Место сохранения html-шаблона письма
    },
    css: { // Пути для таска css
      src: [ // Путь к Sass-файлам для таска css
        './assets/sass/styles/inline.scss',
      ],
      dest: './assets/css' // Место сохранения CSS-файлов
    }
  },
  dist: { // Пути для production
    src: './assets/layout/*.html', // Исходный HTML-шаблон письма из development-папки
    dest: './build' // Место сохранения HTML-шаблона с встроенными инлайн-стилями для production
  }
}

// Подключение Browsersync
var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Таск для работы Browsersync, автообновление браузера
gulp.task('server', function() {
  browserSync.init({
    server: { // Настройки сервера
      baseDir: paths.dir.assets, // Базовая директория
      index: 'index.html' // Индексный файл
    }
  });
  gulp.watch([paths.watch.html, paths.watch.css], gulp.series('build')); // Отслеживание изменений Pug и Sass-файлов
  gulp.watch('*.html').on('change', reload); // Обновление браузера в случае изменения индексного файла email.html в development-папке assets
});

// Таск для работы Pug, преобразование Pug в HTML
gulp.task('html', function() {
  return gulp.src(paths.assets.html.src) // Исходник таска html
    .pipe(plumber()) // Обработка ошибок таска html
    .pipe(debug({title: 'Pug source'})) // Отслеживание исходника таска html
    .pipe(pug({
      pretty: true, // Форматирование разметки в HTML-файле
      doctype: 'HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"' // Установка doctype (setting of doctype)
    }))
    .pipe(debug({title: 'Pug'})) // Отслеживание работы плагина Pug
    .pipe(gulp.dest(paths.assets.html.dest)) // Сохранение HTML-шаблона письма в папке assets
    .pipe(debug({title: 'Pug dest'})) // Отслеживание сохранения HTML-шаблона
    .pipe(browserSync.stream()); // Browsersync
});

// Таск для работы Sass, преобразование Sass в CSS
gulp.task('css', function() {
  return gulp.src(paths.assets.css.src) // Исходник таска css
    .pipe(plumber()) // Обработка ошибок таска css
    .pipe(debug({title: 'Sass source'})) // Отслеживание исходника таска css
    .pipe(sass()) // Преобразование Sass в CSS
    .pipe(debug({title: 'Sass'})) // Отслеживание работы плагина Sass
    .pipe(gulp.dest(paths.assets.css.dest)) // Сохранение CSS-файлов в папке assets/css
    .pipe(debug({title: 'Sass dest'})) // Отслеживание сохранения
    .pipe(browserSync.stream()); // Browsersync
});

// Таск для предварительной очистки (удаления) production-папки
gulp.task('clean', function() {
  return del(paths.dir.dist);
});

// Таск для формирования инлайн-стилей из внешнего файла inline.css (task for creating of inline styles):
gulp.task('inline', function() {
  return gulp.src(paths.dist.src) // Исходник для таска inline
    .pipe(plumber()) // Обработка ошибок таска inline
    .pipe(debug({title: 'Inline CSS sourse'})) // Отслеживание исходника таска inline (source tracking of inline task)
    .pipe(inlineCss({ // Преобразование стилей из внешнего файла inline.css в инлайн-стили (conversion styles in inline styles)
        preserveMediaQueries: true, // Сохранение медиа-запросов в тегах style HTML-шаблона (saving of media queries)
        assetslyTableAttributes: true // Преобразование табличных стилей в атрибуты (conversion of table styles in attributes)
    }))
    .pipe(debug({title: 'Inline CSS'})) // Отслеживание преобразования
    .pipe(gulp.dest(paths.dist.dest)) // Сохранение результатов в production-папку dist
    .pipe(debug({title: 'Inline CSS dest'})); // Отслеживание сохранения
});

// Таск для сборки
gulp.task('build', gulp.series('html', 'css', 'clean', 'inline'));

// Таск для запуска разработки
gulp.task('default', gulp.series('build', 'server'));
