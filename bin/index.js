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
var dependencies = ' webpack gulp gulp-less gulp-uglify del gulp-jshint gulp-inline-source gulp-htmlmin gulp-inline-css gulp-replace jshint underscore gulp-util cli-color br-bid react react-dom redux react-redux redux-thunk';

var inquirer = require('inquirer');
var fs = require('fs');
var envPath = require('../lib/util/env');

var userConfig = require('../lib/util/getLocalConfig');
var buildInfos = require('../lib/util/getEntry')(userConfig.version);

var Promise = require('promise');
var write = Promise.denodeify(fs.writeFile);

var co = require('co');
var thunkify = require('thunkify');
var urllib = require('urllib');

var request = require('request');
var handleApi = thunkify(request.post);
var execThunk = thunkify(exec);

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
	// .option('-i, --input [type]', '路径')
	.action(function(cmd, options) {
		console.log(successGreen('开始代码检测'));
		var deployJSON = null;
		co(function*() {
			inquirer.prompt([{
				type: 'checkbox',
				name: 'selectedEntry',
				message: '请选择需要进行代码检测的页面:',
				choices: buildInfos.autoGetHtml.keys
			}]).then(function(answers) {
				deployJSON = answers;
				deployJSON.jsEntry = {};
				answers.selectedEntry.forEach(function(se, index) { // 生成发布列表，构建列表
					for (var htmlKey in buildInfos.autoGetHtml.jsEntry) {
						if (htmlKey.split(se).length > 1) {
							if (buildInfos.autoGetHtml.jsEntry[htmlKey]) {
								deployJSON.jsEntry[htmlKey] = buildInfos.autoGetHtml.jsEntry[htmlKey];
							}
							break;
						}
					}
				});
				return deployJSON;
			}).then(function(data) {
				if (data.selectedEntry.length == 0) {
					return console.log(errorRed('没有选择任何页面,检测结束'));
				}
				co(function*() {
					var filename = path.join(envPath.cwdPath, 'build.json');
					var jsonData = JSON.stringify(data);
					try {
						fs.writeFileSync(filename, jsonData);
						console.log(successGreen('build.json创建成功'));
					} catch (err) {
						console.log(errorRed('build.json写入失败，请检查该文件'));
						console.log(errorRed(JSON.stringify(err)));
					}
					var initTime = new Date().getTime();
					try {
						yield execThunk('gulp lint');
					} catch (err) {
						console.log(errorRed('代码检测异常！'));
						console.log(errorRed(err));
					}
					var nowTime = new Date().getTime();
					console.log(infoBlue('耗时:' + (nowTime - initTime) / 1000, 's'));
					console.log(successGreen('代码检测完成!'));
				});
			});
		});

	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('    bid lint   :   js代码规范检测');
		console.log('');
		process.exit(1);
	});

// program
// 	.command('build1')
// 	.alias('b')
// 	.description('进行构建')
// 	.option('-a, --buildall', '根据build全部页面')
// 	.option('-d, --publishdaily', '构建并发布发布日常')
// 	.option('-p, --publishpre', '构建并发布发布ali云预发服务器')
// 	.option('-o, --publishonline', '构建并发布发布ali云[线上]服务器')
// 	.action(function(cmd, options) {
// 		var env = '本地';
// 		if (false && program.args[0].online) { // 远端构建
// 			env = '远端';
// 		} else { // 本地构建
// 			var commands = 'gulp build';
// 			var entrySet = {
// 				jsEntry: {},
// 				htmlEntry: [] // 为空时将迁移全部html
// 			};
// 			var inquirerParams = [];
// 			var callbackFn = function() {}; // 构建成功后的回调
// 			var getInquirerBuild = function() { // 根据 -a 参数判断对哪些页面进行构建
// 				if (program.args[0].buildall) { // 对所有页面进行build

