/* @flow */
export default function merge<C: Object, R: Object>(obj: C, rec: R): C {
    const keys: Array<string> = Object.keys(rec);
    let isChanged: boolean = false;
    for (let i = 0, l = keys.length; i < l; i++) {
        const key: string = keys[i];
        if (rec[key] !== obj[key]) {
            isChanged = true
        }
    }

    return isChanged ? new obj.constructor({...obj, ...rec}) : obj
}
