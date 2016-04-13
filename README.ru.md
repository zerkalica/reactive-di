Reactive DI
===========

Реализация паттерна внедрение зависимостей.

-	Поддерживаются иерархические зависимости, как в angular2
-	Умеет делать горячую замену зависимости с очисткой кэша всех зависимых сущностей
-	Умеет прозрачно логировать вызовы функций через middleware
-	Может конфигурироваться через аннотации или конфиг
-	Может быстро работать без Map и Set полифилов в браузерах от IE9
-	Предоставляет апи для работы со связями "зависимый-зависимость"
-	Позволяет создавать собственные провайдеры зависимостей и управлять кэшем
-	Позволяет "дешево" создать контейнер на основе ранее созданной конфигурации

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass} from 'reactive-di/configurations'

class Engine {}
class Brakes {}
class Car {
    engine: Engine;
    constructor(engine: Engine, brakes: Brakes) {
        this.engine = engine
    }
}

const configuration: Array<Annotation> = [
    klass(Engine),
    klass(Brakes),
    klass(Car, Engine, Brakes)
];

const container = createConfigResolver()(configuration).createContainer()
container.get(Car)
```

Особое внимание уделялось оптимизации: зависимости рассчитываются отдельно от данных контейнера, что позволяет уменьшить время его создания, связи зависимый-зависимость рассчитываются по мере запроса. Используется двухуровневое кэширование: отдельно кэшируются связи и полученные из контейнера данные.

Библиотека писалась с оглядкой на существующие решения. Некоторые идеи взяты из [angular2.di](https://github.com/angular/angular/tree/master/modules/angular2/src/core/di), однако большое внимание уделялось проработанности provider-api и упрощению и архитектуры в целом.

Киллерфичей являются расширяемые провайдеры и особенности их api. Провайдеры - сущности, которые знают как настраивать тот или иной компонет и как повлиять на зависимый или зависящий компонент в дереве.

Это влияние происходит динамически: при первом запросе очередной зависимости, она встраивается в дерево, получает и сама влияет на дочерние и родительские компоненты. Что дает возможность сторонним плагинам управлять кэшем, реагировать на перестроение дерева зависимостей, что может быть использовано для реализации hotreload, observable на основе di и т.д.

Удобство тестирования, возможность подмены одной реализации на другую с таким же интерфейсом, не являются основыми преимуществами в использовании DI. Основная задача DI - предварительная настройка зависимостей, вынесенная в отдельный слой - [Composition Root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/) и скрывающая детали этой настройки от основного кода приложения. DI не имеет прямого отношения к ООП - можно преднастраивать функции-фабрики, данные, что угодно.

Структура
---------

В структуре ReactiveDi можно выделить следующие сущности:

-	Dependency - зависимость: класс, функция, строка, объект
-	Annotation - описывает зависимости: тип зависимости, аргументы, передаваемые в конструктор или функцию.
-	Configuration - способ описания зависимостей в отдельной конфигурации DI.
-	Resolver - вычисляет значение зависимости и управляет ее кэшем
-	Provider - представляет зависимость со всеми ее связями и мета-информацией, обновляет связи при перестоении зависимостей, создает Resolver
-	Plugin - расшияет функциональсть reactive-di. Создает провайдер для соотвествующей аннотации. Например, ClassPlugin в паре с аннотацией klass создает ClassProvider и ClassResolver.
-	Container - по зависимости-ключу получает ее значение или Resolver, кэширует результаты вычисления зависимости
-	RelationUpdater - стратегия, куда выносятся общие для всех зависимостей алгоритмы по вычислению их детей и родителей в дереве. В библиотеке есть 2 готовые стратегии: HotRelationUpdater - вычисляет parent/child зависимости, DummyRelationUpdater - ничего не вычисляет, используется для ускорения вычисления, когда не нужен hotreload.
-	ContainerManager - нормализует и кэширует конфигурацию, создает контейнеры с зависимостями, перестраивает дерево зависимостей при изменении одной из них
-	CreateConfigResolver - регистрирует Plugins, RelationUpdater и создает ContainerManager

[core interfaces](./i/coreInterfaces.js)

[plugins interfaces](./i/pluginsInterfaces.js)

![ReactiveDi class diagram](./docs/images/class-diagram.png)

Описание зависимостей
---------------------

Для описания зависимостей есть встроенные конфигурации klass, factory, compose, alias, value..

Для некоторых провайдеров (klass, factory, compose): зависимости можно описывать через запятую и через options-объекты.

```js
// @flow

