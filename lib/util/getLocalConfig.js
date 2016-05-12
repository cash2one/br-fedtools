var fs = require('fs');
var path = require('path');

var colors = require('cli-color');
var errorRed = colors.red;
var successGreen = colors.green;
var infoBlue = colors.blue;

var userCurrentPath = process.cwd();
var configPath = path.join(userCurrentPath, 'config.json');
var configJSON = {};
try {
	configJSON = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : configPath;
	configJSON['bid-js-entry'] = configJSON['bid-js-entry'] || {};
} catch (e) {
	console.log(errorRed('解析"config.json"出错。'));
	process.exit(1);
}
module.exports = configJSON;