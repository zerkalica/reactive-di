/* @flow */

import getFunctionName from '~/utils/getFunctionName'
import type {
    DepId,
    Info,
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {AsyncSubscription} from 'reactive-di/i/nodeInterfaces'

// implements DepBase
export class DepBaseImpl<V> {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
    id: DepId;
    info: Info;
    subscriptions: Array<AsyncSubscription>;

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
    tags: Array<Tag>;
    displayName: string;

    constructor(
        kind: string,
        name: string,
        tags: Array<Tag>
    ) {
        this.displayName = kind + '@' + name
        this.tags = tags.concat([kind, name])
    }
}

// implements AnnotationBase
export class AnnotationBaseImpl<T: Function> {
    id: DepId;
    info: Info;
    target: T;

    constructor(
        id: DepId,
        kind: string,
        tags: Array<string>,
        target: T
    ) {
        const name: string = getFunctionName(target);
        this.id = id
        this.info = new InfoImpl(kind, name, tags)
        this.target = target
    }
}
