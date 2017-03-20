// @flow
/* eslint-env browser */
/* eslint-disable no-console */

// import {Component, createElement} from 'react'
// import {render} from 'react-dom'

import {render, createVNode as infernoCreateVNode} from 'inferno'
import Component from 'inferno-component'

import {
    createReactRdiAdapter,
    DiFactory,
    BaseSetter
} from 'reactive-di/index'
import type {ICallerInfo, IComponentInfo, ICallbacks, ResultOf} from 'reactive-di/index'

class ModelA {
    title = ''
}

function modelAFromEventSetter(m: ModelA): ICallbacks<ModelA, *> {
    return new BaseSetter(m).create(BaseSetter.createEventSet)
}

function CompB(
    {p}: {
        p: string
    },
    {m}: {
        m: ModelA
    }
) {
    return <div>CompB from {p}: {m.title}</div>
}

function CompRaw(
    {p}: {
        p: string
    },
    _: {}
) {
    return <div>CompRaw from {p}</div>
}


function CompA(
    props: {},
    {m, setFromEvent}: {
        m: ModelA;
        setFromEvent: ResultOf<typeof modelAFromEventSetter>;
    }
) {
    return <div>
        <input value={m.title} onInput={setFromEvent.title}/>
        {m.title}
        <CompB p="A" />
        <CompRaw p={m.title}/>
        <br/>
        See console, rerenders only A and B from L
    </div>
}

function CompL(
    _p: {},
    _s: {}
) {
    return <div>
        <CompA/>
        <CompB p="L" />
    </div>
}

class Logger {
    onError(e: Error, name: string): void {
        /* eslint-disable no-console */
        console.error(e, name)
    }

    onRender<Props: Object>(info: IComponentInfo<Props>) {
        console.log(`render ${info.displayName}#${info.id}` + (info.props.p ? JSON.stringify(info.props.p) : ''))
    }

    onSetValue<V>(info: ICallerInfo<V>): void {
        /* eslint-disable no-console */
        console.log(
            `${info.trace} #${info.opId} set ${info.modelName} `
                + String(info.oldValue) + ' -> ' + String(info.newValue)
        )
    }
}

// used in jsx below, jsx pragma t
const _t = new DiFactory({ // eslint-disable-line
    logger: Logger,
    createVNode: infernoCreateVNode,
    createComponent: createReactRdiAdapter(Component)
})
    .create()

render(
    <CompL/>,
    window.document.getElementById('app')
)
