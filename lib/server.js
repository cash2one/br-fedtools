var http = require('http');
var path = require('path');
var fs = require('fs');
var express = require('express');
var Webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
//var CONFIG = require('./webpack.config');
var GetCatalog = require('./getCatalog'); // 获取并展示目录结构 中间件
// var cssFile = require('./lib/cssfile');
var cssFile = require('./cssfile');
var myConfig = require('./getconfig');
var colors = require('colors');

var rootPath = process.cwd();


module.exports = {
    start: function(config) {
        var app = new express();
        var port = config.port;

        app.get('/build/**.css', cssFile);
        app.get('/src/**.css', cssFile);
        app.get('/src/**/*.js', function(req, res, next) {
            var _config = myConfig(req, res, next);
            var complier = new Webpack(_config);
            var middleware = new webpackDevMiddleware(complier, {
                hot: true,
                historyApiFallback: false,
                stats: {
                    colors: true
                }
            });
            middleware(req, res, next);
        });

        app.use('/', GetCatalog);
        app.use(express.static(rootPath));
        var server = app.listen(port, function() {
            console.log(colors.green('请复制地址到浏览器中 http://127.0.0.1:' + port, '进行调试'));
        });
    }
};



//////////


// module.exports = {
//     start: function(config) {
//         var app = new express();
//         var port = config.port;


//         app.use(myConfig);
//         app.use('/', GetCatalog);
//         app.use(express.static(rootPath));

//         var server = app.listen(port, function() {
//             console.log(colors.green('请访问 http://127.0.0.1:' + port, '进行调试'));
//         });
//     }
// };