class Car {
    constructor(engine: Engine, tire: Tire) {}
}

const configuration = [
    klass(Car, Engine, Tire)
]
```

или

```js
// @flow

class Car {
    constructor(options: {engine: Engine, tire: Tire}) {}
}
const configuration = [
    klass(Car, {engine: Engine, tire: Tire})
]
```

Для всех конфигураций есть аналогичные аннотации, которые могут быть прикреплены к классу или функции.

```js
@klass(Engine, Tire)
class Car {
    constructor(engine: Engine, tire: Tire) {}
}
```

Описывать зависимости через конфигурацию предпочтительнее, т.к. тогда кроме интерфейсов компоненты не будут содержать статических связей между собой, все связи можно вынести в отдельный конфигурационный слой, см. статью [Composition Root by Mark Seemann](http://blog.ploeh.dk/2011/07/28/CompositionRoot/)

Создание контейнера
-------------------

В первую очередь создается ConfigResolver. При создании ему опционально передаются:

-	pluginConfig - точка расширения плагинов, по умолчанию используются defaultPlugins.
-	createUpdater - фабрика, создающая стратегию обновления связей "зависимый-зависимость"
-	createContainer - фабрика, создающая контейнер с зависимостями

```js
// @flow
import {
    defaultPlugins,
    createHotRelationUpdater,
    createDefaultContainer,
    createConfigResolver
} from 'reactive-di'
import type {
    CreateContainerManager,
    ContainerManager,
    Container
} from 'reactive-di/i/coreInterfaces'

const createContainerManager: CreateContainerManager = createConfigResolver(
    defaultPlugins,
    createHotRelationUpdater,
    createDefaultContainer
);
```

Из полученной фабрики создается ContainerManager, задача которого нормализовывать конфигурацию, кэшировать и хранить связи между зависимостями и дешево создавать di-контейнеры.

```js
// @flow
const cm: ContainerManager = createContainerManager([
    klass(Car)
]);
```

Последний этап - создание контейнера, получение зависимости верхнего уровня.

```js
// @flow
const container: Container = cm.createContainer();

container.get(Car)
```

Такое разделение позволяет расширять, дешево создавать и реализовывать иерархические контейнеры. Например, по аналогии с angluar2, можно сделать react-компоненты, каждый из которых будет иметь свой контейнер. Внутренние формы, экшены, валидаторы будут в этом контейнеры, а слой работы с rest-api, логгеры источники данных будут в родительском контейнере.

### klass

Описывает класс с зависимостями.

Через конфигурацию:

-	klass(Car, Engine, Brakes) - описывает класс Car с зависимостями Engine и Brakes
-	klass(Car, {engine: Engine, brakes: Brakes}) - options-объект, который придет в конструктор Car

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass} from 'reactive-di/configurations'

class Engine {}
class Brakes {}
class Car {
    engine: Engine;
    constructor(engine: Engine) {
        this.engine = engine
    }
}

const configuration: Array<Annotation> = [
    klass(Engine),
    klass(Brakes),
    klass(Car, Engine, Brakes)
];

const container = createConfigResolver()(configuration).createContainer()
container.get(Car)
```

Через аннотации:

```js
// @flow
import {createConfigResolver} from 'reactive-di'
import {klass} from 'reactive-di/annotations'

@klass({engine: Engine, brakes: Brakes})
class Car {
    engine: Engine;
    brakes: Brakes;

    constructor(options: {engine: Engine, brakes: Brakes}) {
        this.engine = options.engine
        this.brakes = options.brakes
    }
}

@klass()
class Engine {}

@klass()
class Brakes {}

const container = createConfigResolver()().createContainer()
container.get(Car)
```

### factory

Описывает функцию с зависимостями, которая возвращает любое значение.

-	factory(CarFactory, Engine, Brakes) - описывает функцию-фабрику CarFactory с зависимостями Engine и Brakes
-	factory(CarFactory, {engine: Engine, brakes: Brakes}) - аналогично с options-объектом

Через конфигурацию:

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass, factory} from 'reactive-di/configurations'

