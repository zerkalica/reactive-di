// @flow

import type {ISheet, IAdapter} from '../interfaces'

interface JSSSheet<V> extends ISheet<V> {
    attach(): any;
}

interface JSS {
    createStyleSheet<V>(cssObj: V, options: any): JSSSheet<V>;
    removeStyleSheet<V>(sheet: JSSSheet<V>): void;
}

export default class JssAdapter implements IAdapter<JSSSheet<any>> {
    _jss: JSS

    constructor(jss: any) {
        this._jss = jss
    }

    create<V: Object>(css: V, meta: string): JSSSheet<V> {
        return this._jss.createStyleSheet(css, {meta, classNamePrefix: meta + '_'})
    }

    sync(added: JSSSheet<*>[], removed: JSSSheet<*>[]): void {
        const jss = this._jss
        for (let i = 0; i < added.length; i++) {
            added[i].attach()
        }
        for (let i = 0; i < removed.length; i++) {
            jss.removeStyleSheet(removed[i])
        }
    }
}
