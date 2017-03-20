// @flow

export type VNodeFlags = number
export type Ref = Function | null
export type InfernoChildren = any // string | number | VNode | Array<string | number | VNode> | null
export type Type = string | Function | null

export interface Events {
    onComponentDidMount?: (domNode: Element) => void;
    onComponentWillMount?: () => void;
    onComponentShouldUpdate?: (lastProps: Object, nextProps: Object) => boolean;
    onComponentWillUpdate?: (lastProps: Object, nextProps: Object) => void;
    onComponentDidUpdate?: (lastProps: Object, nextProps: Object) => void;
    onComponentWillUnmount?: (domNode: Element) => void;
}

export type VNode = any
export type Props = Object

export type CreateVNode = (
    flags: VNodeFlags,
    type?: Type,
    className?: string,
    children?: InfernoChildren,
    props?: Props,
    key?: any,
    ref?: Ref,
    noNormalise?: boolean
) => VNode
