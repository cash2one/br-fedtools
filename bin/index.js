#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var appInfo = require('./../package.json');
var webServer = require('./../lib/server');
var fileGenerator = require('./../lib/fileGenerator');
var path = require('path');

program
	.allowUnknownOption() //不报错误
	.version(appInfo.version)
	.usage('FEDTools前端开发工具')
	.option('-c, --config [type]', '配置文件地址')
	.option('-l, --local', '本地构建')
	.option('-p, --port [type]', '监听端口','3333')
	.parse(process.argv);

program
	.command('build')
	.alias('b')
	.description('进行构建')
	.action(function(cmd, options) {
		console.log(" _____ _____ ____ _____           _     ");
		console.log("|  ___| ____|  _ \\_   _|__   ___ | |___ ");
		console.log("| |_  |  _| | | | || |/ _ \\ / _ \\| / __|");
		console.log("|  _| | |___| |_| || | (_) | (_) | \\__ \\");
		console.log("|_|   |_____|____/ |_|\\___/ \\___/|_|___/");

		var env = '远端';
		if (program.local) {
			env = '本地';
		}
		console.log(colors.green('开启' + env + '构建'));

	}).on('--help', function() {
		console.log('  Examples:');
		console.log('');
		console.log('    bid build -l,进行本地构建');
		console.log('');
		process.exit(1);
	});

program
	.command('dev')
	.alias('d')
	.description('进行开发')
	.action(function(cmd, options) {
		console.log(" _____ _____ ____ _____           _     ");
		console.log("|  ___| ____|  _ \\_   _|__   ___ | |___ ");
		console.log("| |_  |  _| | | | || |/ _ \\ / _ \\| / __|");
		console.log("|  _| | |___| |_| || | (_) | (_) | \\__ \\");
		console.log("|_|   |_____|____/ |_|\\___/ \\___/|_|___/");

		console.log(colors.green('开启开发者模式'));
		webServer.start({
			port: program.port
		});

	}).on('--help', function() {
		console.log('  Examples:');
		console.log('');
		console.log('    bid dev,开启本地开发者模式');
		console.log('');
		process.exit(1);
	});

program
	.command('init')
	.alias('d')
	.description('初始化工程目录')
	.action(function(cmd, options) {
		console.log(" _____ _____ ____ _____           _     ");
		console.log("|  ___| ____|  _ \\_   _|__   ___ | |___ ");
		console.log("| |_  |  _| | | | || |/ _ \\ / _ \\| / __|");
		console.log("|  _| | |___| |_| || | (_) | (_) | \\__ \\");
		console.log("|_|   |_____|____/ |_|\\___/ \\___/|_|___/");

		console.log(colors.green('正在初始化工程目录ing...'));
		var dirname = path.join(process.cwd(), './src');
		fileGenerator(dirname);

	}).on('--help', function() {
		console.log('  Examples:');
		console.log('');
		console.log('    bid init,初始化工程目录');
		console.log('');
		process.exit(1);
	});

program.parse(process.argv);