// @flow

const isReflect: boolean = typeof Reflect !== 'undefined' && typeof (Reflect: any).defineMetadata === 'function'

const CustomReflect = {
    defineMetadata(key: string, params: any, target: Function): void {
        target[Symbol.for(key)] = params // eslint-disable-line
    },
    getMetadata(key: string, target: Function): any {
        return target[Symbol.for(key)]
    }
}

export default isReflect ? (Reflect: any) : CustomReflect
