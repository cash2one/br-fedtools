#!/usr/bin/env node

/**
 * 
 * @fileOverview bash命令定义
 * @author leo.yy
 * 
 */

var program = require('commander');
var appInfo = require('./../package.json');
var webServer = require('./../lib/server');
var fileGenerator = require('./../lib/fileGenerator');
var npmInstall = require('./../lib/util/auto-npm-install');
var path = require('path');
require('shelljs/global');
var gitTools = require('./../lib/util/gitTools');
var colors = require('cli-color');
var errorRed = colors.red;
var successGreen = colors.green;
var infoBlue = colors.blue;

program
	.allowUnknownOption() //不报错误
	.version(appInfo.version)
	.usage('FEDTools前端开发工具')
	.option('-c, --config [type]', '配置文件地址')
	.option('-l, --local', '本地构建')
	.option('-ol, --online', '远端构建')
	.option('-p, --port [type]', '监听端口', '3333')
	.option('-q, --quiet', '安静模式')
	.option('-g, --global', '全局模式')
	.option('-f, --force [type]', '强制重新安装全部模块')
	.option('-lint, --lint', '构建时检测js代码规范')
	.option('-r, --react', '初始化react工程')
	.action(function() {
		console.log(" _____ _____ ____ _____           _     ");
		console.log("|  ___| ____|  _ \\_   _|__   ___ | |___ ");
		console.log("| |_  |  _| | | | || |/ _ \\ / _ \\| / __|");
		console.log("|  _| | |___| |_| || | (_) | (_) | \\__ \\");
		console.log("|_|   |_____|____/ |_|\\___/ \\___/|_|___/");
	})
	.parse(process.argv);

program
	.command('build')
	.alias('b')
	.description('进行构建')
	.action(function(cmd, options) {
		var env = '本地';
		if (program.online) { // 远端构建
			env = '远端';
		} else { // 本地构建
			var commands = 'gulp';
			if (program.lint) {
				commands += ' buildlint';
			} else {
				commands += ' default';
			}
			var initTime = new Date().getTime();
			exec(commands, {
				async: true,
				silent: program.quiet
			}, function(code, output) {
				var nowTime = new Date().getTime();
				console.log(infoBlue('耗时:' + (nowTime - initTime), 's'));
				console.log(successGreen('本地构建完毕!'));
			});
		}
		console.log(successGreen('开启' + env + '构建'));

	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('    bid build (-l|--local)   :   进行本地构建（默认使用）');
		console.log('    bid build -ol|--online   :   进行远端构建（暂不可用）');
		console.log('');
		process.exit(1);
	});

program
	.command('dev')
	.alias('d')
	.description('进行开发')
	.action(function(cmd, options) {
		console.log(successGreen('开启开发者模式'));
		webServer.start({
			port: program.port
		});

		gitTools.setConfigVersion(); // 检测git分支，设置config.version

	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('    bid dev,开启本地开发者模式');
		console.log('    bid dev -p|--port [端口号]   :   指定端口号');
		console.log('');
		process.exit(1);
	});

program
	.command('init')
	.alias('i')
	.description('初始化工程目录')
	.action(function(cmd, options) {
		console.log(successGreen('正在初始化工程目录ing...'));
		var dirname = path.join(process.cwd(), './');
		var dependencies = ' webpack gulp gulp-uglify del gulp-jshint gulp-inline-source gulp-htmlmin gulp-inline-css gulp-replace underscore gulp-util cli-color br-bid ';
		if (program.react) { // 初始化react工程
			dependencies += ' react react-dom redux react-redux redux-thunk';
		}
		fileGenerator.commonGenerator({
			'dirname': dirname,
			'react': program.react
		}, function() { // 初始化常规工程
			console.log(infoBlue('正在安装构建依赖...'));
			var initTime = new Date().getTime();
			exec('npm install ' + dependencies, {
				async: true,
				silent: program.quiet
			}, function(code, output) {
				var nowTime = new Date().getTime();
				console.log(successGreen('安装依赖完成!'), infoBlue('共耗时:' + (nowTime - initTime) / 1000, 's'));
			});
		});
	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('    bid init   ,   在当前路径下初始化工程目录');
		console.log('');
		process.exit(1);
	});

program
	.command('update')
	.alias('u')
	.description('更新全局依赖模块')
	.action(function(cmd, options) {
		if (program.global) { // 更新全局依赖
			console.log(successGreen('正在更新全局依赖模块,请稍后'));
			var settings = {
				quiet: false
			};
			if (program.quiet) { // 安静模式
				settings.quiet = true;
			}
			if (program.force) { // 强制更新，则重新安装全部全局依赖npm模块
				settings.moduleName = program.force;
				npmInstall.install(settings, function() {
					console.log(successGreen('强制更新完成'));
				});
			} else {
				npmInstall.update(settings, function() {
					console.log(successGreen('更新完成'));
				});
			}
		} else { // 本地node_module依赖
			console.log(infoBlue('正在更新本地模块...'));
			var initTime = new Date().getTime();
			exec('npm update webpack gulp gulp-uglify del gulp-jshint gulp-inline-source gulp-htmlmin gulp-inline-css gulp-replace underscore gulp-util cli-color br-bid', {
				async: true,
				silent: program.quiet
			}, function(code, output) {
				var nowTime = new Date().getTime();
				console.log(successGreen('依赖更新完成!'), infoBlue('共耗时:' + (nowTime - initTime) / 1000, 's'));
			});
		}


	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('    bid update  (-q|--quiet) ,   更新bid全局依赖模块(开启安静模式，默认"非安静模式")');
		console.log('    bid update -f [模块名],   强制重新安装bid指定依赖模块');
		console.log('');
		process.exit(1);
	});

program.parse(process.argv);