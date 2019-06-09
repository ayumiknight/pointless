var path = require('path');
var webpack = require('webpack');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

var theme = require('./package.json').theme;
module.exports = {
	entry: [
		'babel-polyfill',
		'./src/index.js'
	],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist/static'),
		publicPath: '/Bargain/static/'
	},
	resolve: {
		extensions: ['.js','.jsx']
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
		},
		{
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
					loader: 'less-loader', options: {modifyVars: theme}
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
		new CopyWebpackPlugin([{from: './src/js', to: path.resolve(__dirname, 'dist/static')}]),
		new CaseSensitivePathsPlugin({debug: false}),

		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			comments: false
		})
	]
};
