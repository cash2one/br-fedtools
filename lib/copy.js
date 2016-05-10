/*
 * copy file or directory
 */
var fs = require('fs-extra');

module.exports = function(src, dest) {
    try {
        fs.copySync(src, dest);
    } catch (err) {
        console.error('Oh no, there was an error: ' + err.message)
    }
};
// fs.copy //拷贝文件, 目录;
// fs.copySync //拷贝文件, 目录;
// fs.ensureFile //创建文件
// fs.ensureDir //创建目录