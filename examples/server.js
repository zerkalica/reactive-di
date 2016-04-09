/* @flow */
/* eslint-end node */

import http from 'http'
import url from 'url'

import {
    createConfigProvider,
    defaultPlugins,
    createDummyRelationUpdater
} from 'reactive-di/index'

import type {
    Context
} from 'reactive-di/i/coreInterfaces'

import {
    klass,
    factory
} from 'reactive-di/configurations'

class Logger {
    log(message: string): void {
        console.log(message)
    }
}

type UrlParts = {
    href: string;
    search: string;
    query: {[id: string]: string};
    pathname: string;
};

class Request {
    method: string;
    url: UrlParts;

    getControllerName(): ?string {
        return this.url.query.q
    }

    setUrl(urlParts: UrlParts): Request {
        this.url = urlParts

        return this
    }

    setMethod(method: string): Request {
        this.method = method

        return this
    }
}

function NotFoundController(): string {
    return 'Page not found: try /?q=AppIndexController'
}

function AppIndexController(logger: Logger): string {
    logger.log('invoked AppIndexController')

    return 'hello from AppIndexController'
}

const controllerMap = {
    NotFoundController,
    AppIndexController
}

const createConfiguration = createConfigProvider(defaultPlugins, createDummyRelationUpdater)

const appConfiguration = createConfiguration([
    factory(NotFoundController),
    klass(Logger)
])

const perRequestConfiguration = createConfiguration([
    klass(Request),
    factory(AppIndexController, Logger)
])

const appDi = appConfiguration.createContainer()

function accept(req: http.IncomingMessage, res: http.ClientRequest): void {
    /* eslint-disable */

    const requestDi: Context = perRequestConfiguration.createContainer(appDi);
    const request: Request = requestDi.get(Request);
    request
        .setUrl((url.parse((req.url: any), true): any))
        .setMethod(req.method)

    const controllerName: ?string = request.getControllerName();
    let controllerDep: ?Function = controllerName ? controllerMap[controllerName] : null;
    if (!controllerDep) {
        controllerDep = controllerMap.NotFoundController
    }
    const response: string = requestDi.get(controllerDep)
    res.end(response)
}

http.createServer(accept).listen(8080)
