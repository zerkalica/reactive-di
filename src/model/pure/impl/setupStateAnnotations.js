/* @flow */

import type {AnnotationDriver} from 'reactive-di/i/annotationInterfaces'
import type {
    FromJS,
    SimpleMap
} from 'reactive-di/i/modelInterfaces'
import type {ModelAnnotation} from 'reactive-di/i/plugins/modelInterfaces'

type PropCreator<V: Object, N: Object> = (value: V) => N;
type PropCreatorMap = SimpleMap<string, PropCreator>;

function createFromJS<T: Object>(Proto: Class<T>, propCreators: PropCreatorMap): FromJS<T> {
    return function fromJS<R: Object>(data: R): T {
        const keys = Object.keys(data)
        const props = {}
        for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i]
            const value = data[key]
            const createProp: ?Function = propCreators[key]
            props[key] = createProp ? createProp(value) : value;
        }
        return new Proto(props)
    }
}

export default function setupStateAnnotations<T: Object>(
    driver: AnnotationDriver,
    annotationMap: Map<Function, Annotation>,
    obj: T,
    statePath: Array<string> = []
): FromJS<T> {
    let annotation: ?ModelAnnotation = annotationMap.get(obj.constructor);
    if (!annotation) {
        annotation = driver.getAnnotation(obj.constructor);
        if (!annotation) {
            throw new Error(`Annotation not found for path: ${statePath.join('.')}`)
        }
    }

    if (!annotation.statePath.length) {
        annotation.statePath = statePath
        const keys: Array<string> = Object.keys(obj);
        const propCreators: PropCreatorMap = {};
        for (let i = 0, j = keys.length; i < j; i++) {
            const key: string = keys[i];
            const prop: any = obj[key];
            if (
                prop !== null
                && typeof prop === 'object'
                && (
                    annotationMap.has(prop.constructor)
                    || driver.hasAnnotation(prop.constructor)
                )
            ) {
                annotation.childs.push(prop.constructor)
                propCreators[key] = setupStateAnnotations(
                    driver,
                    annotationMap,
                    prop,
                    statePath.concat(key)
                )
            }
        }
        const fromJS: FromJS<T> = createFromJS(obj.constructor, propCreators);
        annotation.fromJS = fromJS
    }

    return annotation.fromJS
}
