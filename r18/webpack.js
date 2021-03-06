let path = require('path');
let webpack = require('webpack');
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: {
		bundle: [
			"babel-polyfill",
			"./koa/static/interact/index.jsx",
		],
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	mode: 'development',
	output: {
		// filename: 'bundle[hash].js',
		filename: 'bundleDev.js',
		// the output bundle
		path: path.resolve(__dirname, './koa/static'),
		publicPath: '/static/'
		// necessary for HMR to know where to load the hot update chunks
	},

	devtool: 'cheap-module-eval-source-map',

	module: {
		rules: [
			{
				test: /\.es6?$/,
				use: [
					'babel-loader'
				]
			}, {
				test: /\.(jsx|js)?$/,
				use: [
					'babel-loader'
				]
			}, {
				test: /\.less?$/,
				use: [
					{ loader: 'style-loader', options: { injectType: 'styleTag' }},
					'css-loader',
					'less-loader'
				]
			}
		]
	},
	plugins: [
		//new BundleAnalyzerPlugin()
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				uglifyOptions: {
					sourceMap: true,
					comments: false
				}
			})
		]
	}
};
