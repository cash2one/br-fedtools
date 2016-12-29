var path = require('path');
var webpackDevMiddleware = require('webpack-dev-middleware');
var Webpack = require('webpack');
var _config = require('../webpack.config')();
var envPath = require('./util/env');

module.exports = function (req, res, next) {
    var filePath = req.path;
    if (/index\.js$/.test(filePath)) {
        var currentBase = envPath.cwdPath;//process.cwd();
        var entryDir = 'src';
        var opDir = 'bulid';
        var outputDir = path.join(currentBase, opDir);
        var context =  path.join(currentBase, entryDir); // 必须是绝对路径
        var entryObj = {};
        var pageFile = filePath;
        var pageName = pageFile.substring(1, pageFile.length - 3);
        // entryObj[pageName] = './' + pageName + '.js';
        entryObj[pageName] = './' + pageName;
        // 定义全集load 目录; 吧node_modules目录加入到require中;
        _config.resolve.root = [context, path.join(__dirname, '../node_modules')];
        _config.entry = entryObj;
        _config.output.path = outputDir;
        return _config;
    } else {
        next();
    }
};