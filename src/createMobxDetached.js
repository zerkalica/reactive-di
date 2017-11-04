// @flow
import type {DetachedDecoratorDescriptor, IAtomForce} from './interfaces'
import {diKey} from './interfaces'
import Injector from './Injector'

export interface IReaction {
    constructor(name: string, onInvalidate: () => void): IReaction;
    track(cb: () => void): void;
    dispose(): void;
}

export default function createMobxDetached(Reaction: Class<IReaction>) {
    class LomReaction<V> {
        _reaction: Reaction
        _handler: (next?: V | Error, force?: IAtomForce) => V
        _cache: V | void
        _propName: string
        _host: Object
        _reactions: WeakMap<Object, LomReaction<any>>
        _next: V | Error | void = undefined
        _force: IAtomForce | void = undefined
        _track: () => void

        constructor(
            name: string,
            host: Object,
            propName: string,
            reactions: WeakMap<Object, LomReaction<any>>
        ) {
            this._cache = undefined
            this._host = host
            this._propName = propName
            this._reactions = reactions
            const onInvalidate = () => this._onInvalidate()
            this._track = () => this.__track()
            this._reaction = new Reaction(name, onInvalidate)
        }

        _onInvalidate(): void {
            this._cache = undefined
            this.value()
        }

        __track() {
            this._cache = this._host[this._propName](this._next, this._force)
        }

        value(next?: V | Error, force?: IAtomForce): V {
            if (this._cache === undefined || force) {
                this._next = next
                this._force = force
                this._reaction.track(this._track)
                this._next = undefined
                this._force = undefined
            }

            return (this._cache: any)
        }

        destructor() {
            this._reaction.dispose()
            this._reactions.delete(this)
            this._reaction = (undefined: any)
            this._host = (undefined: any)
            this._cache = undefined
            this._track = (undefined: any)
        }
    }

    return function mobxDetached<V>(
        proto: Object,
        name: string,
        descr: DetachedDecoratorDescriptor<V>
    ) {
        const value = descr.value
        const reactions: WeakMap<Object, LomReaction<any>> = new WeakMap()

        Object.defineProperty(proto, `${name}()`, {
            get() {
                return reactions.get(this)
            }
        })
        proto[name + '$'] = value

        return {
            enumerable: descr.enumerable,
            configurable: descr.configurable,
            value(next?: V | Error, force?: IAtomForce): V {
                let reaction: LomReaction<V> | void = reactions.get(this)
                if (!reaction) {
                    const di: Injector | void = this[diKey]
                    reaction = new LomReaction(
                        di ? `${di.displayName}.${name}` : name,
                        this, name + '$',
                        reactions
                    )
                    reactions.set(this, reaction)
                }

                return reaction.value(next, force)
            }
        }
    }
}
