/**
 * 初始化目录 - 初始文件生成器 
 * 在当前目录下生成：
 * -----------
 * src/
 *   ./c
 *   ./p
 * config.js
 * -----------
 */

// #!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var colors = require('cli-color');
var errorRed = colors.red;
var successGreen = colors.green;

var targetPath = path.join(path.join(__dirname, '..'), 'examples');

var FileGenerator = module.exports = function(dirname, callback) {
	var cwd = process.cwd();

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
			if (typeof callback=='function'){
				callback();
			}
		});
	});
};