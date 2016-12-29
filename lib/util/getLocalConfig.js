/**
 * @fileOverview 读取工程根目录下的config.json
 * @author leo.yy
 */
var fs = require('fs');
var path = require('path');
var colors = require('cli-color');
var errorRed = colors.red;
var successGreen = colors.green;
var infoBlue = colors.blue;

var envPath = require('./env.js');
var configPath = path.join(envPath.cwdPath, 'config.json');

var configJSON = {};
try {
	configJSON = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : configPath;
	// configJSON['bid-js-entry'] = configJSON['bid-js-entry'] || {};
} catch (e) {
	console.log(errorRed('解析"config.json"时出错。'));
	process.exit(1);
}

module.exports = configJSON;