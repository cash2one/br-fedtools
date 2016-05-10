/**
 *初始化目录
 */

// #!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var fse = require('fs-extra');
var colors = require('colors');

var targetPath = path.join(path.join(__dirname, '..'), 'examples');

var FileGenerator = module.exports = function(dirname) {
	var cwd = process.cwd();

	// var dirname = path.join(__dirname, './src');

	if (!dirname) {
		console.log(colors.red('Error - 找不到对应目录:',dirname));
		process.exit(1);
	}

	fs.exists(dirname, function(exists) {
		if (exists) {
			console.log(colors.red('Error - 已经存在重复目录结构:',dirname));
			process.exit(1);
		}

		fse.copy(targetPath, dirname, {},function(){
			console.log(colors.green('创建成功！'));
		});
	});
};