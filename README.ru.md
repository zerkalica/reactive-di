Reactive DI
===========

Реализация паттерна Dependency Injection. Выделение в отдельный слой и переиспользование логики по настройке и связыванию компонентов приложения: классов, функций, данных. Предоставление апи для создания собственных провайдеров и апи для вычисления связей между зависимостями. Предоставления middleware для логирования вызовов любой функции или метода.

Обзор
-----

В JavaScript среде данный паттерн не популярен, однако есть уверенность, что в последнее время ситуация изменится: [angular.io](https://angular.io/docs/ts/latest/guide/dependency-injection.html), [scatter](https://github.com/mariocasciaro/scatter), [electrolyte](https://github.com/jaredhanson/electrolyte), [intravenous](https://github.com/RoyJacobs/intravenous), [yokohama](https://github.com/goodybag/yokohama).

Текущая невостребованность DI, связана с тем, что в целом, сложность fontend-задач пока только приближается к сложности бэкенд. И с тем, что экосистема JavaScript проходит стадии взросления, что в свое время проходили Java [Spring MVC](https://spring.io/), C# [Ninject](http://www.ninject.org/), PHP [Symfony2](https://symfony.com/)

Без соотвествующего опыта у JavaScript-программистов складывается [не всегда правильное представление](http://stackoverflow.com/questions/9250851/do-i-need-dependency-injection-in-nodejs-or-how-to-deal-with) того, для чего нужен DI и SOLID в их работе.

Удобство тестирования, возможность подмены одной реализации на другую, с таким же интерфейсом не являются основыми преимуществами в использовании DI. Основная задача DI - предварительная настройка всего и вся, вынесенная в отдельный слой и скрывающая детали этой настройки от основного кода приложения. DI не имеет прямого отношения к ООП - можно преднастраивать функции-фабрики, данные, что угодно.

Почему не...
------------

[angular2 di](https://github.com/angular/angular/tree/master/modules/angular2/src/core/di) не является отдельной библиотекой, монолитна - сложно расширять, апи не позволяет реализовать горячую замену зависимостей (hotreload), нету механизма middleware - логирования вызовов функций и методов.

[scatter](https://github.com/mariocasciaro/scatter), сложное апи, изначальная направленность на серверную работу, строковые ключи.

[yokohama](https://github.com/goodybag/yokohama) - форк заброшенного форка angular2 di, с наследуемыми проблемами по расширению.

Почему да
---------

Библиотека писалась с оглядкой на существующие решения, с учетом особенностей js и работы в браузере (скорость работы, поддежка старых браузеров). Описывать зависимости можно как через аннотации, так и передавая отдельно в контейнер DI. Можно клонировать контейнер и определять новые зависимости, старые при этом будут переиспользованы без переинициализации (аналог resolveAndCreateChild в angular2).

На любую зависимость можно в отдельном слое добавить middleware - функцию или класс, которая сработает вместе с вызовом оригинальной функции/класса и получит ее аргументы и результат выполнения.

Киллерфичей являются расширяемые провайдеры и особенности их api. Провайдеры - сущности, которые знают как настраивать тот или иной компонет и как повлиять на дочерний или родительский компонент в дереве зависимостей.

Это влияние происходит динамически: при первом запросе очередной зависимости, она встраивается в дерево, получает и сама влияет на дочерние и родительские зависимости. Что дает возможности для реализации hotreload, observable на основе di и т.д.

В структуре ReactiveDi можно выделить следующие сущности:

-	Annotation - описывает зависимости: тип, аргументы, передаваемые в конструктор или функцию-фабрику.
-	Configuration - способ описания зависимостей в отдельной конфигурации DI.
-	Provider - знает как по аннотации создать и настроить зависимость, как закэшировать и очистить кэш этой зависимости, как повлиять на дочерние или родительские зависимости в дереве
-	Provider plugins - фабрики провайдеров для соотвествующих аннотаций, Например, klass - для класса, factory - функция-фабрика, value - значение, alias - ссылка. Например, klass(Car) аналог bind(Car).toClass(Car) из angular2.
-	Context - базовое api ядра по разрешению дочерних зависимостей, которое передается провайдеру при его инициализации
-	RelationUpdater - составная часть ядра, стратегия, куда выносятся общие для всех зависимостей алгоритмы по вычислению их детей и родителей в дереве. В библиотеке есть 2 готовые стратегии: HotRelationUpdater - вычисляет parent/child зависимости, DummyRelationUpdater - ничего не вычисляет, используется для ускорения вычисления зависимостей, когда не нужен hotreload.
-	ReactiveDi - публичное фасадное api для получения зависимости и клонирования контейнера

Provider plugins + relationUpdater strategy + providers configuration = ReactiveDi

Класс + ReactiveDi = настроенный объект

Пример 1. klass, factory, value
-------------------------------

```js
import {
    ReactiveDi,
    defaultPlugins,
    createDummyRelationUpdater
} from 'reactive-di'

import {alias, value} from 'reactive-di/configurations'

import {klass, factory} from 'reactive-di/annotations'

class Tire {
    diameter: number;
    width: number;

    constructor(width: number, diameter: number) {
        this.width = width
        this.diameter = diameter
    }
}

class AbstractEngine {}

@klass()
class ConcreteEngine extends AbstractEngine {
}

@klass(AbstractEngine)
class Car {
    engine: AbstractEngine;
    constructor(engine: AbstractEngine) {
        this.engine = engine
    }
}

@klass({engine: AbstractEngine})
class Bus {
    engine: AbstractEngine;
    constructor({engine}: {engine: AbstractEngine}) {
        this.engine = engine
    }
}

function DefaultWidth() {}

function createTire(defaultWidth: number, diameter: number): Tire {
    return new Tire(defaultWidth, diameter)
}
factory(DefaultWidth)(createTire)

const di = new ReactiveDi(defaultPlugins, createDummyRelationUpdater, [
    value(DefaultWidth, 22),
    alias(AbstractEngine, ConcreteEngine)
])

assert(di.get(Car) instanceof Car)
assert(di.get(Car).engine instanceof ConcreteEngine)

const createTireWithDiameter: (diameter: number) => Tire = di.get(createTire);

const tire: Tire = createTireWithDiameter(15);

assert(tire instanceof Tire)
assert(tire.width === 22)
assert(tire.diameter === 15)

```

[Еще примеры](https://github.com/zerkalica/reactive-di/examples/ex1.js)
