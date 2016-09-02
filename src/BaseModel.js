// @flow

export default class BaseModel<Rec: Object> {
    static defaults: Rec

    constructor(rec?: Rec) {
        Object.assign(this, this.constructor.defaults, rec)
    }

    copy(rec: Rec): any {
        return new this.constructor({...this, ...rec})
    }
}
