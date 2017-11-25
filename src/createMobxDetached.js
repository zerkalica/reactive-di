// @flow
import type {TypedPropertyDescriptor} from './interfaces'
import {rdiInst} from './interfaces'
import Injector from './Injector'

export interface IReaction {
    constructor(name: string, onInvalidate: () => void): IReaction;
    track(cb: () => void): void;
    dispose(): void;
}

export default function createMobxDetached(Reaction: Class<IReaction>) {
    class LomReaction<V> {
        _reaction: Reaction
        _handler: (force: boolean) => V
        _cache: V | void
        _propName: string
        _host: Object
        _reactions: WeakMap<Object, LomReaction<any>>
        _force: boolean = false
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
            this.value(false)
        }

        __track() {
            this._cache = this._host[this._propName](this._force)
        }

        value(force: boolean): V {
            if (this._cache === undefined || force) {
                this._force = force
                this._reaction.track(this._track)
                this._force = false
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
        descr: TypedPropertyDescriptor<(force: boolean) => V>
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
            value(force: boolean): V {
                let reaction: LomReaction<V> | void = reactions.get(this)
                if (!reaction) {
                    const di: Injector | void = this[rdiInst]
                    reaction = new LomReaction(
                        di ? `${di.displayName}.${name}` : name,
                        this,
                        name + '$',
                        reactions
                    )
                    reactions.set(this, reaction)
                }

                return reaction.value(force)
            }
        }
    }
}
