/* @flow */

import getFunctionName from '../utils/getFunctionName'
import type {
    DepId,
    Info,
    Tag
} from '../annotationInterfaces'
import type {ResolveFn, DependencyResolver} from '../nodeInterfaces'
import type {Subscription} from '../observableInterfaces'

// implements DepBase
export class DepBaseImpl<V> {
    isRecalculate: boolean;
    value: V;
    relations: Array<DepId>;
    id: DepId;
    info: Info;
    subscriptions: Array<Subscription>;
    resolver: ResolveFn;

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
        kind: string,
        tags: Array<string>,
        target: T
    ) {
        const name: string = getFunctionName(target);
        this.info = new InfoImpl(kind, name, tags)
        this.target = target
    }
}
