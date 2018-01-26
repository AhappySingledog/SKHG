const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NyanProgressPlugin = require('nyan-progress-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const buildName = 'dist';
const env = process.env.NODE_ENV.trim();

var config = {
    devtool: 'source-map',
    context: path.join(__dirname, './'),
    entry: { vender: ['react', 'react-dom', 'babel-polyfill', 'lodash', 'jQuery']}, // 第三方包合并
    output: { 
        filename: '[name]/index.js', 
        chunkFilename: '[name]/[chunkhash:8].chunk.js', 
        path: path.join(__dirname, buildName),
        publicPath: '/' + buildName + '/',
    },
    node: { fs: 'empty'},
    resolve: { extensions: ['.js', '.jsx', '.less', '.css', '.json']}, // 支持的文件类型
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            }, {
                test: /\.css$/,
                include: /node_modules/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            }, {
                test: /\.(png|jpe?g|gif)$/,
                use: 'url-loader?limit=8192&name=images/[hash].[ext]',
            }, {
                test: /\.(woff2?|eot|ttf|otf|svg)$/,
                use: 'url-loader?limit=10240&name=fonts/[name]-[hash:6].[ext]',
            }, { 
                test: /\.less$/i, 
                use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
            },
        ],
    },
    plugins: [
        new NyanProgressPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vender'],
            filename: '[name].js',
            minChunks: 2,
        }),
        new CopyWebpackPlugin([
            { from: path.join(__dirname, 'website/res'), to: path.join(__dirname, buildName)},
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(env),
            },
            // ================================ 配置开发全局常量 ================================
            __DEV__: env === 'development',
            __PROD__: env === 'production',
            // 是否使用组件形式的 Redux DevTools
            __COMPONENT_DEVTOOLS__: false,
            // 是否检测不必要的组件重渲染
            __WHY_DID_YOU_UPDATE__: false,
        }),
    ],
}

if (env === 'development') {
    config.devServer = {
        historyApiFallback: true,
        hot: true,
        inline: true,
        port: 8092,
        contentBase: path.join(__dirname, buildName),
        publicPath: '',
        stats: {
            colors: true,
        },
    };
} else if (env === 'production') {
    config.plugins.push(new CleanWebpackPlugin([buildName]));
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: { warnings: false },
    }));
}

/*                  打包部分                         */
const files = glob.sync('./website/pages/**/main.jsx');

files.forEach(function (file) {
    let sp = file.split('/');
    let name = sp[sp.length - 2];  
    config.entry[name] = file;
    config.plugins.push(new HtmlWebpackPlugin({
        inject: true,
        title: '武汉天然气大屏系统',
        template: path.resolve(__dirname, path.join('website', 'frame', 'index.html')),
        minify: {collapseWhitespace: false},
        filename: path.resolve(__dirname, path.join('./', buildName, name, 'index.html')),
        chunks: ['vender', name],
    }));
});

module.exports = config;