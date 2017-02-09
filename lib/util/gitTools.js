var Repo = require("git-tools");
var fs = require('fs');
var path = require('path');
var colors = require('cli-color');
var co = require('co');
var thunkify = require('thunkify');

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
						var filename = path.join(envPath.cwdPath, 'config.json');
						var data = JSON.stringify(configJSON);
						try {
							fs.writeFileSync(filename, data);
							console.log(successGreen('修改成功！'));
							return configJSON;
						} catch (err) {
							console.log(errorRed('config.json写入失败，请检查该文件'));
							console.log(errorRed(err));
							return false;
						}
					}
				} else {
					console.log(warnYellow('请在daily分支下进行开发：daily/x.y.z；'));
					return false;
				}
			} else {
				console.log(warnYellow('当前git环境异常。忽略config.verison更新'))
				return false;
			}
		});
	},
	setConfigVersionThunk: function(tagBranch, callback) {
		var version = configJSON.version;
		repo.remotes(function(err, remotes) {
			if (!err) {
				var gitRemotes = remotes[0].url;
				configJSON.remotes = gitRemotes;
				if (!tagBranch) { // 非tag发布
					repo.currentBranch(function(error, b) {
						var reg = /^daily\/\d+\.\d+\.\d+$/g; // 只允许发布daily/x.y.z分支的代码，为保证安全，不支持tag回滚发布
						if (reg.test(b)) {
							var branch = b.split('daily\/')[1];
							if (branch != version) {
								console.log(infoBlue('将config.version由', version, '替换为', branch));
								configJSON.version = branch;
								var filename = path.join(envPath.cwdPath, 'config.json');
								var data = JSON.stringify(configJSON);
								fs.writeFile(filename, data, function(err) {
									if (!err) {
										console.log(successGreen('修改成功！'));
										// return configJSON;
										return callback(err, configJSON);
									} else {
										console.log(errorRed('config.json写入失败，请检查该文件'));
										return callback(err, false);
									}
								});
							} else {
								console.log(successGreen('当前git环境正常：' + branch));
								return callback(error, configJSON);
							}
						} else {
							console.log(warnYellow('请在daily分支下进行发布：daily/x.y.z；'));
							return callback(error, false);
						}
					});
				} else { // tag发布
					var hasTagFlag = false;
					// todo bid tag version => 由tagBranch传递 publish/0.0.2
					repo.tags(function(error, branchs) {
						for (var index = 0; index < branchs.length; index++) {
							var item = branchs[index];
							if (item.name == tagBranch) {
								hasTagFlag = true;
							}
						}
						if (hasTagFlag) {
							console.log('Git中存在当前tag分支，可以发布');
							var pubreg = /^publish\/\d+\.\d+\.\d+$/g; // publish/x.y.z tag分支发布
							if (pubreg.test(tagBranch)) { // TODO 待测试！！
								var branch = tagBranch.split('publish\/')[1];
								console.log(infoBlue('将config.version由', version, '替换为', branch));
								configJSON.version = branch;
								var filename = path.join(envPath.cwdPath, 'config.json');
								var data = JSON.stringify(configJSON);
								fs.writeFile(filename, data, function(err) {
									if (!err) {
										console.log(successGreen('修改成功！'));
										// return configJSON;
										return callback(err, configJSON);
									} else {
										console.log(errorRed('config.json写入失败，请检查该文件'));
										return callback(err, false);
									}
								});
							} else {
								console.log(warnYellow('请在publish分支下进行发布：publish/x.y.z；'));
								return callback(error, false);
							}
						} else {
							console.log('Git中不存在当前tag分支，发布终止');
						}
						/**/
					});
				}
			} else {
				return callback(err, false);
			}
		});
	}

};