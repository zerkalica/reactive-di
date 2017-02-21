// @flow

import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
    cache: true,
    devtool: 'source-map',
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'build'),
        filename: 'app.js'
    },
    entry: {
        browser: [
            path.resolve(__dirname, 'src', 'browser.js')
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
            title: 'example demo',
            template: path.resolve(__dirname, 'index.ejs')
        })
    ]
}
