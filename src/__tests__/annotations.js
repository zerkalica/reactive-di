/* @flow */

import createAnnotations from 'reactive-di/createAnnotations'
import SymbolMetaDriver from 'reactive-di/drivers/SymbolMetaDriver'
import type {
    AnnotationDriver
} from 'reactive-di/i/annotationInterfaces'

const driver: AnnotationDriver = new SymbolMetaDriver();

const annotations = createAnnotations(driver);

export default annotations
