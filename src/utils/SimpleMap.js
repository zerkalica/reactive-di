/* @flow */
import createIdCreator from 'reactive-di/utils/createIdCreator'
import setProp from 'reactive-di/utils/setProp'

const token = '__rdi__token'

function createMap(): Class<Map> {
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
            for (let key in map) { // eslint-disable-line
                fn(map[key], (key: any))
            }
        }

        _getKey(key: K): string {
            if (!key[token]) {
                setProp((key: any), token, createId())
            }

            return ((key: any)[token]: string)
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
