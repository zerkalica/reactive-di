import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'

import {minify} from 'uglify-es'
import babelrc from 'babelrc-rollup'

import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json'))

const commonConf = {
    entry: 'src/index.js',
    sourceMap: true,
    plugins: [
        resolve(),
        babel(babelrc())
    ],
    targets: [
        {dest: pkg.module, format: 'es'},
    ],
    external: Object.keys(pkg.dependencies || {})
}

const cjsConf = Object.assign({}, commonConf, {
    plugins: commonConf.plugins.concat([
        uglify({}, minify)
    ]),
    targets: [
        {dest: pkg.main, format: 'cjs'},
    ]
})

const umdConf = Object.assign({}, cjsConf, {
    targets: [
        {dest: pkg['umd:main'], format: 'umd', moduleName: pkg.name}
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
