/* @flow */
import createIdCreator from 'reactive-di/utils/createIdCreator'

let SafeMap: Class<Map>;
if (typeof Map !== 'undefined') {
    SafeMap = Map
} {
    class EmulatedMap<K, V> {
        _map: {[id: string]: V};
        _keys: {[id: string]: K};
        _createId: () => string;

        constructor(data: Array<[K, V]> = []) {
            this._map = {}
            this._keys = {}
            this._createId = createIdCreator()
            for (let i = 0, l = data.length; i < l; i++) {
                const val = data[i]
                this.set(val[0], val[1])
            }
        }

        forEach(fn: (value: V, index: K) => mixed): void {
            const {_map: map, _keys: keys} = this
            for (let key in map) { // eslint-disable-line
                fn(map[key], keys[key])
            }
        }

        _getKey(key: K): string {
            if (!key || typeof key === 'string') {
                return (key: any)
            }

            if (!key.__rdi_token) {
                (key: any).__rdi_token = this._createId() // eslint-disable-line
            }

            return ((key: any).__rdi_token: string)
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

    SafeMap = (EmulatedMap: any)
}

export default SafeMap
