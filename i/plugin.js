/* @flow */

export interface RdiAnnotationResolver {

}

export interface RdiPlugin<Annotation, Dep> {
    create(annotation: Annotation, acc: RdiAnnotationResolver): void;
    finalize<AnyDep>(dep: Dep, target: AnyDep): void;
}

export interface RdiDep {
    kind: string;
    // base: RdiDepBase;
}
