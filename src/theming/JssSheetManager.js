// @flow

import type {ISheet, ISheetManager} from './interfaces'

interface JSSSRule {
    key: string;
}

interface JSSSheet {
    classes: {+[id: string]: string};
    options: {
        meta: string;
        classNamePrefix: string;
    };
    attach(): void;
    addRule(name?: string, data: Object): JSSSRule;
    getRule(name: string): JSSSRule;
    deleteRule(name: string): void;
}

interface JSS {
    createStyleSheet(cssObj?: Object, options: any): JSSSheet;
    removeStyleSheet(sheet: JSSSheet): void;
}

interface IOwner {
    update(sheet: JssSheet): void;
}

const subRulesId = Symbol('rdi_sub_rules')

export const nameId = Symbol('rdi_theme_name')

const ruleId = Symbol('rdi_rule_id')
const BAD_CLASS_SYMBOLS = new RegExp('[^\\w\\d\\-\\_]', 'g')
const KEYFRAMES = '@keyframes '

function replaceProps<V: {[id: string]: string | Object}>(obj: V, placeholder: string, replaceTo: string): V {
    for (let key in obj) {
        const val = obj[key]
        if (val && key.indexOf('animation') === 0) {
            obj[key] = typeof val === 'object'
                ? replaceProps(val, placeholder, replaceTo)
                : val.replace(placeholder, replaceTo)
        }
    }

    return obj
}

class JssSheet implements ISheet {
    jssSheet: JSSSheet
    key: string
    usageCount = 0
    _scheduled = false

    _owner: IOwner

    constructor(jssSheet: JSSSheet, owner: IOwner, key: string) {
        this.jssSheet = jssSheet
        this._owner = owner
        this.key = key
    }

    _lastAttached: Set<JSSSRule> = new Set()
    _toDelete: Set<JSSSRule> = new Set()

    addRule<V: {
        [typeof ruleId | string]: string | void
    }>(css: V, debugName?: string): string {
        const sheet = this.jssSheet
        let id = css[ruleId]
        let rule: JSSSRule | void = undefined
        if (id === undefined) {
            id = css[ruleId] = (css[nameId] || JSON.stringify(css))
                .replace(BAD_CLASS_SYMBOLS, '')
            rule = sheet.getRule(id)
            if (rule && css._dynamic === true) {
                rule = undefined
            }
        } else {
            rule = sheet.getRule(id)
        }

        if (!rule) {
            const prefix = sheet.options.classNamePrefix
            const placeholder = '@.'
            const newCss = {}
            let subRules: JSSSRule[] | void = undefined
            for (let key in css) {
                const item = css[key]
                if (item === true) continue // _dynamic
                if (key.indexOf(KEYFRAMES) === 0 && typeof item === 'object') {
                    if (subRules === undefined) subRules = []
                    subRules.push(sheet.addRule(key.replace(placeholder, prefix), item))
                } else {
                    newCss[key] = item !== null && typeof item === 'object'
                        ? replaceProps(item, placeholder, prefix)
                        : key.indexOf('animation') === 0 ? (item: any).replace(placeholder, prefix) : item
                }
            }
            rule = sheet.addRule(id, newCss)
            if (subRules) (rule: Object)[subRulesId] = subRules
            if (!this._scheduled) this._owner.update(this)
            this._scheduled = true
        }
        this._lastAttached.add(rule)
        this._toDelete.delete(rule)
        return sheet.classes[id]
    }

    _deleteRule(rule: JSSSRule) {
        const sheet = this.jssSheet
        const subRules: JSSSRule[] = (rule: Object)[subRulesId]
        if (subRules !== undefined) {
            for (let i = 0; i < subRules.length; i++) {
                sheet.deleteRule(subRules[i].key)
            }
        }

        sheet.deleteRule(rule.key)
    }

    attach() {
        this._scheduled = false
        this._toDelete.forEach(this._deleteRule, this)
        this._toDelete = this._lastAttached
        this._lastAttached = new Set()
        this.jssSheet.attach()
    }

    destructor() {
        this.usageCount--
        if (this.usageCount !== 0) return
        this._toDelete = (undefined: any)
        this._lastAttached = (undefined: any)
        this._owner.update(this)
    }
}

export const scheduleNative: (handler: () => void) => mixed = typeof requestAnimationFrame === 'function'
    ? (handler: () => void) => requestAnimationFrame(handler)
    : (handler: () => void) => setTimeout(handler, 16)

export default class JssSheetManager implements ISheetManager {
    _jss: JSS
    _cache: Map<string, JssSheet> = new Map()

    _badClassSymbols = BAD_CLASS_SYMBOLS

    constructor(jss: any) {
        this._jss = jss
    }

    static createGenerateClassName() {
        return function generateClassName(rule: JSSSRule, sheet: JSSSheet): string {
            return `${sheet.options.classNamePrefix}${rule.key ? `-${rule.key}` : ''}`
        }
    }

    createSheet(sheetKey: string): ISheet {
        let sheet = this._cache.get(sheetKey)
        if (sheet === undefined) {
            const meta = sheetKey.replace(this._badClassSymbols, '')
            const options = {
                meta,
                classNamePrefix: meta
            }

            sheet = new JssSheet(this._jss.createStyleSheet(undefined, options), this, sheetKey)
            this._cache.set(sheetKey, sheet)
        }
        sheet.usageCount++

        return sheet
    }

    _scheduled: JssSheet[] = []

    update(sheet: JssSheet) {
        const {_scheduled: scheduled} = this
        if (scheduled.length === 0) {
            scheduleNative(this._sync)
        }
        scheduled.push(sheet)
    }

    _sync = () => {
        const {_scheduled: scheduled, _cache: cache, _jss: jss} = this
        for (let i = 0; i < scheduled.length; i++) {
            const sheet = scheduled[i]
            if (sheet.usageCount === 0) {
                cache.delete(sheet.key)
                jss.removeStyleSheet(sheet.jssSheet)
            } else {
                sheet.attach()
            }
        }
        this._scheduled = []
    }
}