// 				} else { // 根据选择进行build
// 					inquirerParams.push({
// 						type: 'checkbox',
// 						name: 'selectedEntry',
// 						message: '请选择需要进行构建的页面:',
// 						choices: buildInfos.autoGetHtml.keys
// 					});
// 				}
// 			}
// 			if (program.args[0].publishdaily || program.args[0].publishpre || program.args[0].publishonline) {
// 				inquirerParams.push({
// 					type: 'input',
// 					name: 'userName',
// 					message: '请输入用户名'
// 				});
// 				getInquirerBuild();
// 				callbackFn = function(userName) {
// 					if (userName) { // 校验用户名
// 						var doPublish = function(confArr) {
// 							var scpStartTime = new Date().getTime();
// 							// exec('scp -r ./build root@101.200.132.102:/home', {
// 							// exec('scp -r ./build/ ' + userName + '@192.168.180.10:/opt/www/minions', {
// 							// 由于服务器端免密钥或交互式shell需要运维配合，开发成本较高，必所以暂时使用手工创建日常服务器项目目录的办法；
// 							// 日常发布时，须保证服务器上已经存在项目文件夹，否则需要手动新建，并将owner设置为www,权限777,否则可能会影响日常发布
// 							// console.log('scp -r ./build/* ' + userName + '@' + publishHost + ':' + publishPath + userConfig.appName)
// 							confArr.forEach(function(item) {
// 								var scpCmd = 'scp -r ./build/* ' + userName + '@' + item.host + ':' + item.path + userConfig.appName
// 								console.log(scpCmd);
// 								exec(scpCmd, {
// 									async: true
// 								}, function(code, output) {
// 									var nowTime = new Date().getTime();
// 									console.log(successGreen('已成功上传到 [' + serverType + ']（' + item.host + '） 服务器!'));
// 									console.log(infoBlue('上传耗时:' + (nowTime - scpStartTime) / 1000, 's'));
// 								});
// 							});
// 						}
// 						var serverType = '默认';
// 						try {
// 							if (program.args[0].publishdaily) { // 发布日常
// 								serverType = '日常';
// 								doPublish(userConfig.publish.daily)
// 							} else if (program.args[0].publishpre) { // 发布预发阿里云
// 								serverType = '预发';
// 								doPublish(userConfig.publish.pre)
// 							} else if (program.args[0].publishonline) { // 发布线上阿里云
// 								serverType = '线上';
// 								doPublish(userConfig.publish.online)
// 							} else {
// 								warnYellow('发布未成功，因为您没有指定正确的发布环境');
// 							}
// 						} catch (e) {
// 							console.log(errorRed('config.json发布配置错误，' + serverType + '发布失败'));
// 							console.log(errorRed(e));
// 						}
// 					} else {
// 						console.log(errorRed('上传失败，无法解析您输入的userName'));
// 					}
// 				}
// 			} else { // 不发布，仅build
// 				getInquirerBuild();
// 			}

// 			inquirer.prompt(inquirerParams).then(function(answers) {
// 				entrySet.userName = answers.userName ? answers.userName : null;
// 				if (!program.args[0].buildall) { // 通过选择进行build
// 					answers.selectedEntry.forEach(function(se, index) {
// 						for (var htmlKey in buildInfos.autoGetHtml.jsEntry) {
// 							if (htmlKey.split(se).length > 1) {
// 								var tmpSrc = './' + htmlKey + '.html';
// 								if (userConfig.version) {
// 									tmpSrc = tmpSrc.replace(userConfig.version + '/', '');
// 								}
// 								if (buildInfos.autoGetHtml.jsEntry[htmlKey]) {
// 									entrySet.jsEntry[htmlKey] = buildInfos.autoGetHtml.jsEntry[htmlKey];
// 								}

// 								entrySet.htmlEntry.push(tmpSrc);
// 								return true;
// 							}
// 						}
// 					});
// 				} else { // buildall 自动根据匹配规则（匹配所有src/p/**/index.js）寻找JS入口文件并打包
// 					entrySet.jsEntry = buildInfos.autoGetEntry;
// 				}

