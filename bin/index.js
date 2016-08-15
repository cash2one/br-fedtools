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
var warnYellow = colors.yellow;
var infoBlue = colors.blue;
var dependencies = ' webpack gulp gulp-uglify del gulp-jshint gulp-inline-source gulp-htmlmin gulp-inline-css gulp-replace jshint underscore gulp-util cli-color br-bid react react-dom redux react-redux redux-thunk';

var inquirer = require('inquirer');
var fs = require('fs');
var envPath = require('../lib/util/env');

var userConfig = require('../lib/util/getLocalConfig');
var buildInfos = require('../lib/util/getEntry')(userConfig.version);

var Promise = require('promise');
var write = Promise.denodeify(fs.writeFile);

var co = require('co');
var urllib = require('urllib');

program
	.allowUnknownOption() //不报错误
	.version(appInfo.version)
	.usage('FEDTools前端开发工具')
	.option('-q, --quiet', '安静模式')
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
	.command('lint')
	.alias('l')
	.description('代码检测')
	.option('-i, --input [type]', '路径')
	.action(function(cmd, options) {
		console.log(successGreen('开始代码检测'));

		var entrySet = {
			lintPath: program.args[0].input || false
		};
		var filename = path.join(envPath.cwdPath, 'build.json');
		var promise = write(filename, JSON.stringify(entrySet), 'utf8')
			.then(function() {
				var initTime = new Date().getTime();
				exec('gulp dolint', {
					async: true,
					silent: program.quiet
				}, function(code, output) {
					var nowTime = new Date().getTime();
					console.log(infoBlue('耗时:' + (nowTime - initTime) / 1000, 's'));
					console.log(successGreen('本地构建完毕!'));
				});
				return;
			});

	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('    bid lint   :   检查全部js文件');
		console.log('    bid lint -i|--input [src]  :   检查指定路径（src）的文件');
		console.log('');
		process.exit(1);
	});

program
	.command('build')
	.alias('b')
	.description('进行构建')
	.option('-o, --online', '远端构建')
	.option('-d, --publishdaily', '构建并发布发布日常')
	.option('-l, --lint', '构建时检测js代码规范')
	.action(function(cmd, options) {
		var env = '本地';
		if (false && program.args[0].online) { // 远端构建
			env = '远端';
		} else { // 本地构建
			var commands = 'gulp';
			if (program.args[0].publishdaily) {
				commands += ' publishdaily';
				inquirer.prompt([{
					type: 'input',
					name: 'userName',
					message: '请输入用户名'
				}, {
					type: 'checkbox',
					name: 'selectedEntry',
					message: '请选择需要进行构建的页面:',
					choices: buildInfos.autoGetHtml.keys
				}]).then(function(answers) {
					var entrySet = {
						userName: answers.userName,
						jsEntry: {},
						htmlEntry: []
					};
					answers.selectedEntry.forEach(function(se, index) {
						for (var htmlKey in buildInfos.autoGetHtml.jsEntry) {
							if (htmlKey.split(se).length > 1) {
								var tmpSrc = './' + htmlKey + '.html';
								if (userConfig.version) {
									tmpSrc = tmpSrc.replace(userConfig.version + '/', '');
								}
								if (buildInfos.autoGetHtml.jsEntry[htmlKey]) {
									entrySet.jsEntry[htmlKey] = buildInfos.autoGetHtml.jsEntry[htmlKey];
								}

								entrySet.htmlEntry.push(tmpSrc);
								return true;
							}
						}
					})

					var filename = path.join(envPath.cwdPath, 'build.json');
					var data = JSON.stringify(entrySet);
					fs.writeFile(filename, data, function(err) {
						if (!err) {
							console.log(successGreen('build.json创建成功'));
							commands += ' --entry ' + filename;
							var initTime = new Date().getTime();
							exec(commands, {
								async: true,
								silent: program.quiet
							}, function(code, output) {

								if (entrySet.userName) { // 校验用户名
									if (!userConfig.dailyServer) {
										console.log(errorRed('上传失败，请正确设置config.json中的dailyServer字段'));
									} else if (!userConfig.dailyServerPath) {
										console.log(errorRed('上传失败，请正确设置config.json中的dailyServerPath字段'));
									} else if (!userConfig.appName) {
										console.log(errorRed('上传失败，请正确设置config.json中的appName字段'));
									} else { // 进行日常发布
										var initTime = new Date().getTime();
										// exec('scp -r ./build root@101.200.132.102:/home', {
										// exec('scp -r ./build/ ' + entrySet.userName + '@192.168.180.10:/opt/www/minions', {
										// 由于服务器端免密钥或交互式shell需要运维配合，开发成本较高，必所以暂时使用手工创建日常服务器项目目录的办法；
										// 日常发布时，须保证服务器上已经存在项目文件夹，否则需要手动新建，并将owner设置为www,权限777,否则可能会影响日常发布
										exec('scp -r ./build/* ' + entrySet.userName + '@' + userConfig.dailyServer + ':' + userConfig.dailyServerPath + userConfig.appName, {
											async: true
										}, function(code, output) {
											var nowTime = new Date().getTime();
											console.log(successGreen('已成功上传到日常服务器!'));
											console.log(infoBlue('上传耗时:' + (nowTime - initTime) / 1000, 's'));
										});
									}
								} else {
									console.log(errorRed('上传失败，无法解析您输入的userName'));
								}

								var nowTime = new Date().getTime();
								console.log(infoBlue('耗时:' + (nowTime - initTime) / 1000, 's'));
								console.log(successGreen('本地构建完毕!'));
							});
						} else {
							console.log(errorRed('build.json写入失败，请检查该文件'));
						}
					});

				});
			} else {
				if (program.args[0].lint) {
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
					console.log(infoBlue('耗时:' + (nowTime - initTime) / 1000, 's'));
					console.log(successGreen('本地构建完毕!'));
				});
			}
		}
		console.log(successGreen('开启' + env + '构建'));

	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		// console.log('    bid build (-l|--local)   :   进行本地构建（默认使用）');
		console.log('    bid build -o|--online   :   进行远端构建（暂不可用）');
		console.log('    bid build -l|--lint   :   本地构建并做代码检查');
		console.log('    bid build -d|--publishdaily   :   本地构建并发布到日常服务器');
		console.log('');
		process.exit(1);
	});

