#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var appInfo = require('./../package.json');
var webServer = require('./../lib/server');
var fileGenerator = require('./../lib/fileGenerator');
var npmInstall = require('./../lib/util/auto-npm-install');
var path = require('path');

program
	.allowUnknownOption() //不报错误
	.version(appInfo.version)
	.usage('FEDTools前端开发工具')
	.option('-c, --config [type]', '配置文件地址')
	.option('-l, --local', '本地构建')
	.option('-ol, --online', '远端构建')
	.option('-p, --port [type]', '监听端口', '3333')
	.option('-q, --quiet', '已安静模式进行模块更新')
	.option('-f, --force [type]', '强制重新安装全部模块')
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

		}
		console.log(colors.green('开启' + env + '构建'));

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
		console.log(colors.green('开启开发者模式'));
		webServer.start({
			port: program.port
		});

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
		console.log(colors.green('正在初始化工程目录ing...'));
		var dirname = path.join(process.cwd(), './src');
		fileGenerator(dirname);

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
		console.log(colors.green('正在更新全局依赖模块,请稍后'));
		var settings = {
			quiet: false
		};
		if (program.quiet) { // 安静模式
			settings.quiet = true;
		}
		if (program.force) { // 强制更新，则重新安装全部全局依赖npm模块
			settings.moduleName = program.force;
			npmInstall.install(settings, function() {
				console.log(colors.green('强制更新完成'));
			});
		} else {
			npmInstall.update(settings, function() {
				console.log(colors.green('更新完成'));
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