// @flow

import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {
    optimize
} from 'webpack'

const template = path.resolve(__dirname, 'index.ejs')
const isProduction = process.env.NODE_ENV === 'production'

export default {
    cache: true,
    devtool: isProduction ? false : 'source-map',
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    entry: {
        hello: [
            path.resolve(__dirname, 'src', 'hello.js')
        ],
        autocomplete: [
            path.resolve(__dirname, 'src', 'autocomplete.js')
        ],
        todo: [
            path.resolve(__dirname, 'src', 'todo.js')
        ],
        opts: [
            path.resolve(__dirname, 'src', 'opts.js')
        ],
        perfomance: [
            path.resolve(__dirname, 'src', 'perfomance.js')
        ] /**/
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: ['src', 'libs'],
                loaders: ['source-map-loader']
            },
            {
                test: /\.(?:jsx?|es6)$/,
                include: /(?:src)/,
                exclude: /(?:node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            ['transform-metadata', {
                                addDisplayName: true,
                                jsxPragma: '_t'
                            }],
                            ['inferno', {
                                pragma: '_t.h'
                            }]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['hello'],
            filename: 'hello.html',
            template
        }),
        new HtmlWebpackPlugin({
            chunks: ['opts'],
            filename: 'opts.html',
            template
        }),
        new HtmlWebpackPlugin({
            chunks: ['todo'],
            filename: 'todo.html',
            template
        }),
        new HtmlWebpackPlugin({
            chunks: ['perfomance'],
            filename: 'perf.html',
            template
        }),
        new HtmlWebpackPlugin({
            chunks: ['autocomplete'],
            filename: 'autocomplete.html',
            template
        })
    ].concat(
        isProduction
            ? [
                new optimize.OccurrenceOrderPlugin(),
                new optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    }
                })
            ]
            : []
        )
}
