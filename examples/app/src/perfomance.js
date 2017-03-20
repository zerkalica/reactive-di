// @flow
/* eslint-disable */
import {
    SourceStatus,
    DiFactory,
    IndexCollection
} from 'reactive-di/index'
import type {ICallerInfo} from 'reactive-di/index'
import {src, actions, hooks, deps, theme, component, source} from 'reactive-di/annotations'

function testRdi(report, layerCount, done) {
    // const di = (new DiFactory({
    //     componentFactory: new ReactComponentFactory({
    //     })
    // }))
    //     .create()


    const start = {
        prop1: source({key: 'prop1'})(function Prop1() { this.v = 1 }),
        prop2: source({key: 'prop2'})(function Prop2() { this.v = 2 }),
        prop3: source({key: 'prop3'})(function Prop3() { this.v = 3 }),
        prop4: source({key: 'prop4'})(function Prop4() { this.v = 4 })
    }

    let layer = start
    for (let i = layerCount; i--;) {
        layer = (function(m) {
            // const s = {
            //     prop1: deps(m.prop2)(p => p),
            //     prop2: new cellx.Cell(function() { return m.prop1.get() - m.prop3.get(); }),
            //     prop3: new cellx.Cell(function() { return m.prop2.get() + m.prop4.get(); }),
            //     prop4: new cellx.Cell(function() { return m.prop3.get(); })
            // }
            // s.prop1.on('change', function() {});
            // s.prop2.on('change', function() {});
            // s.prop3.on('change', function() {});
            // s.prop4.on('change', function() {});
            // s.prop1.get();
            // s.prop2.get();
            // s.prop3.get();
            // s.prop4.get();
            // return s
        })(layer)
    }
}

testRdi({}, 1, process.exit)