// 				var chmod777 = function(callback) {
// 					var start777 = new Date().getTime();
// 					exec('chmod -R 777 ./build', {
// 						async: true,
// 						silent: program.quiet
// 					}, function(code, output) {
// 						var end777 = new Date().getTime();
// 						console.log(successGreen('修改build权限完成，共耗时:' + (end777 - start777) / 1000, 's'));
// 						// chmod777();
// 					});
// 				}

// 				var filename = path.join(envPath.cwdPath, 'build.json');
// 				var data = JSON.stringify(entrySet);
// 				fs.writeFile(filename, data, function(err) {
// 					if (!err) {
// 						console.log(successGreen('build.json创建成功'));
// 						commands += ' --entry ' + filename;
// 						var initTime = new Date().getTime();
// 						console.log(commands)
// 						exec(commands, {
// 							async: true,
// 							silent: program.quiet
// 						}, function(code, output) {
// 							chmod777();
// 							console.log('done 777')
// 							console.log('done 777')
// 							console.log('done 777')
// 							callbackFn(entrySet.userName);
// 							var nowTime = new Date().getTime();
// 							console.log(infoBlue('耗时:' + (nowTime - initTime) / 1000, 's'));
// 							console.log(successGreen('构建完毕!'));
// 						});
// 					} else {
// 						console.log(errorRed('build.json写入失败，请检查该文件'));
// 					}
// 				});

// 			});
// 		}
// 		console.log(successGreen('开启' + env + '构建'));

// 	}).on('--help', function() {
// 		console.log('  举个栗子:');
// 		console.log('');
// 		console.log('    bid build -d|--publishdaily   :   本地构建并发布到日常服务器');
// 		console.log('    bid build -p|--publishpre   :   本地构建并发布到预发服务器');
// 		console.log('    bid build -o|--online   :   本地构建并发布到线上服务器');
// 		console.log('');
// 		process.exit(1);
// 	});

