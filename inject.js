/* eslint-disable */
'use strict';
var driver = require('./dist/core/annotationDriver');

module.exports = function inject(metadata, target) {
    driver.paramtypes.set(target, metadata)
}
