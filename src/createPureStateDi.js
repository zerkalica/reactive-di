/* @flow */

import createPureCursorCreator from 'reactive-di/model/pure/createPureCursorCreator'
import AnnotationResolverImpl from 'reactive-di/core/AnnotationResolverImpl'
import AsyncModelPlugin from 'reactive-di/plugins/asyncmodel/AsyncModelPlugin'
import ClassPlugin from 'reactive-di/plugins/class/ClassPlugin'
import FactoryPlugin from 'reactive-di/plugins/factory/FactoryPlugin'
import GetterPlugin from 'reactive-di/plugins/getter/GetterPlugin'
import LoaderPlugin from 'reactive-di/plugins/loader/LoaderPlugin'
import MetaPlugin from 'reactive-di/plugins/meta/MetaPlugin'
import ModelPlugin from 'reactive-di/plugins/model/ModelPlugin'
import ObservablePlugin from 'reactive-di/plugins/observable/ObservablePlugin'
import ResetPlugin from 'reactive-di/plugins/loader/ResetPlugin'
import SetterPlugin from 'reactive-di/plugins/setter/SetterPlugin'
import SymbolMetaDriver from 'reactive-di/drivers/SymbolMetaDriver'
import type {
    AnnotationDriver,
    Dependency,
    Tag
} from 'reactive-di/i/annotationInterfaces'
import type {AnnotationResolver} from 'reactive-di/i/nodeInterfaces'
import type {GetDep} from 'reactive-di/i/diInterfaces'

export default function createPureStateDi<T: Object>(
    state: T,
    plugins?: Map<string, Object>,
    middlewares?: Map<Dependency|Tag, Array<Dependency>>,
    overrides?: Map<Dependency, Dependency>
): GetDep {
    const driver: AnnotationDriver = new SymbolMetaDriver();
    const resolver: AnnotationResolver = new AnnotationResolverImpl(
        driver,
        middlewares || new Map(),
        overrides || new Map(),
        createPureCursorCreator(driver, state),
        {
            class: new ClassPlugin(),
            factory: new FactoryPlugin(),
            setter: new SetterPlugin(),
            getter: new GetterPlugin(),
            model: new ModelPlugin(),
            loader: new LoaderPlugin(),
            reset: new ResetPlugin(),
            asyncmodel: new AsyncModelPlugin(),
            observable: new ObservablePlugin(),
            meta: new MetaPlugin()
        }
    );
    resolver.resolve(state.constructor)

    return function getDep<V>(annotatedDep: Dependency<V>): V {
        return ((resolver.resolve(annotatedDep).resolve(): any): V)
    }
}
