/**
 * 初始化目录 - 初始文件生成器 
 * 在当前目录下生成：
 * -----------
 * src/
 *   ./c
 *   ./p
 * config.js 别名、js入口配置
 * gulpfile.js 打包相关配置
 * -----------
 */

// #!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var colors = require('cli-color');
var errorRed = colors.red;
var successGreen = colors.green;


var FileGenerator = module.exports = 
{
	commonGenerator: function(args, callback) {
		var cwd = process.cwd();

		var dirname = args.dirname;
		var targetPath = '';

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
				console.log(successGreen('创建成功！'));
				if (typeof callback == 'function') {
					callback();
				}
			});
		});
	}
}