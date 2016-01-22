/* @flow */

import type {
    FromJS,
    SimpleMap,
    AnnotationDriver,
    ModelAnnotation
} from '../annotations/annotationInterfaces'

type PropCreator<V: Object, N: Object> = (value: V) => N;
type PropCreatorMap = SimpleMap<string, PropCreator>;

/* eslint-disable no-undef */
function createFromJS<T: Object>(Proto: Class<T>, propCreators: PropCreatorMap): FromJS<T> {
/* eslint-enable no-undef */
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
    obj: T,
    path: Array<string> = []
): FromJS<T> {
    const annotation: ModelAnnotation = driver.get(obj.constructor);
    if (!annotation.statePath) {
        const keys: Array<string> = Object.keys(obj);
        const propCreators: PropCreatorMap = {};
        for (let i = 0, j = keys.length; i < j; i++) {
            const key: string = keys[i];
            const prop: any = obj[key];
            if (prop !== null && typeof prop === 'object') {
                annotation.statePath = path
                annotation.childs.push(prop.constructor)
                propCreators[key] = setupStateAnnotations(driver, prop, path.concat(key))
            }
        }
        const fromJS: FromJS<T> = createFromJS(obj.constructor, propCreators);
        annotation.fromJS = fromJS
    }

    return annotation.fromJS
}
