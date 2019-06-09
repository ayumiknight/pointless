var path = require('path');
var webpack = require('webpack');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

var fs = require('fs')
const theme = require('./package.json').theme;
module.exports = {
	entry: [
		'babel-polyfill',
		/*'react-hot-loader/patch',*/
		// activate HMR for React
		'webpack-hot-middleware/client',
		//'webpack-dev-server/client?http://localhost:3000',
		// bundle the client for webpack-dev-server
		// and connect to the provided endpoint
		'webpack/hot/only-dev-server',
		// bundle the client for hot reloading
		// only- means to only hot reload for successful updates
		// "babel-polyfill",
		'./src/index.js',
		// './src/js/tingyun-react.js',
		// the entry point of our app
	],
	node: {
		fs: "empty"
	},
	output: {
		filename: 'bundle.js',
		// the output bundle
		path: path.resolve(__dirname, 'dist/static'),
		publicPath: '/Bargain/static/'
		// necessary for HMR to know where to load the hot update chunks
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	devtool: 'source-map',
	module: {
		rules: [{
			test: /\.es6?$/,
			use: [
				'babel-loader'
			]
		}, {
			test: /\.jsx?$/,
			use: [
				'babel-loader'
			],
			exclude: /node_modules/
		}, {
			test: /\.css/,
			loaders: [
				'style-loader?sourceMap',
				'css-loader',
				'resolve-url-loader'
			]
		}, {
			test: /\.less$/,
			use: [
				'style-loader',
				'css-loader',
				{
					loader: 'postcss-loader',
					options: {
						sourceMap: true,
						config: {
							path: 'postcss.config.js'
						}
					}
				},
				{
					loader: 'less-loader',
					options: {
						modifyVars: theme
					}
				}
			],
			include: [
				/src/,
				/node_modules/
			],
		}, {
			test: /\.(png|jpg)$/,
			loader: 'file-loader'
		}, {
			test: /\.(svg|ttf|eot|woff|woff2)/,
			loader: 'url-loader'
		}]
	},
	plugins: [
		// new ExtractTextPlugin({
		//     filename: 'app.css',
		//     allChunks: true
		// }),
		new CopyWebpackPlugin([{ from: './src/js', to: path.resolve(__dirname, 'dist/static') }]),
		new CaseSensitivePathsPlugin({ debug: false }),
		new webpack.HotModuleReplacementPlugin(),
		// enable HMR globally
		new webpack.NamedModulesPlugin(),
		// prints more readable module names in the browser console on HMR updates
		new webpack.NoEmitOnErrorsPlugin()
		// do not emit compiled assets that include errors
	],
	devServer: {
		host: 'localhost',
		port: 3000,
		historyApiFallback: true,
		// respond to 404s with index.html
		hot: true,
		// enable HMR on the server
		//
		//
	}
};