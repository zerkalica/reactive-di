/* @flow */
import type {
    ValueAnnotation,
    ValueProvider as IValueProvider
} from 'reactive-di/i/pluginsInterfaces'
import type {
    Collection,
    Provider
} from 'reactive-di/i/coreInterfaces'

import BaseProvider from 'reactive-di/core/BaseProvider'
import DisposableCollection from 'reactive-di/utils/DisposableCollection'

class ValueProvider<V> extends BaseProvider<V, ValueAnnotation<V>, Provider> {
    kind: 'value';
    annotation: ValueAnnotation<V>;
    value: V;
    _dependants: Collection<Provider>;

    constructor(annotation: ValueAnnotation<V>) {
        super(annotation)
        this.value = annotation.value
        this._dependants = new DisposableCollection()
    }

    set(value: V): boolean {
        this.value = value

        return true
    }

    reset(): void {
        const deps = this._dependants.items
        for (let i = 0, l = deps.length; i < l; i++) {
            deps[i].isCached = false
        }
    }

    addDependant(dependant: Provider) {
        this._dependants.add(dependant)
    }
}

export default {
    kind: 'value',
    create(annotation: ValueAnnotation): IValueProvider<any> {
        return new ValueProvider(annotation)
    }
}
