import 'babel-polyfill'
import glob from 'glob'
import jsdom from 'jsdom'

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
const win = doc.defaultView
global.document = doc
global.window = win

function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue

    global[key] = window[key]
  }
}

propagateToGlobal(win)


glob.sync(__dirname + '/../src/**/__tests__/**/*.js').forEach(file => require(file))