program
	.command('dev')
	.alias('d')
	.description('进行开发')
	.option('-p, --port [type]', '监听端口', '3333')
	.action(function(cmd, options) {
		console.log(successGreen('开启开发者模式'));
		webServer.start({
			// port: program.port,
			port: program.args[0].port,
			queit: program.quiet
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
		/*var dependencies = ' webpack gulp gulp-uglify del gulp-jshint gulp-inline-source gulp-htmlmin gulp-inline-css gulp-replace underscore gulp-util cli-color br-bid ';
		if (program.react) { // 初始化react工程
			dependencies += ' react react-dom redux react-redux redux-thunk';
		}*/
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
	.option('-f, --force [type]', '强制重新安装全部模块')
	.option('-g, --global', '全局模式')
	.action(function(cmd, options) {
		if (program.args[0].global) { // 更新全局依赖
			console.log(successGreen('正在更新全局依赖模块,请稍后'));
			var settings = {
				quiet: false
			};
			if (program.quiet) { // 安静模式
				settings.quiet = true;
			}
			if (program.args[0].force) { // 强制更新，则重新安装全部全局依赖npm模块
				settings.moduleName = program.args[0].force;
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
			exec('npm install ' + dependencies, {
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

program
	.command('iconfont')
	.description('iconfont ttf 2 base64')
	.option('-i, --input <file>', 'less或者css文件')
	.option('-o, --output <file>', '输出到此路径')
	.action(function(cmd, options) {
		console.log(infoBlue('现在开始 iconfont ttf 转换 base64 ...'));
		var parseUrl = function(text) {
			var urlRegex = /(https?:?)?(\/\/at.alicdn.com\/t\/font_.*\.ttf)/;
			if (urlRegex.exec(text)) {
				return 'http:' + RegExp.$2;
			}
			return false;
		};

		var parseLine = function(line) {
			return new Promise(function(resolve, reject) {
				var template = "    src: url(data:font/truetype;charset=utf-8;base64,<>) format('truetype');";
				var url = parseUrl(line);
				if (url) {
					urllib.request(url, function(err, data, res) {
						if (err) reject(err);
						var line = template.replace('<>', data.toString('base64'));
						resolve(line);
					})
				} else {
					resolve(line);
				}

			});
		};

		co(function*() {
			var input, output;
			if (program.args[0].input) {
				input = program.args[0].input;
			} else {
				process.exit(1);
			}
			var fileContent = fs.readFileSync(input).toString().split('\n');
			var arr = [];

			fileContent.forEach(function(line) {
				arr.push(parseLine(line));
			});
			var data = yield arr;

			// 有输出路径则写到对应文件，否则直接替换原文件
			if (program.args[0].output) {
				output = program.args[0].output;
				fs.writeFileSync(output, data.join('\n'));
				console.log(successGreen('替换完成！'));
			} else {
				fs.writeFileSync(input, data.join('\n'));
				console.log(warnYellow('没有指定输出路径，源文件替换完成！'));
			}
		});

	}).on('--help', function() {
		process.exit(1);
	});

program.parse(process.argv);