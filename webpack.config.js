var path = require('path');
var Webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');

var currentBase = process.cwd();
var entryDir = 'src';
var outputDir = 'build';
var context = path.isAbsolute(entryDir) ? entryDir : path.join(currentBase, entryDir);
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
	externals: {
		zepto: 'zepto',
		underscore: 'underscore'
	},
	// webpack server 相关配置
	/*devServer: {
	 historyApiFallback: true,
	 hot: true,
	 inline: true,
	 progress: true
	 },*/
	module: {
		loaders: [
			// { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/},
			{test: /\.jsx$/, loader: 'babel-loader!jsx-loader?harmony'},
			{test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/},
			{test: /\.ejs$/, loader: "ejs-loader?variable=data"},
			{test: /\.less$/, loader: "style!css!less"},
			{test: /\.css$/, loader: 'style-loader!css-loader'},
			{test: /\.(woff|eot|ttf)$/i, loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'}
		],
		resolve:{
			root:'node_modules',
			alias:{
				zepto: 'node_modules/zepto/zepto.min.js',
				underscore: 'node_modules/underscore/underscore-min.js'
			}
		}
	},

	resolve: {
		//require时候自动补全扩展名;
		extensions: ['', '.js', '.json', '.html']
	},

	plugins: [
		//提供全局的变量，在模块中使用无需用require引入
		new Webpack.ProvidePlugin({
			Zepto: "zepto",
			$: "zepto"
		}),
		//
		new Webpack.NoErrorsPlugin()
	]
};
