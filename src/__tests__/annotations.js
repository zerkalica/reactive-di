/* @flow */

import createAnnotations from '../createAnnotations'
import SymbolMetaDriver from '../drivers/SymbolMetaDriver'
import type {
    Annotations,
    AnnotationDriver
} from '../interfaces/annotationInterfaces'

const driver: AnnotationDriver = new SymbolMetaDriver();

const annotations = createAnnotations(driver);

export default annotations
