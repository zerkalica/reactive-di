import 'babel-polyfill'
import glob from 'glob'

glob.sync(__dirname + '/../src/**/__tests__/*.js').forEach(file => require(file))
