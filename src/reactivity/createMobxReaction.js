// @flow
import type {IHost, IReaction} from './interfaces'

interface IMobxReaction {
    constructor(name: string, onInvalidate: () => void): IMobxReaction;
    track(cb: () => void): void;
    dispose(): void;
}

export default function createMobxReaction(Reaction: Class<IMobxReaction>): Class<IReaction<any>> {
    return class RdiMobxReaction<V> implements IReaction<V> {
        _reaction: Reaction
        _cache: V | void
        _host: IHost<V>
        _track: () => void

        constructor(
            name: string,
            host: IHost<V>
        ) {
            this._cache = undefined
            this._host = host
            this._track = () => this.__track()
            this._reaction = new Reaction(name, () => this._onInvalidate())
        }

        _onInvalidate(): void {
            this._cache = undefined
            this.value()
            this._host.forceUpdate()
        }

        __track() {
            this._cache = this._host.value()
        }

        reset() {
            this._cache = undefined
        }

        value(): V {
            if (this._cache === undefined) {
                this._reaction.track(this._track)
            }

            return (this._cache: any)
        }

        destructor() {
            this._reaction.dispose()
            this._reaction = (undefined: any)
            this._host = (undefined: any)
            this._cache = undefined
            this._track = (undefined: any)
        }
    }
}