class Car {}
class Engine {}

function CarFactory(engine: Engine): Car {
    return new Car(engine)
}

const configuration: Array<Annotation> = [
    klass(Engine),
    factory(CarFactory, Engine)
];
const container = createConfigResolver()(configuration).createContainer()
container.get(CarFactory)
```

Через аннотации:

Из-за неработающих в js декораторов на функции, аннотация выглядит как вызов функции factory.

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass, factory} from 'reactive-di/annotations'

class Car {}

@klass()
class Engine {}

function CarFactory(engine: Engine): Car {
    return new Car(engine)
}
factory(CarFactory, Engine)

const container = createConfigResolver()().createContainer()
container.get(CarFactory)
```

### compose

Функция, зависимости которой передаются перед аргументами ее вызова, упрощая ситуации, когда функция-фабрика возвращает функцию в результате.

-	compose(CarFactory, Engine, Brakes) - описывает функцию-фабрику CarFactory с зависимостями Engine и Brakes
-	compose(CarFactory, {engine: Engine, brakes: Brakes}) - аналогично с options-объектом

Через конфигурацию:

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass, compose} from 'reactive-di/configurations'

class Car {}
class Engine {}

function CarFactory(engine: Engine, {power}: {power: number}): Car {
    return new Car(engine, power)
}

const configuration: Array<Annotation> = [
    klass(Engine),
    compose(CarFactory, Engine)
];
const container = createConfigResolver()(configuration).createContainer()
const createCar: ({power}: {power: number}) => Car = container.get(CarFactory);
const car: Car = createCar({33});
```

Через аннотации:

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass, compose} from 'reactive-di/annotations'

class Car {}

@klass()
class Engine {}

function CarFactory(engine: Engine, {power}: {power: number}): Car {
    return new Car(engine, power)
}
compose(Engine)(CarFactory)

const container = createConfigResolver()().createContainer()
const createCar: ({power}: {power: number}) => Car = container.get(CarFactory);
const car: Car = createCar({33});
```

### alias

Ссылка на другую зависимость, используется когда надо переопределить абстрактный класс на реальный.

-	alias(AbstractCar, ConcreteCar)

Через конфигурацию:

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass, alias} from 'reactive-di/configurations'

class AbstractCar {
    color: string;
}

class RedCar {
    color: string = 'red';
}

const configuration: Array<Annotation> = [
    klass(Car),
    alias(AbstractCar, RedCar)
];
const container = createConfigResolver()(configuration).createContainer()
container.get(AbstractCar).color === 'red'
```

Через аннотации не имеет смысла, т.к. это привяжет AbstractCar к RedCar в модуле с AbstractCar.

### value

Присваивает значение зависимости-ссылке, ссылка может быть функцией-пустышкой или классом-пустышкой.

-	value(CarColor, 'red') - присваивает значение 'red' ссылке CarColor

Через конфигурацию:

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass, value} from 'reactive-di/configurations'

function CarColor() {}

class Car {
    color: string = 'red';
}

const configuration: Array<Annotation> = [
    klass(Car, CarColor),
    value(CarColor, 'red')
];
const container = createConfigResolver()(configuration).createContainer()
container.get(Car).color === 'red'
```

Через аннотации:

value, не имеет смысла описывать в аннотации, т.к. это свяжет в том же модуле значение с ключем, по которому значение может быть получено. Однако, можно описать в аннотациях зависимость, использующую value.

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass} from 'reactive-di/annotations'
import {value} from 'reactive-di/configurations'

function CarColor() {}

@klass(CarColor)
class Car {
    color: string;

    constructor(color: string) {
        this.color = color
    }
}

const configuration: Array<Annotation> = [
    value(CarColor, 'red')
];
const container = createConfigResolver()(configuration).createContainer()
container.get(Car).color === 'red'
```

### tag

Каждую зависимость можно пометить тегами. Теги используется для разных нужд, например в middleware, для закрепления обработчиков за зависимостью.

-	tag(klass(Car), 'tag1', 'tag2', ...) - добавляет к klass(Car), теги 'tag1' и 'tag2'

Через конфигурацию:

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {tag, klass} from 'reactive-di/configurations'

class RedCar {
}

const configuration: Array<Annotation> = [
    tag(klass(RedCar), 'machine', 'car')
];
```

