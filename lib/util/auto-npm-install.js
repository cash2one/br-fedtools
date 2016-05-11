#!/usr/bin/env node

'use strict';

require('shelljs/global');
var path = require('path');
var color = require('cli-color');
var success = color.green;
var info = color.blue;

var rootPath = path.join(__dirname, '../../');

function deleteTnpmInfo(output) {
	// return output.replace(/^.+WARNING.*tnpm 推荐[\s\S]+tnpm@stable/ig, '');
	return output;
}

module.exports = {
	update: function(settings, callback) { // 自动更新模块
		console.log(info('正在自动执行 npm update && npm dedupe 以更新依赖模块版本……'));
		var initTime = new Date().getTime();

		exec('cd ' + rootPath + ' && npm update && npm dedupe -d', {
			async: true,
			silent: settings.quiet
		}, function(code, output) {
			var nowTime = new Date().getTime();
			console.log('耗时:' + (nowTime - initTime));
			console.log(success('npm update && npm dedupe 执行完毕!'));
			callback && callback();
		});
	},
	install: function(settings, callback) { // 重新安装指定模块
		console.log(info('正在自动执行 npm install ' + settings.moduleName + ' --force 以强制重新安装依赖模块……'));
		var initTime = new Date().getTime();

		exec('cd ' + rootPath + ' && npm install ' + settings.moduleName + ' --force', {
			async: true,
			silent: settings.quiet
		}, function(code, output) {
			var nowTime = new Date().getTime();
			console.log('耗时:' + (nowTime - initTime));
			console.log(success('npm install ' + settings.moduleName + ' --force 执行完毕!'));
			callback && callback();
		});
	}
};