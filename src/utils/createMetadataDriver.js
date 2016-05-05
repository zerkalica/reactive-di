/* @flow */

import type {
    Target,
    Metadata,
    MetadataDriver
} from 'reactive-di/i/coreInterfaces'

const isNativeReflect: boolean =
    typeof Reflect !== 'undefined'
    && typeof Reflect.defineMetadata === 'function'
    && typeof (Reflect: any).getOwnMetadata === 'function';

const isSymbolSupported: boolean =
    typeof Symbol !== 'undefined'
    && typeof Symbol.for === 'function';

function createKey(key: string): Symbol|string {
    if (isSymbolSupported) {
        return Symbol.for(key)
    }

    return `__${key}__`
}

function setProp(target: Target, name: string, value: any): void {
    Object.defineProperty(target, name, {
        value,
        writable: false,
        configurable: false,
        enumerable: false
    })
}

class ReflectMetaDataDriver<K: Symbol|string> {
    _metadataKey: K;

    constructor(metadataKey: K) {
        this._metadataKey = metadataKey
    }

    set(target: Target, metadataValue: Metadata): void {
        (Reflect: any).defineMetadata(this._metadataKey, metadataValue, target)
    }

    get(target: Target): Metadata {
        return (Reflect: any).getMetadata(this._metadataKey, target)
    }

    has(target: Target): boolean {
        return (Reflect: any).hasMetadata(this._metadataKey, target)
    }
}

const hasOwnProperty = Object.prototype.hasOwnProperty

class EmulatedMetaDataDriver<K: Symbol|string> {
    _metadataKey: K;

    constructor(metadataKey: K) {
        this._metadataKey = metadataKey
    }

    set(target: Target, metadataValue: Metadata): void {
        setProp(target, (this._metadataKey: any), metadataValue)
    }

    get(target: Target): Metadata {
        return target[this._metadataKey]
    }

    has(target: Target): boolean {
        return hasOwnProperty.call(target, this._metadataKey)
    }
}

export default function createMetadataDriver(key: string = 'design:paramtypes'): MetadataDriver {
    if (isNativeReflect) {
        return new ReflectMetaDataDriver(createKey(key))
    }

    return new EmulatedMetaDataDriver(createKey(key))
}
