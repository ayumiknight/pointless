var path = require('path');
var webpack = require('webpack');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const zktWebpackOss = require('./zkt_webpack_oss');

var theme = require('./package.json').theme;
module.exports = {
	entry: {
		bundle: [
			'babel-polyfill',
			'./src/index.js'
		]
	},
	output: {
		filename: `[name]_[chunkhash].js`,
		path: path.resolve(__dirname, 'dist/static'),
		publicPath: zktWebpackOss.getOssStaticPath('PrepayCard')
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'react-router-dom': 'ReactRouterDOM'
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
			include: [
				/src/,
				/node_modules\/zkt-react-components/
			]
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
					loader: 'less-loader', options: {modifyVars: theme}
				},
			],
			include: [
				/src/,
				/node_modules/
			],
		}, {
			test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
			loader: 'file-loader'
		}/* , {
			test: /\.(svg|ttf|eot|woff|woff2)/,
			loader: 'url-loader'
		} */]
	},
	plugins: [
		new CopyWebpackPlugin([{ from: './src/tingyun-zhida-prepay-card.js', to: path.resolve(__dirname, 'dist/static') }]),
		new CaseSensitivePathsPlugin({ debug: false }),

		new HtmlWebpackPlugin({
			filename: path.resolve(__dirname, './src/index.html'),
			template: path.resolve(__dirname, './src/index.template.html'),
		}),
		//上传操作
		zktWebpackOss.uploadFilesToOss(),

	],
	//压缩js
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					sourceMap: true,
					comments: false
				}
			})
		],
		splitChunks: {
			chunks: 'all'
		}
	}
};
