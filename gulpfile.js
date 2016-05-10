var path = require('path');
var gulp = require('gulp');
//var jshint = require('gulp-jshint');
var gulpWebpack = require('gulp-webpack');
var uglify = require('gulp-uglify'); // js压缩
var rename = require('gulp-rename'); // 重命名
var less = require('gulp-less'); // less
var minifycss = require('gulp-minify-css'); // CSS压缩
var clean = require('gulp-clean'); //清空文件夹
var gutil = require('gulp-util'); //工具

var Webpack = require("webpack");

var webpackConfig = require('./webpack.config');

var ROOT_PATH = path.resolve(__dirname);

gulp.task("webpack", function (callback) {
    Webpack(webpackConfig, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            chunks: false,
            colors: true,
            children: false
        }));
        callback();
    });
});