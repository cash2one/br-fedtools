/**
 * 
 * @fileOverview 环境path
 * @author leo.yy
 * 
 */
var path = require('path');

module.exports = {
	rootPath: path.join(__dirname,'../../'), // bid工具全局root path
	cwdPath: process.cwd() // 工程项目root path
}