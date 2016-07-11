/**
 * 
 * @fileOverview 获取/src/p下面的所有index.js入口文件，并返回数组
 * @author leo.yy
 * 
 */
var envPath = require('./env');
var path = require('path');
var fs = require('fs');

var devFilePath = path.join(envPath.cwdPath, './src/p');

var isInit = fs.existsSync(devFilePath, function (exists) { // 是否已经bid init……
  return exists;
});

var autoGetEntry = function(version) {
	// 传递config.json的version字段，则自动在输出位置增加@version匹配。否则忽略@version
	var entry = {};
	var getJsEntry = function(dir) {
		fs.readdirSync(dir).forEach(function(file) {
			var pathname = path.join(dir, file);

			if (fs.statSync(pathname).isDirectory()) {
				getJsEntry(pathname);
			} else {
				if (/index\.js$/.test(pathname)) {
					var relFileName = './src/' + pathname.split('/src/')[1];
					// var v = version ? '@version/' : '';
					var v = version ? version+'/' : '';
					var relFileKey = 'src/' + pathname.split('/src/')[1].split('index.js')[0] + v + 'index';
					entry[relFileKey] = relFileName;
				}
			}
		});
		return entry;
	}
	// return getJsEntry(path.join(envPath.cwdPath, './src/p'));
	if (isInit) {
		return getJsEntry(devFilePath);
	} else {
		return {};
	}
};

var autoGetHtml = function(version) {
	// 传递config.json的version字段，则自动在输出位置增加@version匹配。否则忽略@version
	var html = {
		keys: [],
		jsEntry: {

		}
	};
	var getJsHtml = function(dir) {
		fs.readdirSync(dir).forEach(function(file) {
			var pathname = path.join(dir, file);

			if (fs.statSync(pathname).isDirectory()) {
				getJsHtml(pathname);
			} else {
				if (/index\.html$/.test(pathname)) {
					var relFileName = './src/' + pathname.split('/src/')[1];
					// var v = version ? '@version/' : '';
					var v = version ? version+'/' : '';
					var relFileKey = 'src/' + pathname.split('/src/')[1].split('index.html')[0] + v + 'index';
					var tmpJS = relFileName.replace(/\.html$/g,'.js');
					fs.exists(path.join(envPath.cwdPath, tmpJS), function(exists) {
						if (exists) {
							html.jsEntry[relFileKey] = tmpJS;
						} else {
							html.jsEntry[relFileKey] = false;
						}
					});
					html.keys.push(relFileKey);
				}
			}
		});
		return html;
	}
	// return getJsHtml(path.join(envPath.cwdPath, './src/p'));
	if (isInit) {
		return getJsHtml(devFilePath);
	} else {
		return {};
	}
};

var buildInfos = function(version) {
	return {
		autoGetEntry: autoGetEntry(version),
		autoGetHtml: autoGetHtml(version)
	}
};

module.exports = buildInfos;