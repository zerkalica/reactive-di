/* @flow */
export type MergeRec = {
    [prop: string]: any;
};
export type StateModel<T> = {
    [prop: string]: StateModel;
    $meta: {
        notify: () => void;
    },
    copy: (arg: MergeRec) => StateModel & T;
};
