/* @flow */
import type {
    DepId,
    Info
} from '../annotations/annotationInterfaces'
import type {
    Subscription
} from '../observableInterfaces'

// implements DepBase
export class DepBaseImpl<V> {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
    id: DepId;
    info: Info;
    subscriptions: Array<Subscription>;

    constructor(
        id: DepId,
        info: Info,
        value?: V
    ) {
        this.id = id
        this.info = info
        this.isRecalculate = value === undefined
        this.relations = []
        this.subscriptions = []
        if (value !== undefined) {
            this.value = value
        }
    }
}

// implements Info
export class InfoImpl {
    tags: Array<string>;
    displayName: string;

    constructor(
        kind: string,
        name: string,
        tags: Array<string>
    ) {
        this.displayName = kind + '@' + name
        this.tags = tags.concat([kind, name])
    }
}
