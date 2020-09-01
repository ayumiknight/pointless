let path = require('path');
let webpack = require('webpack');
// let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const configs = {
	entry: {
		bundle: [
			"babel-polyfill",
			"./koa/static/interact/root.jsx",
		],
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	mode: 'production',
	output: {
		filename: 'bundle[hash].js',
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
webpack(configs, (err, stat) => {
	console.log(err, stat)
});