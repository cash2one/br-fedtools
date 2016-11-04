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
var msgMagenta = colors.magentaBright;

// var _ = require('underscore');
var webpackConfig = require('br-bid/webpack.config');
var userConfig = require('br-bid/lib/util/getLocalConfig');

// var jsEntry = _.extend(webpackConfig.entry, userConfig['bid-js-entry']);
var buildInfos = require('br-bid/lib/util/getEntry')(userConfig.version);

var autoEntry = false;
var isLintFailed = false; // lint是否失败

require('shelljs/global');

var clearBuildConfig = function() {
	var filename = path.join(process.cwd(), 'build.json');
	fs.writeFile(filename, '', function(err) {
		if (err) {
			console.log(errorRed('清空build.json失败，请手动删除'));
		}
	});
}

gulp.task('init', function(callback) {
	console.log(infoBlue('初始化发布...'));
	if (!buildInfos.config) {
		buildInfos.config = require(path.join(process.cwd(), 'build.json'));
	}
	// buildInfos.config = require(path.join(process.cwd(), 'build.json'));
	if (userConfig.version) {
		try {
			var newJsEntry = JSON.stringify(buildInfos.config.jsEntry).replace(/\@version/g, userConfig.version)
			webpackConfig.entry = JSON.parse(newJsEntry);
		} catch (e) {
			throw new Error(errorRed('发布失败：config["bid-js-entry"]解析@version发生错误。'));
		}
	} else {
		throw new Error(errorRed('发布失败：config.json中version字段异常或您当前的git环境存在异常。'));
	}
	callback(); // 发布初始化
});

gulp.task('clean', function(cb) { // 重置build目录
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

gulp.task('lint', function() { // 代码健康检测
	console.log(infoBlue('正在进行js规范检测...'));
	if (!buildInfos.config) {
		try {
			buildInfos.config = require(path.join(process.cwd(), 'build.json'));
		} catch (e) {
			console.log(warnYellow('加载build.json异常'));
		}
	}
	var lintConfig = {
		entry: ['!./src/**/**/*.min.js', '!./src/**/**/*.lintignore.js', '!./src/c/common/rem.js'],
		option: {
			'bitwise': false,
			'camelcase': false,
			'curly': false,
			'enforceall': false,
			'eqeqeq': false,
			'es3': false,
			'es5': false,
			'esversion': 6,
			'forin': false,
			'freeze': false,
			'funcscope': false,
			'futurehostile': false,
			'globals': false,
			'iterator': false,
			'latedef': false, // 禁止使用未定义的变量
			'maxcomplexity': false,
			'maxdepth': 10, // {}最大嵌套深度
			'maxerr': 150,
			'noempty': false,
			'nonbsp': false,
			'nonew': false,
			'notypeof': true, // typeof返回值书写检测：typeof=='functin' -> 报错
			'quotmark': false, // 'double',true 引号检测
			'shadow': true, // 'inner','outer','false','true'检测变量重复定义
			'strict': false,
			'undef': false,
			'unused': true,
			"predef": ['window', 'require', 'module', 'BrBridge', '$'],
			'varstmt': false // 赋值语句 statement 检测，不存在statement则报错
		}
	}
	var isEmptyJsEntry = true;
	if (buildInfos && buildInfos.config && buildInfos.config.jsEntry && !buildInfos.config.lintPath) {
		for (var jName in buildInfos.config.jsEntry) {
			lintConfig.entry.push(buildInfos.config.jsEntry[jName]);
			isEmptyJsEntry = false;
		}
		if (isEmptyJsEntry) { // 没有待检测的js入口文件
			lintConfig.entry = [];
		}
	} else {
		if (buildInfos.config && buildInfos.config.lintPath && !buildInfos.config.jsEntry) {
			lintConfig.entry = buildInfos.config.lintPath;
		} else {
			lintConfig.entry.push('./src/**/**/*.js');
		}
	}

	// return gulp.src(['./src/**/**/*.js', '!./src/**/**/*.min.js', '!./src/**/**/*.lintignore.js'])
	return gulp.src(lintConfig.entry)
		.pipe(jshint(lintConfig.option))
		// .pipe(jshint.reporter('default'));
		.pipe(jshint.reporter(function(errors) {
			if (errors.length) {
				console.log(errorRed('* 检测文件：', errors[0].file));
				errors.forEach(function(error, index) {
					var e = error.error;
					var file = error.file;
					console.log(warnYellow('  -- 所在代码: '), msgMagenta(e.evidence && e.evidence.split(' ').join('')), warnYellow('  at line(', e.line, ')/character(', e.character, ')'));
					console.log(warnYellow('         原因：'), infoBlue(e.reason));
					console.log('');
				});
				isLintFailed = true;
			}
		}));
});

gulp.task('webpack-lint', ['lint'], function(callback) { // webpack+lint
	if (!isLintFailed) {
		console.log(successGreen('js规范检测通过!'))
	} else {
		console.log(warnYellow('请规范您的代码!'))
	}
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

gulp.task('minify-js-lint', ['webpack-lint'], function() { // lint打包完成后，执行js压缩
	gulp.src('./build/**/*.js') // 要压缩的js文件
		.pipe(uglify()) //使用uglify进行压缩,更多配置请参考：
		.pipe(gulp.dest('./build/')); //压缩后的路径
});

gulp.task('inlinesource-htmlmin', ['clean'], function(callback) { // 压缩html并迁移至相对目录
	console.log(infoBlue('正在压缩迁移html...'));
	var v = userConfig.version ? userConfig.version + '/' : ''
		// return gulp.src('./src/p/**/*.html')
	var htmlSrc = buildInfos && buildInfos.config && buildInfos.config.htmlEntry && buildInfos.config.htmlEntry.length ? buildInfos.config.htmlEntry : './src/p/**/*.html';
	// 如果htmlEntry为空数组，则迁移全部html
	gulp.src(htmlSrc, {
			base: './src/p'
		})
		.pipe(inlinesource())
		/*.pipe(inlineCss({
			applyStyleTags: true,
			applyLinkTags: false,
			removeStyleTags: false
		}))*/
		.pipe(replace(/<(html|body)>/g, ''))
		.pipe(replace(/\@version\//g, v))
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('./build/src/p/'));
	return callback();
});

gulp.task('copy-source-lint', ['minify-js-lint', 'inlinesource-htmlmin'], function(callback) { // 复制 html备份及图片资源
	console.log(infoBlue('正在备份html...'));
	var v = userConfig.version ? userConfig.version + '/' : '';
	// return gulp.src('./src/p/**/*.html')
	gulp.src('./build/src/p/**/*.html')
		.pipe(gulp.dest('./build/html_backup/' + v + '/'));

	gulp.src('./src/images/**/*')
		.pipe(gulp.dest('./build/src/images'));

	clearBuildConfig();

	return callback();
});

gulp.task('build', ['init', 'clean', 'lint', 'webpack-lint', 'minify-js-lint', 'inlinesource-htmlmin', 'copy-source-lint'], function(callback) { // 日常发布打包
	callback();
});

gulp.task('dolint', ['lint'], function() { // 本地lint 代码检测
	if (!isLintFailed) {
		console.log(successGreen('js规范检测通过!'))
	} else {
		console.log(warnYellow('请规范您的代码!'))
	}
	clearBuildConfig();
}); 