Через аннотации:

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {tag, klass} from 'reactive-di/annotations'

@tag('machine', 'car')
// Важно, что б tag был до klass аннотации.
@klass()
class RedCar {
}
```

Middlewares
-----------

Middlewares представляют собой обработчики вызовов функций или методов класса. Обработчики прозрачно прикрепляются либо к функции/классу, либо к тегу, которым могут быть помечены несколько зависимостей.

Для функций, через тег:

```js
function myFn(b: number, c: number): number {
    return b + c
}
function myFnMiddleware(result: number, b: number, c: number): void {
    console.log(result, b, c)
}

const newDi: Container = cm.createContainer([
    tag(compose(myFn, MyValue), 'mytag'),
    compose(myFnMiddleware)
], [
    [myFnMiddleware, ['mytag']]
])

const result = newDi.get(myFn)
result(1, 2)
// console: 3, 1, 2
```

Для классов:

```js
class MyClass {
    test(a: number): number {
        return a + 1
    }

    test2(a: number): number {
        return a
    }
}

class MyClassMiddleware {
    test(result: number, a: number): void {
        console.log(result, a)
    }
}

const newDi: Container = createContainer([
    klass(MyClass),
    klass(MyClassMiddleware)
], [
    [MyClassMiddleware, [MyClass]]
])

const my = newDi.get(MyClass)

assert(my instanceof MyClass) // true
my.test(1) // console: 2, 1
my.test2(1) // no console output
```

Горячая замена зависимостей
---------------------------

Любую зависимость можно заменить в конфигурации, автоматически перестроится кэш всех прямо или косвенно зависимых от нее сущностей.

```js
// @flow
import type {Annotation} from 'reactive-di/i/coreInterfaces'
import {createConfigResolver} from 'reactive-di'
import {klass} from 'reactive-di/annotations'
import {value} from 'reactive-di/configurations'

function CarColor() {}

@klass(CarColor)
class Car {
    color: string;

    constructor(color: string) {
        this.color = color
    }
}

const configuration: Array<Annotation> = [
    value(CarColor, 'red')
];
const cm = createConfigResolver()(configuration)
const container = cm.createContainer()
container.get(Car).color === 'red'

cm.replace(CarColor, value(CarColor, 'blue'))

container.get(Car).color === 'blue'
```

Создание своих конфигураций
---------------------------

Кроме вышеперечисленных провайдеров klass, factory, compose, value, alias можно создавать свои. Для этого надо:

1.	Создать Plugin, который знает как по типу создать сущность провайдера.
2.	В Plugin создать Provider, который будет содержать информацию о связях с другими сущностями. Provider-у доступен контейнер, который инициализировал его создание.
3.	В Provider создать Resolver, который вычисляет и кэширует значение зависимости, может обращаться с контейнеру, если Provider предоставил его Resolver-у.

```js
// @flow
import type {
    DependencyKey,
    Annotation,
    Container,
    Provider,
    Resolver,
    Plugin
} from 'reactive-di/i/coreInterfaces'
import {
    annotationDriver,
    BaseProvider,
    defaultPlugins,
    createConfigResolver
} from 'reactive-di'

import {klass} from 'reactive-di/annotations'

type MyConfiguration = {
    kind: 'myPlugin';
    value: string;
}

function myConfiguration(key: DependencyKey, value: string): MyConfiguration {
    return {
        kind: 'myPlugin',
        key,
        value
    }
}

function myAnnotation(value: string): (target: Function) => void {
    return function _myAnnotation(target: Function): void {
        annotationDriver.annotate(target, myConfiguration(target, value))
    }
}

class MyResolver {
    _provider: MyProvider;
    _value: string;

    constructor(
        value: string,
        provider: MyProvider,
        parents: Array<Parent>,
        getResolver: (dep: DependencyKey) => Resolver
    ) {
        this._value = value
        this._provide = provider
    }

    reset(): void {

    }

    resolve(): any {
        return this._value
    }
}

class MyProvider extends BaseProvider<MyConfiguration> {
    kind: 'myPlugin';
    displayName: string;
    tags: Array<Tag>;

    annotation: MyConfiguration;
    _childs: Array<Provider>;
    _parents: Array<Provider>;

