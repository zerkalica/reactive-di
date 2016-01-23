/* @flow */

export type Updater<V: Object, E> = {
    pending: () => void;
    success: (value: V) => void;
    error: (error: E) => void;
}

export type Notifier = {
    notify: () => void;
}
