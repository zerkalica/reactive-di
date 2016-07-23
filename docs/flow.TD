graph TB
    User((User))
    class User input

    Action(Action<br/><br/>Function or method)
    class Action action

    Updater(Updater<br/><br/>apply sync data<br/>qeue async data<br/>rollback on error)
    class Updater state

    UpdaterStatus(UpdaterStatus<br/><br/>combine<br/>pending/complete/error<br/>from many updaters)
    class UpdaterStatus state

    Updater--many updaters<br/>change-->UpdaterStatus

    Initializer(Initializer<br/><br/>Initialize model data)
    class Initializer query

    Action--"<br/>new models,<br/>promises,<br/>observables"-->Updater
    Initializer--Invoke updater-->Updater

    User--event-->Action

    Value[Value<br/><br/>Data json<br/> or ready-to-use instance<br/>from entry point]
    class Value model

    Source[Source<br/><br/>Class with data]
    class Source model

    Computed[Computed<br/><br/>Class with sources as deps]
    class Computed computed
    Source--updates-->Computed

    UpdaterStatus--updates-->Computed

    Source--"on first access"-->Initializer
    Updater--modify-->Source
    Value--"new Model(json)<br/>or as is"-->Source

    Component["Component<br/><br/>raw class with jsx<br/>wrapped in runtime to<br/>react/preact/bel/mercury"]
    class Component component

    Styles["Styles<br/><br/>provide class names<br/>mount/unmount css<br/>(jss)"]
    class Styles reactions
    Styles--class names-->Component
    Component--mount/unmount-->Styles

    Computed--trigger-->Component
    Computed--trigger-->Styles
    Component--events-->Action

    classDef state fill:#cae,stroke:#333,stroke-width:1px
    classDef action fill:#ccc,stroke:#333,stroke-width:1px
    classDef computed fill:#ee9,stroke:#660,stroke-width:1px

    classDef reactions fill:#0e0,stroke:#666,stroke-width:2px
    classDef input fill:#e33,stroke:#666,stroke-width:2px
    classDef component fill:#ef0,stroke:#666,stroke-width:2px
    classDef model fill:#bef,stroke:#333,stroke-width:2px

    classDef query fill:#eee,stroke:#999,stroke-width:1px
