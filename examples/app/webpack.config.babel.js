// @flow

import path from 'path'
import fs from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {
    optimize
} from 'webpack'

const template = path.resolve(__dirname, 'index.ejs')
const isProduction = process.env.NODE_ENV === 'production'

const srcRoot = path.join(__dirname, 'src')
const files: string[] = fs.readdirSync(srcRoot)

const entry = {}
const pages = []

files.forEach((file: string) => {
    const {ext, name} = path.parse(file)
    if (ext !== '.js') {
        return
    }
    entry[name] = [
        path.resolve(srcRoot, file)
    ]

    pages.push(
        new HtmlWebpackPlugin({
            chunks: ['common', name],
            filename: `${name}.html`,
            template
        })
    )
})

export default {
    cache: true,
    devtool: isProduction ? false : 'source-map',
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    entry,
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
    plugins: [].concat(
        [new optimize.CommonsChunkPlugin({
            minChunks: Infinity,
            // children: true,
            name: 'common'
        })],
        pages,
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
