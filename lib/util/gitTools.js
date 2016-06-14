var Repo = require("git-tools");
var fs = require('fs');
var path = require('path');
var colors = require('cli-color');

var errorRed = colors.red;
var successGreen = colors.green;
var infoBlue = colors.blue;
var warnYellow = colors.yellow;
var envPath = require('./env');
var configJSON = require('./getLocalConfig');
var repo = new Repo(envPath.cwdPath);

module.exports = {
	setConfigVersion: function() {
		var version = configJSON.version;
		repo.currentBranch(function(error, b) {
			if (!error) {
				var reg = /^daily\/\d+\.\d+\.\d+$/g;
				if (reg.test(b)) {
					var branch = b.split('daily\/')[1];
					if (branch != version) {
						console.log(infoBlue('将config.version由', version, '替换为', branch));
						configJSON.version = branch;
						var filename = path.join(envPath.cwdPath,'config.json');
						var data = JSON.stringify(configJSON);
						fs.writeFile(filename, data, function(err){
							if (!err) {
								console.log(successGreen('修改成功！'));
							} else {
								console.log(errorRed('config.json写入失败，请检查该文件'));
							}
						});
					}
				} else {
					console.log(warnYellow('请在daily分支下进行开发：daily/x.y.z；'));
				}
			} else {
				console.log(warnYellow('当前git环境异常。忽略config.verison更新'))
			}
		});
	}
};