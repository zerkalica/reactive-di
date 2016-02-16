/* @flow */

declare class RdiAnnotationResolver {

}

declare class RdiPlugin<Annotation, Dep> {
    create(annotation: Annotation, acc: RdiAnnotationResolver): void;
    finalize<AnyDep>(dep: Dep, target: AnyDep): void;
}

declare class RdiDep {
    kind: string;
    // base: RdiDepBase;
}
