/**
 * 
 * @fileOverview 获取/src/p下面的所有index.js入口文件，并返回数组
 * @author leo.yy
 * 
 */
var envPath = require('./env');
var path = require('path');
var fs = require('fs');
var entry = {};
var autoGetEntry = function(version) {
	// 传递config.json的version字段，则自动在输出位置增加@version匹配。否则忽略@version
	var getJsEntry = function(dir) {
		fs.readdirSync(dir).forEach(function(file) {
			var pathname = path.join(dir, file);

			if (fs.statSync(pathname).isDirectory()) {
				getJsEntry(pathname);
			} else {
				if (/index\.js$/.test(pathname)) {
					// entry.push(pathname);
					var relFileName = './src/' + pathname.split('/src/')[1];
					var v = version ? '@version/' : '';
					var relFileKey = 'src/' + pathname.split('/src/')[1].split('index.js')[0] + v + 'index';
					entry[relFileKey] = relFileName;
				}
			}
		});
		return entry;
	}
	return getJsEntry(path.join(envPath.cwdPath, './src/p'));
};
module.exports = autoGetEntry;