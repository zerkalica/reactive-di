// @flow
import type {IEntity} from '../interfaces'
import type {ISource} from '../source/interfaces'
import type {IHook} from '../hook/interfaces'
import type {IGetable} from '../utils/resolveArgs'
import type {IDisposable} from '../utils/DisposableCollection'

export interface IComputed<V: Object> extends IEntity, IGetable<V>, IDisposable {
    t: 0;
    sources: ISource<*>[];
    hooks: IHook<*>[];
}
