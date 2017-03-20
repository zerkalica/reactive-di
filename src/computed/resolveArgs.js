// @flow

export type ICacheable<V: Object> = {
    cached: ?V;
}

export type IGetable<V: Object> = {
    cached: ?V;
    get(): V;
}

type ValuesRec = {
    k: string;
    v: IGetable<*>;
    asSrc: boolean;
}

type IArgGetable = {
    t: 0;
    v: IGetable<*>;
    asSrc: boolean;
}

type IArgRec = {
    t: 1;
    v: ValuesRec[];
}

export type IArg = IArgGetable | IArgRec

export default function resolveArgs(args: IArg[], result: mixed[]): boolean {
    let isChanged: boolean = !args.length

    for (let i = 0, l = args.length; i < l; i++) {
        const arg = args[i]
        if (arg.t === 0) {
            const value = arg.asSrc ? arg.v : (arg.v.cached || arg.v.get())
            if (result[i] !== value) {
                isChanged = true
                result[i] = value // eslint-disable-line
            }
        } else {
            const values = arg.v
            const obj: {[id: string]: any} = (result[i]: any) || {}
            result[i] = obj // eslint-disable-line
            for (let j = 0, k = values.length; j < k; j++) {
                const rec = values[j]
                const value = rec.asSrc ? rec.v : (rec.v.cached || rec.v.get())
                if (obj[rec.k] !== value) {
                    isChanged = true
                    obj[rec.k] = value
                }
            }
        }
    }

    return isChanged
}