program
	.command('build')
	.alias('p')
	.description('进行构建')
	.action(function(cmd, options) {
		var deployJSON = null; // build.json源
		var isPublish = false; // 是否构建后调用发布接口
		var configure = {}; // 读取自本地工程config.json配置
		var setConfigVersion = thunkify(function(callback) { // 检测当前git所处分支，并配置config.json
			gitTools.setConfigVersionThunk(function(err, config) {
				return callback(err, config);
			});
		});

		co(function*() {
			try {
				configure = yield setConfigVersion(); // 检测git分支，设置config.version，并返回新的分支
			} catch (e) {
				console.log(errorRed('警告：当前不是git开发环境！'))
			}
			inquirer.prompt([{
				type: 'input',
				name: 'username',
				message: '请输入您的用户名:'
			}, {
				type: 'list',
				name: 'env',
				message: '请选择发布环境:',
				choices: [{
						name: '日常发布（相对路径构建，同时构建发布js、html）',
						value: 'daily'
					}, {
						name: '预发发布（相对路径构建，同时构建发布js、html）',
						value: 'pre'
					}, {
						name: '线上发布（CDN路径构建，仅构建发布html）',
						value: 'production'
					}] //['本地生成部署配置', '日常环境', '预发环境', '线上环境']
			}, {
				type: 'checkbox',
				name: 'selectedEntry',
				message: '请选择需要进行构建的页面:',
				choices: buildInfos.autoGetHtml.keys
			}]).then(function(answers) {
				deployJSON = answers;
				deployJSON.htmlEntry = [];
				deployJSON.jsEntry = {};
				deployJSON.appName = configure.appName; // 应用名
				deployJSON.remotes = configure.remotes; // Git远端地址
				deployJSON.version = configure.version; // Git分支版本
				deployJSON.publish = configure.publish; // 发布配置信息
				deployJSON.cdnhost = configure.cdnhost; // 静态资源cdn域名

				answers.selectedEntry.forEach(function(se, index) { // 生成发布列表，构建列表
					for (var htmlKey in buildInfos.autoGetHtml.jsEntry) {
						if (htmlKey.split(se).length > 1) {
							var tmpSrc = './' + htmlKey + '.html';
							if (configure.version) {
								tmpSrc = tmpSrc.replace(configure.version + '/', '');
							}
							if (buildInfos.autoGetHtml.jsEntry[htmlKey]) {
								deployJSON.jsEntry[htmlKey] = buildInfos.autoGetHtml.jsEntry[htmlKey];
							}
							deployJSON.htmlEntry.push(tmpSrc);
							break;
						}
					}
				});
				return deployJSON;
			}).then(function(data) {
				if (data.selectedEntry.length == 0) {
					return console.log(errorRed('没有选择任何页面,构建结束'));
				}
				co(function*() {
					var filename = path.join(envPath.cwdPath, 'build.json');
					console.log(successGreen('gulp deploy --entry ' + filename + ' --env ' + data.env));
					var jsonData = JSON.stringify(data);
					try {
						fs.writeFileSync(filename, jsonData);
						console.log(successGreen('build.json创建成功'));
					} catch (err) {
						console.log(errorRed('build.json写入失败，请检查该文件'));
						console.log(errorRed(JSON.stringify(err)));
					}

					try {
						yield execThunk('gulp deploy --entry ' + filename + ' --env daily'); // 在本地进行build
					} catch (e) {
						console.log(errorRed('本地线上构建失败！'));
						console.log(errorRed(JSON.stringify(e)));
					}

					var chmod777 = function(callback) {
						var start777 = new Date().getTime();
						exec('chmod -R 777 ./deploy', {
							async: true,
							silent: program.quiet
						}, function(code, output) {
							var end777 = new Date().getTime();
							console.log(successGreen('修改build权限777完成，共耗时:' + (end777 - start777) / 1000, 's'));
							// chmod777();
						});
					}

					chmod777();
					callbackFn = function(userName) {
						if (userName) { // 校验用户名
							var serverType = '默认';
							var doPublish = function(confArr) {
								var scpStartTime = new Date().getTime();
								// exec('scp -r ./build root@101.200.132.102:/home', {
								// exec('scp -r ./build/ ' + userName + '@192.168.180.10:/opt/www/minions', {
								// 由于服务器端免密钥或交互式shell需要运维配合，开发成本较高，必所以暂时使用手工创建日常服务器项目目录的办法；
								// 日常发布时，须保证服务器上已经存在项目文件夹，否则需要手动新建，并将owner设置为www,权限777,否则可能会影响日常发布
								// console.log('scp -r ./build/* ' + userName + '@' + publishHost + ':' + publishPath + userConfig.appName)
								confArr.forEach(function(item) {
									var scpCmd = 'scp -r ./deploy/build/* ' + userName + '@' + item.host + ':' + item.path + userConfig.appName
									console.log(scpCmd);
									exec(scpCmd, {
										async: true
									}, function(code, output) {
										var nowTime = new Date().getTime();
										console.log(successGreen('已成功上传到 [' + serverType + ']（' + item.host + '） 服务器!'));
										console.log(infoBlue('上传耗时:' + (nowTime - scpStartTime) / 1000, 's'));
									});
								});
							}
							try {
								if (data.env === 'daily') { // 发布日常
									serverType = '日常';
									doPublish(userConfig.publish.daily)
								} else if (data.env === 'pre') { // 发布预发阿里云
									serverType = '预发';
									doPublish(userConfig.publish.pre)
								} else if (data.env === 'production') { // 发布线上阿里云
									serverType = '线上';
									doPublish(userConfig.publish.production);
								} else {
									warnYellow('发布未成功，因为您没有指定正确的发布环境');
								}
							} catch (e) {
								console.log(errorRed('config.json发布配置错误，' + serverType + '发布失败'));
								console.log(errorRed(e));
							}
						} else {
							console.log(errorRed('上传失败，无法解析您输入的userName'));
						}
					}
					callbackFn(data.username);
					console.log(successGreen('构建完毕!'));
				});
			});
		});
	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('bid deploy');
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
			console.log(infoBlue('正在安装工程构建所需要的依赖模块...'));
			var initTime = new Date().getTime();
			fileGenerator.dependenciesGenerator({ // 复制依赖文件Node_modules
				'dirname': dirname
			}, function(error) {
				var nowTime = new Date().getTime();
				if (!error) {
					console.log(successGreen('依赖文件拷贝完成!'), infoBlue('共耗时:' + (nowTime - initTime) / 1000, 's'));
				} else {
					console.log(errorRed('拷贝依赖文件失败!'), infoBlue('共耗时:' + (nowTime - initTime) / 1000, 's'));
					console.log(errorRed(error));
				}
			});
		});
	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('    bid init     ,   在当前路径下初始化[通用]工程目录');
		console.log('    bid init -r  ,   在当前路径下初始化[react]工程目录');
		console.log('');
		process.exit(1);
	});

