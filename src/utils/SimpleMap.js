/* @flow */
import createIdCreator from 'reactive-di/utils/createIdCreator'
import setProp from 'reactive-di/utils/setProp'

let SimpleMap: Class<Map>;
if (typeof Map !== 'undefined') {
    SimpleMap = Map
} {
    const createId: () => string = createIdCreator();
    class EmulatedMap<K, V> {
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
            if (!key || typeof key === 'string') {
                return (key: any)
            }

            if (!key.__rdi_token) {
                setProp((key: any), '__rdi_token', createId())
            }

            return ((key: any).__rdi_token: string)
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

    SimpleMap = (EmulatedMap: any)
}

export default SimpleMap
