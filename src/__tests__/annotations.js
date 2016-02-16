/* @flow */

import createAnnotations from '~/createAnnotations'
import SymbolMetaDriver from '~/drivers/SymbolMetaDriver'
import type {
    Annotations,
    AnnotationDriver
} from 'reactive-di/i/annotationInterfaces'

const driver: AnnotationDriver = new SymbolMetaDriver();

const annotations = createAnnotations(driver);

export default annotations
