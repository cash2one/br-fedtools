var path = require('path');
var webpackDevMiddleware = require('webpack-dev-middleware');
var Webpack = require('webpack');
var _config = require('../webpack.config');
//var LessPluginCleanCSS = require('less-plugin-clean-css');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// EMSGetContext().environment === 'production'
module.exports = function (req, res, next) {
    var filePath = req.path;
    // if (/demo(\/|\\)[^\/\\]+\.js$/.test(filePath) || /(\/|\\)[p|pages](\/|\\)[^\/\\]+(\/|\\)index\.js$/.test(filePath)) {
    //if (/((\/p\/)|(\\p\\))[\s\S]*index\.js$/.test(filePath)) {
    if (/index\.js$/.test(filePath)) {
        var currentBase = process.cwd();
        var entryDir = 'src';
        var outputDir = 'build';

        // var context =  path.join(currentBase, entryDir); // 必须是绝对路径
        // outputDir = path.isAbsolute(outputDir) ? outputDir : path.join(currentBase, outputDir);
        if (!path.isAbsolute(outputDir)) {
            outputDir = path.resolve(currentBase, outputDir);
        }
        var entryObj = {};
        // pageFile: p/h5list/index.js
        // pageName: p/h5list/index 去掉.js的后缀
        // pageFile = path.relative(entryDir, filePath);
        pageFile = filePath;
        var pageName = pageFile.substring(1, pageFile.length - 3);
        // entryObj[pageName] = './' + pageName + '.js';
        entryObj[pageName] = './' + pageName;

        /*console.log('currentBase:', currentBase);
         console.log('pageName:', pageName);
         console.log(entryObj);
         console.log(outputDir);*/
        // 定义全集load 目录; 吧node_modules目录加入到require中;
        // _config.root = [context, path.join(__dirname, '../node_modules')];
        _config.entry = entryObj;
        _config.output.path = outputDir;

        //_config.devtool = '#inline-source-map';
        return _config;
        /*var complier = new Webpack(_config);
         var middleware = new webpackDevMiddleware(complier, {
         //hot: true,
         //historyApiFallback: false,
         stats: {
         // 用颜色标识
         colors: true
         }
         });
         return middleware(req, res, next);*/

        //return new webpackDevMiddleware(new Webpack(_config));

    } else {
        next();
    }
};
