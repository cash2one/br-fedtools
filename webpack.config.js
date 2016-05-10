var path = require('path');
var Webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');

var currentBase = __dirname; //process.cwd();
var entryDir = 'src';
var outputDir = 'build';
var context = path.isAbsolute(entryDir) ? entryDir : path.join(process.cwd(), entryDir);
module.exports = {
	// 定义全集load 目录; 吧node_modules目录加入到require中;
	root: [context, currentBase + '/node_modules'],
	entry: {
		'p/index/index': './src/p/index/index.js',
	},
	output: {
		path: path.resolve(currentBase, 'build'),
		filename: '[name].js'
	},
	externals: { // 使用CDN/远程文件
		// zepto: 'zepto',
		// underscore: 'underscore'
	},
	// webpack server 相关配置
	module: {
		loaders: [
			// { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/},
			{
				test: /\.jsx$/,
				loader: 'babel-loader!jsx-loader?harmony'
			}, {
				test: /\.js$/,
				loaders: ['babel-loader'],
				exclude: path.join(currentBase,'./node_modules')
			}, {
				test: /\.ejs$/,
				loader: "ejs-loader?variable=data"
			}, {
				test: /\.less$/,
				loader: "style!css!less-loader"
			}, {
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			}, {
				test: /\.(woff|eot|ttf)$/i,
				loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
			}
		]
	},

	resolve: {
		//require时候自动补全扩展名;
		extensions: ['', '.js', '.json', '.html'],
		alias: { // 别名
			zepto: 'webpack-zepto'
				// 	underscore: 'node_modules/underscore/underscore-min.js'
		}
	},

	plugins: [
		//提供全局的变量，在模块中使用无需用require引入

		new Webpack.ProvidePlugin({ // 如果不自动注入zepto，则需要用户在入口js手动写入 var $ = require('zepto');
            $: "webpack-zepto"
        }),

		new Webpack.NoErrorsPlugin()
	]
};