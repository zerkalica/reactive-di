// @flow
import {source} from 'reactive-di/annotations'

export type Fixture = (params: Object) => Object

export type Fixtures = {
    [url: string]: Fixture;
}

// Fetcher service, could be injected from outside by key 'Fetcher' as is
@source({instance: true})
export default class Fetcher {
    _count = 0
    _fixtures: Fixtures

    constructor(fixtures: Fixtures) {
        this._fixtures = fixtures
    }

    fetch(url: string, params: {body: Object; method?: string}): Promise<any> {
        const fixtures = this._fixtures
        // fake fetcher for example
        console.log(`fetch ${url} ${JSON.stringify(params)}`) // eslint-disable-line
        return new Promise((resolve: (v: any) => void, reject: (e: Error) => void) => {
            const isError = false
            setTimeout(() => {
                return isError
                    ? reject(new Error('Fake error'))
                    : resolve(fixtures[url](params))
            }, 600)
        })
    }
}
