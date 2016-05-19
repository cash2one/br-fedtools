/**
 * 
 * @fileOverview gulp打包入口
 * @author leo.yy
 * 
 */
var gulp = require('gulp');
var uglify = require("gulp-uglify");
var del = require('del');
var jshint = require('gulp-jshint');
var inlinesource = require('gulp-inline-source');
var htmlmin = require('gulp-htmlmin');
var inlineCss = require('gulp-inline-css');
var replace = require('gulp-replace');
var fs = require('fs');
var path = require('path');
var Webpack = require('webpack');
var gutil = require('gulp-util'); //工具
var colors = require('cli-color');
var errorRed = colors.red;
var successGreen = colors.green;
var warnYellow = colors.yellow;
var infoBlue = colors.blue;

var _ = require('underscore');
var webpackConfig = require('br-bid/webpack.config');
var userConfig = require('br-bid/lib/util/getLocalConfig');

var jsEntry = _.extend(webpackConfig.entry, userConfig['bid-js-entry']);

if (userConfig['auto-entry'] == true) {
	// 自动根据匹配规则（匹配所有src/p/**/index.js）寻找JS入口文件并打包
	console.log(infoBlue('将自动匹配合并入口文件...'));
	var autoEntry = require('br-bid/lib/util/getEntry');
	jsEntry = _.extend(webpackConfig.entry, autoEntry);
}

try {
	var newJsEntry = JSON.stringify(jsEntry).replace(/\@version/g,userConfig.version);
	jsEntry = JSON.parse(newJsEntry);
} catch(e) {
	console.log(warnYellow('config["bid-js-entry"]解析@version发生错误'));
}

webpackConfig.entry = jsEntry;

if (userConfig['extract-common-to-path']) { // 提取全部页面的公共模块并打包到指定文件位置
	webpackConfig.plugins.push(new Webpack.optimize.CommonsChunkPlugin(userConfig['extract-common-to-path']));
}

var isLintFailed = false; // lint是否失败

gulp.task('clean', function(cb) {
	var buildPath = path.join(process.cwd(), './build')
	fs.exists(buildPath, function(exists) {
		if (exists) {
			del.sync([buildPath]);
			console.log('正在重建build目录...')
			cb();
		} else {
			console.log('未找到build文件夹...')
			cb();
		}
	})
});

gulp.task('lint', function() {
	console.log(infoBlue('正在进行js规范检测...'));
	return gulp.src('./src/**/**/*.js')
		.pipe(jshint())
		// .pipe(jshint.reporter('default'));
		.pipe(jshint.reporter(function(errors) {
			if (errors.length) {
				errors.forEach(function(error, index) {
					var e = error.error;
					var file = error.file;
					console.log(errorRed(index, '. 所在位置：', file, ' -> line(', e.line, ')/character(', e.character, ')  ->', e.evidence && e.evidence.split(' ').join(''), '; 原因：', e.reason));
				});
				isLintFailed = true;
			}
		}));
});

gulp.task('webpackWidthLint', ['lint'], function(callback) { // 先lint，在打包
	if (!isLintFailed) {
		console.log(successGreen('js规范检测通过!'))
	} else {
		console.log(warnYellow('请规范您的代码!'))
	}
	console.log(infoBlue('现在开始打包...'));
	Webpack(webpackConfig, function(err, stats) {
		if (err) throw new gutil.PluginError("webpack", err);
		gutil.log("[webpack]", stats.toString({
			chunks: false,
			colors: true,
			children: false
		}));
		callback();
	});
});

gulp.task('webpack', function(callback) { // 只打包，不lint
	console.log(infoBlue('现在开始打包...'));
	Webpack(webpackConfig, function(err, stats) {
		if (err) throw new gutil.PluginError("webpack", err);
		gutil.log("[webpack]", stats.toString({
			chunks: false,
			colors: true,
			children: false
		}));
		callback();
	});
});

gulp.task('minify-js', ['webpack'], function() {
	gulp.src('./build/**/*.js') // 要压缩的js文件
		.pipe(uglify()) //使用uglify进行压缩,更多配置请参考：
		.pipe(gulp.dest('./build/')); //压缩后的路径
});

gulp.task('inlinesource-htmlmin', ['clean'], function() {
	console.log('正在压缩迁移html...');
	return gulp.src('./src/p/**/*.html')
		.pipe(inlinesource())
		/*.pipe(inlineCss({
			applyStyleTags: true,
			applyLinkTags: false,
			removeStyleTags: false
		}))*/
		.pipe(replace(/<(html|body)>/g, ''))
		.pipe(replace(/\@version/g, userConfig.version))
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('./build/src/p/'));
});

gulp.task('buildlint', ['clean', 'webpackWidthLint', 'minify-js', 'inlinesource-htmlmin']);

gulp.task('default', ['clean', 'webpack', 'minify-js', 'inlinesource-htmlmin']);
