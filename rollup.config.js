import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'

import {minify} from 'uglify-es'

import fs from 'fs'
import path from 'path'

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')))
const babelrc = JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc')))

const magic = 'commonjs'
babelrc.babelrc = false
babelrc.plugins = babelrc.plugins.map(
    plugin => (Array.isArray(plugin) ? (plugin[0] || ''): plugin).indexOf(magic) >= 0 ? null : plugin
).filter(Boolean)

const uglifyOpts = {
    warnings: true,
    compress: {
        reduce_vars: false,
        dead_code: true,
        unused: true,
        toplevel: true,
        warnings: true
    },
    mangle: {
        toplevel: true
    }
}

const commonConf = {
    input: 'src/index.js',
    plugins: [
        resolve(),
        babel(babelrc)
    ].concat(process.env.UGLIFY === '1' ? [uglify(uglifyOpts, minify)] : []),
    output: [
        {sourcemap: true, file: pkg.module, format: 'es'},
    ],
    external: Object.keys(pkg.dependencies || {})
}

const cjsConf = Object.assign({}, commonConf, {
    output: [
        {file: pkg.main, format: 'cjs'},
    ]
})

const umdConf = Object.assign({}, cjsConf, {
    output: [
        {
            file: pkg['umd:main'],
            format: 'umd',
            name: pkg.name,
            globals: {
                lom_atom: 'lom_atom'
            }
        }
    ],
})

export default [
    commonConf,
    cjsConf,
    umdConf
]
