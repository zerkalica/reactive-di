import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'

import {minify} from 'uglify-es'
import babelrc from 'babelrc-rollup'

import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json'))
const uglifyOpts = {
    warnings: true,
    compress: {
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
    sourcemap: true,
    plugins: [
        resolve(),
        babel(babelrc())
    ].concat(process.env.UGLIFY === '1' ? [uglify(uglifyOpts, minify)] : []),
    output: [
        {file: pkg.module, format: 'es'},
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
        {file: pkg['umd:main'], format: 'umd', name: pkg.name}
    ],
    globals: {
        lom_atom: 'lom_atom'
    }
})

export default [
    commonConf,
    cjsConf,
    umdConf
]
