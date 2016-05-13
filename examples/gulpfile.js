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
// var userConfig = require('./../lib/util/getLocalConfig'); // TO DO REMOVE

webpackConfig.entry = _.extend(webpackConfig.entry, userConfig['bid-js-entry']);

if (_.isEmpty(webpackConfig.entry)) { 
	// 如果config.json中没有设置相关bid-js-entry字段，则自动匹配JS入口文件，规则：匹配所有src/p/**/index.js
	console.log('isEmpty');
	var autoEntry = require('br-bid/lib/util/getEntry'); 
	// var autoEntry = require('./../lib/util/getEntry'); // TO DO REMOVE
	console.log(autoEntry);
	webpackConfig.entry = _.extend(webpackConfig.entry, autoEntry);
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
			console.log('Nothing to delete!')
			cb();
		}
	})

});

gulp.task('lint', function() {
	console.log('正在进行js规范检测...')
	return gulp.src('./src/**/**/*.js')
		.pipe(jshint())
		// .pipe(jshint.reporter('default'));
		.pipe(jshint.reporter(function(errors) {
			if (errors.length) {
				errors.forEach(function(error, index) {
					var e = error.error;
					var file = error.file;
					console.log(errorRed(index, '. 所在位置：', file, ' -> line(', e.line, ')/character(', e.character, ')  ->', e.evidence.split(' ').join(''), '; 原因：', e.reason));
				});
				isLintFailed = true;
			}
		}));
});

gulp.task('webpack', ['lint'], function(callback) {
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
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('./build/src/p/'));
});

gulp.task('default', ['clean', 'lint', 'webpack', 'minify-js', 'inlinesource-htmlmin']);