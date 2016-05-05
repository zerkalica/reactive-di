/* @flow */
import createIdCreator from 'reactive-di/utils/createIdCreator'
import createMetadataDriver from 'reactive-di/utils/createMetadataDriver'

function createMap(): Class<Map> {
    const driver = createMetadataDriver('design:__id')
    const createId: () => string = createIdCreator();

    class EmulatedMap<K: Function|Object, V> {
        _map: {[id: string]: V};

        constructor(data?: Array<[K, V]>) {
            this._map = {}
            if (data) {
                for (let i = 0, l = data.length; i < l; i++) {
                    const val = data[i]
                    this.set(val[0], val[1])
                }
            }
        }

        forEach(fn: (value: V, index: K) => mixed): void {
            const {_map: map} = this
            const keys = Object.keys(map)
            for (let i = 0, l = keys.length; i < l; i++) {
                fn(map[keys[i]], (keys[i]: any))
            }
        }

        _getKey(value: K): string {
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

        delete(key: K): void {
            delete this._map[this._getKey(key)]
        }

        has(key: K): boolean {
            return this._map.hasOwnProperty(this._getKey(key))
        }

        get(key: K): V | void {
            return this._map[this._getKey(key)]
        }

        set(key: K, value: V): EmulatedMap<K, V> {
            this._map[this._getKey(key)] = value
            return this
        }
    }

    return (EmulatedMap: any)
}

let SimpleMap: Class<Map>;
if (typeof Map !== 'undefined') {
    SimpleMap = Map
} else {
    SimpleMap = createMap()
}

export default SimpleMap
