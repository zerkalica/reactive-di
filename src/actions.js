/* @flow */
export class Action {}

export class ErrorAction extends Action {
    error: Error;
    constructor(error: Error) {
        super()
        this.error = error
    }
}

export class ProgressAction extends Action {}
