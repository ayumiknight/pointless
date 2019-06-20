var path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


var fs = require('fs');
const theme = require('./package.json').theme;
module.exports = {
    entry: [
        'babel-polyfill',
        /*'react-hot-loader/patch',*/
        // activate HMR for React
        //'webpack-hot-middleware/client',
        //'webpack-dev-server/client?http://localhost:3000',
        // bundle the client for webpack-dev-server
        // and connect to the provided endpoint
        //'webpack/hot/only-dev-server',
        // bundle the client for hot reloading
        // only- means to only hot reload for successful updates
        // "babel-polyfill",
        './src/app.js',
        // './src/js/tingyun-react.js',
        // the entry point of our app
    ],
    mode: 'development',
    resolve: {
        extensions: ['.js', '.jsx']
    },
    output: {
        filename: 'bundle.js',
        // the output bundle
        path: path.resolve(__dirname, 'dist/static'),
        publicPath: '/static/'
        // necessary for HMR to know where to load the hot update chunks
    },

    
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.es6?$/,
            use: [
                'babel-loader'
            ]
        }, {
            test: /\.(js|jsx)$/,
            use: [
                'babel-loader'
            ],
            include: [
                /src/,
                /node_modules\/zkt-react-components/
            ]
        },
        {
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
                'css-loader', {
                    loader: 'less-loader',
                    options: {
                        modifyVars: theme
                    }
                },
            ],
            include: [
                /src/,
                /node_modules/
            ],
        }, {
            test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
            loader: 'file-loader'
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, './index.html'),
            template: path.resolve(__dirname, './index.template.html'),
        })
    ], devServer: {
        publicPath: '/static/',
        contentBase: path.join(__dirname, "dist/static"),
        // compress: true,
        port: 9991,
        disableHostCheck: true
    },


};