    _container: Container;

    init(container: Container): void {
        this._container = container
    }

    createResolver(): Resolver {
        return new MyResolver(
            this.annotation.value,
            this,
            this._parents,
            (dep: DependencyKey) => this._container.getResolver(dep)
        )
    }
}

const myPlugin: Plugin = {
    kind: 'myPlugin';
    create(annotation: MyConfiguration): Provider<MyConfiguration> {
        return new MyProvider(annotation)
    }
}

const myPlugins: Array<Plugin> = defaultPlugins.concat([myPlugin]);

function myValue() {}

@klass(myValue)
class Car {
    value: string;

    constructor(value: string) {
        this.value = value
    }
}
const confugration: Array<Annotation> = [
    myConfiguration(myValue, 'testValue')
];

const container = createConfigResolver(myPlugins)(configuration).createContainer()
container.get(Car).value === 'testValue'
```

Стратегия расчета зависимостей
------------------------------

Реализует алгоритм рассчета всех, в том числе и дальних в иерархии, childs и parents каждой зависимости по мере ее запроса.

Когда зависимость запрашивается первый раз, ContainerManager по конфигурации сперва найдет соотвествующий плагин, через его create метод получит экземпляр Provider, затем выполнит RelationUpdater.begin, provider.init (здесь провайдер может рекурсивно запростить Container для разрешения своих дочерних зависимостей) и RelationUpdater.begin

```js
const provider: Provider = plugin.create(annotation);
this._updater.begin(provider)
provider.init(container)
this._updater.end(provider)
```

В стратегии HotRelationUpdater метод begin заносит provider в стек parents (метод end - убирает из стека), что бы при разрешении рекурсивных зависимостей, получить их провайдеры в childs

Когда зависимость запрашивается более одного раза и она уже есть в кэше, то вызывается метод RelationUpdater.inheritRelations. Эта оптимизация нужна, что бы в родительскую зависимость, если она рассчитывается первый раз, занести информацию о дочерних зависимостях, которые были посчитаны ранее.

```js
let provider: ?Provider = this._cache.get(annotatedDep);
if (!provider) {
    // create provider
} else {
    this._updater.inheritRelations(provider)
}
```

По-умолчанию используется стратегия, которую создает фабрика createHotRelationUpdater, но можно также определить свою:

```js
// @flow
import type {
    RelationUpdater
} from 'reactive-di/i/coreInterfaces'
import {
    defaultPlugins,
    createDummyRelationUpdater,
    createHotRelationUpdater,
    createConfigResolver
} from 'reactive-di'

function createMyRelationUpdater(): RelationUpdater {
    return {
        begin(provider: Provider) {

        },
        end(provider: Provider) {

        },
        inheritRelations(provider: Provider) {
        }
    }
}

const createContainerManager = createConfigResolver(
    defaultPlugins,
    createMyRelationUpdater
)

```

Сравнение с angular2
--------------------

[angular2 di](https://github.com/angular/angular/tree/master/modules/angular2/src/core/di) не является отдельной библиотекой, и является частью неделимой экосистемы angular2, апи не позволяет реализовать горячую замену зависимостей (hotreload), нету механизма middleware - логирования вызовов функций и методов, сложное [api Injector Class](https://angular.io/docs/ts/latest/api/core/Injector-class.html) (около 3х методов для получения данных). Все зависимости в angular2 di - синглтоны, создаются при первом запросе и помещаются в кэш, на это никак нельзя повлиять.

В [примерах документации angular 2](https://angular.io/docs/ts/latest/guide/dependency-injection.html#!#appendix-working-with-injectors-directly) (InjectorComponent) авторы не грушаются использовать Injector как ServiceLocator, что является плохим подходом, если есть возможность использовать DI, см. [stackoverflow](http://stackoverflow.com/questions/22795459/is-servicelocator-anti-pattern), [habrahabr.ru](https://habrahabr.ru/post/166287/) [статью Mark Seemann](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/).

ReactiveDi попытался оставить многие фичи, которые есть в angular.di и дать возможность программисту самому управлять кэшем и реагировать на перестроение дерева зависимостей через систему плагинов.

Что бы лучше понять сравнение с angular2, следует изучить, как он работает.

[Angular2 Injector](https://angular.io/docs/js/latest/api/core/Injector-class.html),

[Host and Visibility in Angular 2's Dependency Injection](http://blog.thoughtram.io/angular/2015/08/20/host-and-visibility-in-angular-2-dependency-injection.html)

[Dependency Injection in Angular 2](http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html)

### Описание зависимостей

В angular2:

```typescript
import {provide} from 'angular2/core';

