var path = require('path');
var Webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
// var HtmlWebpackPlugin = require('html-webpack-plugin');
var userConfig = require('./lib/util/getLocalConfig');

var _ = require('underscore');

var envPath = require('./lib/util/env');

var entryDir = 'src';
var outputDir = 'build';


var alias = { // 别名
	zepto: 'webpack-zepto',
	react: 'react',
	'react-dom': 'react-dom',
	'react-redux': 'react-redux',
	'redux-thunk': 'redux-thunk',
	redux: 'redux',
	underscore: 'underscore',
	'@br': path.join(envPath.cwdPath, "./src/c/")
};
for (aliasName in userConfig.alias) {
	userConfig.alias[aliasName] = userConfig.alias[aliasName].replace(/^\@br\//, alias['@br']); // 替换@br别名
}
alias = _.extend(alias, userConfig.alias);

var noParse = []; // 忽略查找出现在其中的js所引入的依赖

if (userConfig.noParse) {
	noParse = noParse.concat(userConfig.noParse);
}
noParse.forEach(function(np, ind) {
	noParse[ind] = np.replace(/^\@br\//, alias['@br']); // 替换@br别名
});

module.exports = {
	entry: {},
	output: {
		path: path.resolve(envPath.cwdPath, './build'),
		filename: '[name].js'
	},
	resolveLoader: {
		root: path.join(__dirname, "./node_modules")
	},
	externals: { // 使用CDN/远程文件
		/*zepto: 'zepto',
		underscore: 'underscore',
		react: 'react',
		'react-dom': 'react-dom',
		'react-redux': 'react-redux',
		'redux-thunk': 'redux-thunk',
		redux: 'redux'*/
	},
	// webpack server 相关配置
	module: {
		noParse: noParse, // 独立项[path...] (文件路径) 如果你确定一个模块中没有其它新的依赖就可以配置这项，webpack 将不再扫描这个文件中的依赖
		loaders: [
			// { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/},
			{
				test: /\.jsx$/,
				loader: 'babel-loader!jsx-loader?harmony'
			}, {
				test: /\.js$/,
				loaders: ['babel-loader']
					// exclude: path.join(envPath.rootPath, './node_modules')
			}, {
				test: /\.ejs$/,
				loader: "ejs-loader?variable=data",
				exclude: path.join(envPath.rootPath, './node_modules')
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
		root: [path.join(envPath.rootPath, './node_modules'), path.join(envPath.cwdPath, "./node_modules"), path.join(envPath.cwdPath, "./src/c/common")],
		extensions: ['', '.js', '.json', '.html'],
		alias: alias // 别名
	},

	plugins: [
		//提供全局的变量，在模块中使用无需用require引入

		/*new Webpack.ProvidePlugin({ // 注释此段代码，将不自动注入zepto，需要用户在js入口处手动写入 var $ = require('zepto');
			$: "webpack-zepto"
		}),
		
		new Webpack.ProvidePlugin({ // 注释此段代码，将不自动注入zepto，需要用户在js入口处手动写入 var _ = require('underscore');
			_: "underscore"
		}),*/

		// new Webpack.optimize.CommonsChunkPlugin('./src/p/library.min.js'),

		new Webpack.NoErrorsPlugin()
	]
};