program
	.command('update')
	.alias('u')
	.description('更新工程构建所需要的依赖模块')
	.action(function(cmd, options) {
		console.log(infoBlue('开始更新工程构建所需要的依赖模块...'));
		var initTime = new Date().getTime();
		var dirname = path.join(process.cwd(), './');
		fileGenerator.dependenciesGenerator({ // 复制依赖文件Node_modules
			'dirname': dirname
		}, function(error) {
			var nowTime = new Date().getTime();
			if (!error) {
				console.log(successGreen('依赖更新完成!'), infoBlue('共耗时:' + (nowTime - initTime) / 1000, 's'));
			} else {
				console.log(errorRed('拷贝依赖文件失败!'), infoBlue('共耗时:' + (nowTime - initTime) / 1000, 's'));
				console.log(errorRed(error));
			}
		});

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

program
	.command('deploy')
	.alias('p')
	.description('进行构建')
	.action(function(cmd, options) {
		var deployJSON = null; // build.json源
		var isPublish = false; // 是否构建后调用发布接口
		var configure = {}; // 读取自本地工程config.json配置
		var setConfigVersion = thunkify(function(callback) { // 检测当前git所处分支，并配置config.json
			gitTools.setConfigVersionThunk(function(err, config) {
				return callback(err, config);
			});
		});

		co(function*() {
			try {
				configure = yield setConfigVersion(); // 检测git分支，设置config.version，并返回新的分支
			} catch (e) {
				console.log(errorRed('警告：当前不是git开发环境！'))
			}
			// configure = yield setConfigVersion(); // 检测git分支，设置config.version，并返回新的分支
			buildInfos = require('../lib/util/getEntry')(configure.version); // 使用新的git version重新更新buildInfo
			inquirer.prompt([{
				type: 'input',
				name: 'username',
				message: '请输入您的用户名:'
			}, {
				type: 'password',
				name: 'password',
				message: '请输入您的密码:'
			}, {
				type: 'list',
				name: 'env',
				message: '请选择发布环境:',
				choices: [{
						name: '本地生成部署配置',
						value: 'local'
					}, {
						name: '日常发布（相对路径构建，同时构建发布js、html）',
						value: 'daily'
					}, {
						name: '预发发布（相对路径构建，同时构建发布js、html）',
						value: 'pre'
					}, {
						name: '【本地构建】线上方式（在本地完成构建，但不发布）',
						value: 'production-build'
					}, {
						name: '线上发布（CDN路径构建，仅构建发布html）',
						value: 'production'
					}] //['本地生成部署配置', '日常环境', '预发环境', '线上环境']
			}, {
				type: 'checkbox',
				name: 'selectedEntry',
				message: '请选择需要进行构建的页面:',
				choices: buildInfos.autoGetHtml.keys
			}, {
				type: 'confirm',
				name: 'forceupdate',
				message: '是否在构建时对项目依赖进行升级（可能会减慢编译速度）',
				default: false
			}]).then(function(answers) {
				deployJSON = answers;
				deployJSON.htmlEntry = [];
				deployJSON.jsEntry = {};
				deployJSON.appName = configure.appName; // 应用名
				deployJSON.remotes = configure.remotes; // Git远端地址
				deployJSON.version = configure.version; // Git分支版本
				deployJSON.publish = configure.publish; // 发布配置信息
				deployJSON.cdnhost = configure.cdnhost; // 静态资源cdn域名

				if (answers.selectedEntry.length) {
					answers.selectedEntry.forEach(function(se, index) { // 生成发布列表，构建列表
						for (var htmlKey in buildInfos.autoGetHtml.jsEntry) {
							if (htmlKey.split(se).length > 1) {
								var tmpSrc = './' + htmlKey + '.html';
								if (configure.version) {
									tmpSrc = tmpSrc.replace(configure.version + '/', '');
								}
								if (buildInfos.autoGetHtml.jsEntry[htmlKey]) {
									deployJSON.jsEntry[htmlKey] = buildInfos.autoGetHtml.jsEntry[htmlKey];
								}
								deployJSON.htmlEntry.push(tmpSrc);
								break;
							}
						}
					});
					return deployJSON;
				} else {
					return false;
				}
			}).then(function(data) {
				if (data) {
					// var platformHost = 'http://platform.100credit.com';
					var platformHost = false;
					var deployDoAPI = false;
					co(function*() {
						var filename = path.join(envPath.cwdPath, 'build.json');
						console.log(successGreen('gulp deploy --entry ' + filename + ' --env ' + data.env));
						var jsonData = JSON.stringify(data);
						try {
							fs.writeFileSync(filename, jsonData);
							console.log(successGreen('build.json创建成功'));
						} catch (err) {
							console.log(errorRed('build.json写入失败，请检查该文件'));
							console.log(errorRed(JSON.stringify(err)));
						}
						if (data.env === 'local') { // 默认只生成build.json
							isPublish = false;
							console.log(successGreen('生成发布配置成功，请查看工程目录下的build.json文件。'));
							try {
								yield execThunk('gulp deploy --entry ' + filename + ' --env daily'); // 在本地进行线上构建
								console.log(successGreen('本地日常构建完成!'));
							} catch (e) {
								console.log(errorRed('本地日常构建失败！'));
								console.log(errorRed(JSON.stringify(e)));
							}
						} else if (data.env === 'daily') {
							isPublish = true;
							try {
								platformHost = configure.publishAPI[data.env].host;
								deployDoAPI = platformHost + configure.publishAPI[data.env].deployDo;
							} catch (err) {
								return console.log(errorRed('config.js中的publishAPI.daily字段异常.发布结束'));
							}
						} else if (data.env === 'pre') {
							isPublish = true;
							try {
								platformHost = configure.publishAPI[data.env].host;
								deployDoAPI = platformHost + configure.publishAPI[data.env].deployDo;
							} catch (err) {
								return console.log(errorRed('config.js中的publishAPI.pre字段异常.发布结束'));
							}
						} else if (data.env === 'production') {
							isPublish = true;
							try {
								platformHost = configure.publishAPI[data.env].host;
								deployDoAPI = platformHost + configure.publishAPI[data.env].deployDo;
							} catch (err) {
								return console.log(errorRed('config.js中的publishAPI.production字段异常.发布结束'));
							}
						} else if (data.env === 'production-build') { // 使用线上构建方式，在本地完成构建，但不发布
							isPublish = false;
							try {
								yield execThunk('gulp deploy --entry ' + filename + ' --env production'); // 在本地进行线上构建
							} catch (e) {
								console.log(errorRed('本地线上构建失败！'));
								console.log(errorRed(JSON.stringify(e)));
							}
						}
						try {
							if (isPublish && platformHost && deployDoAPI) {
								var resp = yield handleApi({ // 调用发布接口
									url: deployDoAPI,
									form: data
								});
								var res = {};
								try {
									res = JSON.parse(resp[1]); // 获取res.body
								} catch (e) {
									console.log(errorRed('发布接口返回异常'));
									console.log(errorRed(JSON.stringify(e)));
								}
								if (res.code == 200) {
									console.log(successGreen('正在进行' + data.env + '发布:' + res.data.publishKey));
									console.log(successGreen('请在以下页面中查看发布进度: ' + platformHost + '/awp/logmonitor?f=' + data.appName + '/' + res.data.publishKey + '.log'));
								} else {
									console.log(errorRed('发布异常'));
									console.log(errorRed(JSON.stringify(res)));
								}
							}
						} catch (e) {
							console.log(errorRed('发布异常'));
							console.log(errorRed(JSON.stringify(e)));
						}
						console.log(successGreen('操作完成。'));
					});
				} else {
					console.log(errorRed('发布结束：您没有选择任何页面。'));
				}
			});
		});
	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('bid deploy');
		console.log('');
		process.exit(1);
	});

program
	.command('tag') // 由git hock触发shell脚本，shell拉取指定tag之后，调用bid tag,
	.alias('p')
	.description('执行git tag，通过sh，全量发布Javascript至cdn；并且使用线上cdn js资源构建及发布html到预发环境')
	.action(function(cmd, options) {
		var deployJSON = {};
		var configure = {};

		var setConfigVersion = thunkify(function(callback) {
			gitTools.setConfigVersionThunk(function(err, config) {
				return callback(err, config);
			});
		});

		co(function*() {
			try {
				configure = yield setConfigVersion(); // 检测git分支，设置config.version，并返回新的分支
			} catch (e) {
				console.log(errorRed('警告：当前不是git开发环境！'))
			}
			// configure = yield setConfigVersion(); // 检测git分支，设置config.version，并返回新的分支
			buildInfos = require('../lib/util/getEntry')(configure.version); // 使用新的git version重新更新buildInfo
			deployJSON.jsEntry = buildInfos.autoGetEntry;
			deployJSON.htmlEntry = []; // 数组为空时，gulp默认构建全部./src/p/**/*.html
			deployJSON.version = configure.version; // Git分支版本
			deployJSON.appName = configure.appName; // 应用名
			deployJSON.remotes = configure.remotes; // Git远端地址
			deployJSON.publish = configure.publish; // 发布配置信息
			deployJSON.cdnhost = configure.cdnhost; // 静态资源cdn域名

			var filename = path.join(envPath.cwdPath, 'build.json');
			var jsonData = JSON.stringify(deployJSON);
			try {
				fs.writeFileSync(filename, jsonData);
				console.log(successGreen('build.json创建成功'));
			} catch (err) {
				console.log(errorRed('build.json写入失败，请检查该文件'));
				console.log(errorRed(err));
			}
			var commands = 'gulp deploy --entry ' + filename + ' --env tag';
			console.log(successGreen(commands));
			var initTime = new Date().getTime();
			exec(commands, {
				async: true,
				silent: program.quiet
			}, function(code, output) {
				var nowTime = new Date().getTime();
				console.log(infoBlue('耗时:' + (nowTime - initTime) / 1000, 's'));
				console.log(successGreen('javascripts资源构建完毕!'));
			});

		});

	}).on('--help', function() {
		console.log('  举个栗子:');
		console.log('');
		console.log('bid tag');
		console.log('');
		process.exit(1);
	});

program.parse(process.argv);