/* @flow */

import createIdCreator from 'reactive-di/utils/createIdCreator'
import createMetadataDriver from 'reactive-di/utils/createMetadataDriver'

function createSet(): Class<Set> {
    const driver = createMetadataDriver('design:__id')
    const createId: () => string = createIdCreator();

    class EmulatedSet<V: Function|Object> {
        _map: {[id: string]: V};

        constructor(data?: Array<V>) {
            this._map = {}
            if (data) {
                for (let i = 0, l = data.length; i < l; i++) {
                    const val = data[i]
                    this.add(val)
                }
            }
        }

        forEach(fn: (value: V) => mixed): void {
            const {_map: map} = this
            const keys = Object.keys(map)
            for (let i = 0, l = keys.length; i < l; i++) {
                fn(map[keys[i]])
            }
        }

        _getKey(value: V): string {
            let key: string = driver.get(value);
            if (!key) {
                key = createId()
                driver.set(value, key)
            }

            return key
        }

        clear(): void {
            this._map = {}
        }

        delete(value: V): void {
            delete this._map[this._getKey(value)]
        }

        add(value: V): void {
            this._map[this._getKey(value)] = value
        }

        has(value: V): boolean {
            return this._map.hasOwnProperty(this._getKey(value))
        }
    }

    return (EmulatedSet: any)
}

let SimpleSet: Class<Set>;
if (typeof Set !== 'undefined') {
    SimpleSet = Set
} else {
    SimpleSet = createSet()
}

export default SimpleSet
