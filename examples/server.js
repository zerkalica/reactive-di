/* @flow */
/* eslint-end node */

import http from 'http'
import url from 'url'

import {
    createManagerFactory,
    defaultPlugins,
    createDummyRelationUpdater
} from 'reactive-di/index'

import type {
    Container,
    ContainerManager,
    CreateContainerManager
} from 'reactive-di'

import {
    klass,
    factory
} from 'reactive-di/configurations'

class Logger {
    log(message: string): void {
        console.log(message) // eslint-disable-line
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

const createContainerManager: CreateContainerManager = createManagerFactory(
    defaultPlugins,
    createDummyRelationUpdater
);

const appManager: ContainerManager = createContainerManager([
    factory(NotFoundController),
    klass(Logger)
]);

const requestManager: ContainerManager = createContainerManager([
    klass(Request),
    factory(AppIndexController, Logger)
]);

const appDi: Container = appManager.createContainer();

function accept(req: http.IncomingMessage, res: http.ClientRequest): void {
    const requestDi: Container = requestManager.createContainer(appDi);
    const request: Request = requestDi.get(Request);
    request
        .setUrl((url.parse((req.url: any), true): any))
        .setMethod(req.method)

    const controllerName: ?string = request.getControllerName();
    let controllerDep: ?Function = controllerName ? controllerMap[controllerName] : null;
    if (!controllerDep) {
        controllerDep = controllerMap.NotFoundController
    }

    try {
        const response: string = requestDi.get(controllerDep);
        requestDi.dispose()
        res.end(response)
    } catch (e) {
        requestDi.dispose()
        res.end(e.toString())
    }
}

http.createServer(accept).listen(8080)
