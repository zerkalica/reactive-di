Reactive DI
===========

Dependency Injection, имеет небольшой размер, не имеет внешних зависимостей (может использовать Map, если он есть), может конфигурироваться через аннотации или конфиг, работать в браузере от IE9 и на сервере, уметь делать горячую замену зависимостей (hotreload), уметь прозрачно логировать вызовы функций через middleware, оптимально клонировать контейнеры, предоставлять апи для расширения функциональности, максимально использовать flow-типы.

Особое внимание уделялось оптимизации: зависимости рассчитываются отдельно от данных контейнера, что позволяет уменьшить время его создания, parent-child связи между зависимостями рассчитываются по мере запроса. Используется двухуровневое кэширование: кэшируется нормализованная конфигурация и полученные из контейнера данные.

Библиотека писалась с оглядкой на существующие решения ([angular2.di](https://github.com/angular/angular/tree/master/modules/angular2/src/core/di), [scatter](https://github.com/mariocasciaro/scatter)), с учетом особенностей js и работы в браузере (скорость работы, поддежка старых браузеров) и в серверной среде node.js.

Киллерфичей являются расширяемые провайдеры и особенности их api. Провайдеры - сущности, которые знают как настраивать тот или иной компонет и как повлиять на дочерний или родительский компонент в дереве зависимостей.

Это влияние происходит динамически: при первом запросе очередной зависимости, она встраивается в дерево, получает и сама влияет на дочерние и родительские компоненты. Что дает возможность сторонним плагинам управлять кэшем, реагировать на перестроение дерева зависимостей, что может быть использовано для реализации hotreload, observable на основе di и т.д.

Введение
--------

В JavaScript среде данный паттерн не популярен, однако есть уверенность, что в последнее время ситуация изменится. Текущая невостребованность DI, связана с тем, что в целом сложность frontend-задач пока только приближается к сложности бэкенд. И с тем, что экосистема JavaScript проходит стадии взросления, что в свое время проходили Java [Spring MVC](https://spring.io/), C# [Ninject](http://www.ninject.org/), PHP [Symfony2](https://symfony.com/)

Без соотвествующего опыта у JavaScript-программистов складывается [не всегда правильное представление](http://stackoverflow.com/questions/9250851/do-i-need-dependency-injection-in-nodejs-or-how-to-deal-with) того, для чего нужен DI и SOLID в их работе.

Удобство тестирования, возможность подмены одной реализации на другую с таким же интерфейсом, не являются основыми преимуществами в использовании DI. Основная задача DI - предварительная настройка всего и вся, вынесенная в отдельный слой и скрывающая детали этой настройки от основного кода приложения. DI не имеет прямого отношения к ООП - можно преднастраивать функции-фабрики, данные, что угодно.

Существующие решения
--------------------

[angular2 di](https://github.com/angular/angular/tree/master/modules/angular2/src/core/di) не является отдельной библиотекой, монолитна - сложно расширять, апи не позволяет реализовать горячую замену зависимостей (hotreload), нету механизма middleware - логирования вызовов функций и методов, несколько запутанное апи. Все зависимости в angular2 di - синглтоны, создаются при первом запросе и помещаются в кэш, на это никак нельзя повлиять. ReactiveDi попытался оставить многие фичи, которые дает angular.di и дать возможность программисту самому управлять кэшем и реагировать на перестроение дерева зависимостей через систему плагинов.

[scatter](https://github.com/mariocasciaro/scatter), сложное апи, изначальная направленность на серверную работу, строковые ключи.

[yokohama](https://github.com/goodybag/yokohama) - форк заброшенного форка angular2 di, с наследуемыми проблемами по расширению.

Структура
---------

В структуре ReactiveDi можно выделить следующие сущности:

-	Dependency - зависимость: класс, функция, строка, объект
-	Annotation - описывает зависимости: тип зависимости, аргументы, передаваемые в конструктор или функцию.
-	Configuration - способ описания зависимостей в отдельной конфигурации DI.
-	Resolver - вычисляет значение зависимости и управляет ее кэшем
-	Provider - представляет зависимость со всеми ее связями и мета-информацией, обновляет связи при перестоении зависимостей, создает Resolver
-	Plugin - расшияет функциональсть reactive-di. Создает провайдер для соотвествующей аннотации. Например, ClassPlugin в паре с аннотацией klass создает ClassProvider и ClassResolver.
-	Container - по зависимости-ключу получает ее значение или Resolver
-	RelationUpdater - стратегия, куда выносятся общие для всех зависимостей алгоритмы по вычислению их детей и родителей в дереве. В библиотеке есть 2 готовые стратегии: HotRelationUpdater - вычисляет parent/child зависимости, DummyRelationUpdater - ничего не вычисляет, используется для ускорения вычисления, когда не нужен hotreload.
-	ContainerManager - нормализует и кэширует конфигурацию, создает контейнеры с зависимостями, перестраивает дерево зависимостей при изменении одной из них
-	ContainerCreator - регистрирует Plugins, RelationUpdater и создает ContainerManager

Пример 1.
---------

```js
// @flow
import type {
    Tag,
    DependencyKey,
    Annotation,
    Container,
    ContainerManager,
    CreateContainerManager
} from 'reactive-di/i/coreInterfaces'

import {
    createConfigProvider,
    defaultPlugins,
    createDummyRelationUpdater
} from 'reactive-di'

import {alias} from 'reactive-di/configurations'

import {klass} from 'reactive-di/annotations'

// AbstractEngine.js
class AbstractEngine {
    power: number;
}

// ConcreteEngine.js
@klass()
class ConcreteEngine extends AbstractEngine {
    power: number = 33;
}

@klass(AbstractEngine)
class Car {
    engine: AbstractEngine;

    constructor(engine: AbstractEngine) {
        this.engine = engine
    }
}

const createContainerManager: CreateContainerManager
    = createConfigProvider(defaultPlugins, createDummyRelationUpdater);

const cm: ContainerManager = createContainerManager([
    alias(AbstractEngine, ConcreteEngine)
])

const di: Container = cm.createContainer();

assert(di.get(AbstractEngine) instanceof ConcreteEngine)
assert(di.get(Car).engine.power === 33)
```

Сравнение с angular2
--------------------

Что бы лучше понять сравнение с angular2, следует изучить, как он работает.

[angular2 Injector](https://angular.io/docs/js/latest/api/core/Injector-class.html),

[Host and Visibility in Angular 2's Dependency Injection](http://blog.thoughtram.io/angular/2015/08/20/host-and-visibility-in-angular-2-dependency-injection.html)

[http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html](http://blog.thoughtram.io/angular/2015/05/18/dependency-injection-in-angular-2.html)

### Описание зависимостей

angular2:

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

reactive-di:

```js
// @flow
import { defaultPlugins, createDummyRelationUpdater } from 'reactive-di'
import { alias, klass, factory} from 'reactive-di/configurations'

const createContainerManager = createConfigProvider(defaultPlugins, createDummyRelationUpdater);
const cm = createContainerManager([
    klass(Car),
    klass(Engine),
    value(String, 'Hello World'),
    alias(V8, Engine),
    factory(Factory, Car, Engine),
])
const di = cm.createContainer();

di.get(Car)
```

### Дочерние контейнеры

angular2:

```typescript
var injector = Injector.resolveAndCreate([Engine, Car]);
var childInjector = injector.resolveAndCreateChild([Engine]);

injector.get(Engine) !== childInjector.get(Engine);
injector.get(Car) === childInjector.get(Car) // Car from first injector
```

reactive-di:

```js
// @flow
import { defaultPlugins, createDummyRelationUpdater } from 'reactive-di'
import { alias, klass, factory} from 'reactive-di/configurations'

const createContainerManager = createConfigProvider(defaultPlugins, createDummyRelationUpdater);
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

angular2:

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

reactive-di:

```js
// @flow
import { defaultPlugins, createDummyRelationUpdater } from 'reactive-di'
import { klass } from 'reactive-di/configurations'

class Engine {
}

class Car {
  constructor(engine: Engine) {}
}

const createContainerManager = createConfigProvider(defaultPlugins, createDummyRelationUpdater);
const providers = createContainerManager([
    klass(Car),
    klass(Engine)
])

const di = providers.createContainer();
di.get(Car) intanceof Car

```
