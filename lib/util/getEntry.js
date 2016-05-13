/**
 * 获取/src/p下面的所有index.js入口文件，并返回数组
 * @param {String} dir
 * @returns {Array}
 */
var envPath = require('./env');
var path = require('path');
var fs = require('fs');
var entry = {};
var getJsEntry = function(dir) {
	fs.readdirSync(dir).forEach(function(file) {
		var pathname = path.join(dir, file);

		if (fs.statSync(pathname).isDirectory()) {
			getJsEntry(pathname);
		} else {
			if (/index\.js$/.test(pathname)) {
				// entry.push(pathname);
				var relFileName = 'src/' + pathname.split('/src/')[1].split('.js')[0];
				entry[relFileName] = relFileName;
			}
		}
	});
	return entry;
}
module.exports = getJsEntry(path.join(envPath.cwdPath, './src/p'));