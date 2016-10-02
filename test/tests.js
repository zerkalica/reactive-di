import 'babel-polyfill'
import glob from 'glob'
import jsdom from 'jsdom'

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
const win = doc.defaultView
global.document = doc
global.window = win

const hasOwnProperty = {}.hasOwnProperty

function propagateToGlobal(window: Object) {
    for (let key in window) { // eslint-disable-line
        if (hasOwnProperty.call(window, key) && !(key in global)) {
            global[key] = window[key]
        }
    }
}

propagateToGlobal(win)


glob.sync(__dirname + '/../src/**/__tests__/**/*.js').forEach((file) => require(file)) // eslint-disable-line