const injector = Injector.resolveAndCreate([
    Car,
    provide(Engine, {useClass: Engine}),
    provide(String, {useValue: 'Hello World'}),
    provide(V8, {useExisting: Engine}),
    provide(Factory, {
        useFactory: (car, engine) => IS_V8 ? new V8Engine() : V6Engine(),
        deps: [Car, Engine]
    })
]);

injector.get(Car)
```

В reactive-di:

```js
// @flow
import { alias, klass, factory} from 'reactive-di/configurations'

const createContainerManager = createConfigResolver();
const cm = createContainerManager([
    klass(Car),
    klass(Engine),
    value(String, 'Hello World'),
    alias(V8, Engine),
    {
        kind: 'factory',
        target: (car, engine) => IS_V8 ? new V8Engine() : V6Engine(),
        deps: [Car, Engine]
    }
])
const di = cm.createContainer();

di.get(Car)
```

### Иерархические контейнеры

В angular2 есть [hierarchical dependency injection](https://angular.io/docs/ts/latest/guide/hierarchical-dependency-injection.html):

```typescript
var injector = Injector.resolveAndCreate([Engine, Car]);
var childInjector = injector.resolveAndCreateChild([Engine]);

injector.get(Engine) !== childInjector.get(Engine);
injector.get(Car) === childInjector.get(Car) // Car from first injector
```

В reactive-di:

```js
// @flow
import { alias, klass, factory} from 'reactive-di/configurations'

const createContainerManager = createConfigResolver();
const cm = createContainerManager([
    klass(Car),
    klass(Engine)
])
const childCm = createContainerManager([
    klass(Engine)
])

const di = cm.createContainer();
const childDi = childCm.createContainer(di)

di.get(Engine) !== childDi.get(Engine);
di.get(Car) === childDi.get(Car)
```

### Создание контейнера из ранее подготовленных провайдеров

Используется для быстрого создания контейнера из уже рассчитанных зависимостей

В angular2:

```typescript

@Injectable()
class Engine {
}
@Injectable()
class Car {
  constructor(public engine:Engine) {}
}
var providers = Injector.resolve([Car, Engine]);
var injector = Injector.fromResolvedProviders(providers);
injector.get(Car) instanceof Car
```

В reactive-di:

```js
// @flow
import { klass } from 'reactive-di/configurations'

class Engine {
}

class Car {
  constructor(engine: Engine) {}
}

const createContainerManager = createConfigResolver();
const providers = createContainerManager([
    klass(Car),
    klass(Engine)
])

const di = providers.createContainer();
di.get(Car) intanceof Car

```

### Multi-зависимости

В angular2 есть возможность определять [массивы зависимостей](https://angular.io/docs/ts/latest/api/core/Provider-class.html#!#multi), закрепленные за определенным ключем.

```typescript
var injector = Injector.resolveAndCreate([
  new Provider('Strings', { useValue: 'String1', multi: true}),
  new Provider('Strings', { useValue: 'String2', multi: true})
]);
injector.get('Strings') === ['String1', 'String2']
```

В reactive-di аналогичных способов делать массивы зависимостей нет, т.к. это пример cпорного дизайна. Из-за того, что new Provider('Strings' могут быть разбросаны по коду и нет единой точки регистрации их всех. Лучше явно прописывать их в центральной точке регистрации, как показано в примере ниже (Tire1, Tire2).

```js
// @flow
import { factory, klass } from 'reactive-di/configurations'

function Tires(...tires: Array<Tire>): Array<Tire> {
    return tires
}

class Tire {}
class Car {
  constructor(tires: Array<Tire>) {}
}

class Tire1 {}
class Tire2 {}

const resolveProviders = createResolveProviders();
const providers = resolveProviders([
    klass(Car, Tires),
    klass(Tire1),
    klass(Tire2),
    factory(Tires, Tire1, Tire2)
])

const di = providers.createContainer();
di.get(Car) intanceof Car
```
