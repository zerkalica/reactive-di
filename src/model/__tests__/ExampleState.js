/* @flow */

export function getDepId(obj: Object): string {
    return obj.constructor.$id
}

class Meta {
    notify: () => void;
}

export class A {
    static $id: string = 'a';

    name: ?string;
    $meta: Meta;

    constructor(rec: Object = {}) {
        this.name = rec.name || 'testA'
        this.$meta = rec.$meta || new Meta()
    }

    copy(rec: Object): A {
        return new A({...this, ...rec})
    }
}

export class C {
    static $id: string = 'c';
    name: ?string = 'testC';
    $meta: Meta;

    constructor(rec: Object = {}) {
        this.name = rec.name || null
        this.$meta = rec.$meta || new Meta()
    }

    copy(rec: Object): C {
        return new C({...this, ...rec})
    }
}

export class B {
    c: C;
    $meta: Meta;
    static $id: string = 'b';

    constructor(rec: Object = {}) {
        this.c = rec.c || new C()
        this.$meta = rec.$meta || new Meta()
    }

    copy(rec: Object): B {
        return new B({...this, ...rec})
    }
}

export class S {
    a: A;
    b: B;

    static $id: string = 's';
    $meta: Meta;
    constructor(rec: Object = {}) {
        this.a = rec.a || new A()
        this.b = rec.b || new B()
        this.$meta = rec.$meta || new Meta()
    }

    copy(rec: Object): S {
        return new S({...this, ...rec})
    }
}

export const pathMap: {[id: string]: Array<string>} = {
    s: [],
    a: ['a'],
    b: ['b'],
    c: ['b', 'c']
};
