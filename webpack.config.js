var path = require('path');
var Webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');

var currentBase = __dirname; //process.cwd();
var entryDir = 'src';
var outputDir = 'build';
var context = path.join(process.cwd(), entryDir); // 必须是绝对路径
module.exports = {
	// 定义全集load 目录; 吧node_modules目录加入到require中;
	// root: [context, path.join(currentBase, './node_modules')],
	entry: {
		'p/index/index': './src/p/index/index.js',
	},
	output: {
		path: path.resolve(currentBase, 'build'),
		filename: '[name].js'
	},
	resolveLoader: {
		root: path.join(__dirname, "./node_modules")
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
				loaders: ['babel-loader']
					// exclude: path.join(currentBase, './node_modules')
			}, {
				test: /\.ejs$/,
				loader: "ejs-loader?variable=data",
				exclude: path.join(currentBase, './node_modules')
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
		root: [path.join(currentBase, './node_modules'), path.join(process.cwd(), "./node_modules")],
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

		new Webpack.ProvidePlugin({
			_: "underscore"
		}),

		new Webpack.NoErrorsPlugin()
	]
};