// @flow

import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
    cache: true,
    devtool: 'source-map',
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    entry: {
        browser: [
            path.resolve(__dirname, 'src', 'browser.js')
        ],
        perfomance: [
            path.resolve(__dirname, 'src', 'perfomance.js')
        ]
    },
    module: {
        loaders: [
            {
                test: /\.(?:jsx?|es6)$/,
                include: /(?:src)/,
                exclude: /(?:node_modules|bower_components)/,
                loaders: ['babel-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['browser'],
            title: 'example demo',
            filename: 'index.html',
            template: path.resolve(__dirname, 'index.ejs')
        }),
        new HtmlWebpackPlugin({
            chunks: ['perfomance'],
            title: 'perfomance',
            filename: 'perf.html',
            template: path.resolve(__dirname, 'index.ejs')
        })
    ]
}
