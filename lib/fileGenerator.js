/**
 * 初始化目录 - 初始文件生成器 
 * 在当前目录下生成：
 * -----------
 * src/
 *   ./c
 *   ./p
 * config.js 别名、js入口配置
 * gulpfile.js 打包相关配置
 * .jshintrc lint相关配置
 * -----------
 */

// #!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var colors = require('cli-color');
var errorRed = colors.red;
var successGreen = colors.green;


var FileGenerator = module.exports = {
	commonGenerator: function(args, callback) {
		// var cwd = process.cwd();

		var dirname = args.dirname;
		var targetPath = '';
		var commonFilePath = path.join(path.join(__dirname, '..'), 'examples/commonFiles');

		if (!args.react) {
			targetPath = path.join(path.join(__dirname, '..'), 'examples/normal');
		} else {
			targetPath = path.join(path.join(__dirname, '..'), 'examples/react');
		}

		if (!dirname) {
			console.log(errorRed('Error - 找不到对应目录:', dirname));
			process.exit(1);
		}

		fs.exists(path.join(dirname, './src'), function(exists) {
			if (exists) {
				console.log(errorRed('Error - 已经存在重复目录结构:', dirname));
				process.exit(1);
			}

			fse.copy(targetPath, dirname, {}, function() {
				console.log(successGreen('目录结构创建成功！'));
				if (typeof callback == 'function') {
					callback();
				}
			});
			fse.copy(commonFilePath, dirname, {}, function() {
				console.log(successGreen('配置文件创建成功！'));
			})
		});
	},
	dependenciesGenerator: function(args, callback) {
		// 安装gulp构建所需的全部依赖：
		// 	 1. 拷贝全局br-bid下的node_modules至项目根目录
		// 	 2. 拷贝全局br-bid/examples/gulpfile.js至项目根目录
		// 	 3. 拷贝全局br-bid至项目根目录/node_modules/
		var error = false;
		var dirname = args.dirname;
		var nodeModulesDestPath = path.join(dirname, 'node_modules'); // 目标路径
		var nodeModulesPath = path.join(path.join(__dirname, '..'), 'node_modules/'); // 源路径
		var gulpfileDestPath = path.join(dirname, './gulpfile.js'); // 目标路径
		var gulpfilePath = path.join(path.join(__dirname, '..'), 'examples/commonFiles/gulpfile.js'); // 源路径
		var bidDestPath = path.join(dirname, 'node_modules/br-bid');  // 目标路径
		var bidPath = path.join(__dirname, '../../br-bid'); // 源路径

		fse.copy(nodeModulesPath, nodeModulesDestPath, {
			overwrite: true
		}, function(error) {
			if (typeof callback == 'function' && error) {
				return callback(error);
			}
			console.log(successGreen('相关依赖复制成功！'));
			fse.copy(gulpfilePath, gulpfileDestPath, {
				overwrite: true
			}, function(err) {
				console.log(successGreen('gulpfile.js拷贝成功！'));
				if (typeof callback == 'function' && err) {
					return callback(err);
				}
				fse.copy(bidPath, bidDestPath, {
					overwrite: true
				}, function(e) {
					console.log(successGreen('br-bid拷贝成功！'));
					if (typeof callback == 'function') {
						callback(e);
					}
				});
			});
		});
	}
}