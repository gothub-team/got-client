
export declare type FnGet = () => any;
export declare type FnSet = (value: any) => any;
export declare type FnOver = (fn: FnSet) => any;

/**
 * returns a getter, a setter and an over function for a reference.
 * Setter function can be invoked with either a new value or a function to be applied to the reference.
 * Over function can only be invoked with a function to be applied to the reference.
 * 
 * While the Setter function includes the same functionality as the Over function,
 * calling the Over function repeatedly is more efficient since it doesnt have to check for input type
 */
export declare const useResult: (initialValue: any) => [fnGet: FnGet, fnSet: FnSet, fnOver: FnOver];

export declare type Subscriber<TEvent> = {
    /**
     * Will be called by the observable on progress.
     */
     next: (event: TEvent) => void,
     /**
      * Will be called by the observable when it terminates.
      */
     complete: (event: TEvent) => void,
     /**
      * Will be called by the observable if it encounters a runtime error.
      */
     error: (event: TEvent) => void,
}

/**
 * Collects all Subscribers and handles calling of their handlers when handlers of the returned subscriber are invoked.
 */
export declare const useSubscriber: () => {
    subscribe: (subscriber: Subscriber<any>) => void,
    unsubscribe: (subscriber: Subscriber<any>) => void,
    subscriber: {
        next: (event: any) => void,
        complete: (event: any) => void,
        error: (event: any) => void,
    },
}

/**
 * Curried function that assocs the value under the given prop only when shouldAssoc evaluates to be truthy.
 */
export declare const assocWhen: (shouldAssoc: boolean) => (prop: string) => (value: any) => (object: Object) => Object;

/**
 * Defaults to empty object if input is not of type object
 */
export declare const maybeObject: (input: any) => Object;

// TODO docs, types
export declare const convergeOverPaths: (path: string[]) => (paths: string[][]) => (fnConverge: Function) => (state: any) => any;

// TODO docs, types
export declare const convergePaths: (paths: string[][]) => (fnConverge: Function) => any;

/**
 * Curried function. Merges two objects with props of the right input taking priority over those of the left.
 */
export declare const mergeRight: (left: any, right: any) => any;

/**
 * Curried function. Merges two objects with props of the left input taking priority over those of the right.
 */
export declare const mergeLeft: (left: any, right: any) => any;

/**
 * Curried function. Deep merges two objects with data of the right input taking priority over those of the left.
 */
export declare const mergeDeepRight: (left: any, right: any) => any;

/**
 * Curried function. Deep merges two objects with data of the left input taking priority over those of the right.
 */
export declare const mergeDeepLeft: (left: any, right: any) => any;

/**
 * Creates object for every pickMapFn tuple [fnPick, fnMap]. Picks objects when fnPick evaluates truthy, applies fnMap to all picked objects.
 */
export declare const pickMapObj: (
    pickMapFns: [
        (val: any, path: string[]) => boolean,
        (val: any, path: string[]) => any,
    ]) => (obj: Object) => Object[];

/**
 * Creates object for every reduceFns tuple [fnPick, fnReduce]. Picks objects when fnPick evaluates truthy, applies fnReduce on the accumulator
 * associated with it's reduceFns tuple.
 */
export declare const reduceObj: (
    reduceFns: [
        (val: any, path: string[]) => boolean,
        (val: any, path: string[]) => (accumulator: any) => any,
    ]) => (obj: Object) => Object[];

/**
 * Executes fnDo for every predicateDoFns tuple [fnPredicate, fnDo] where fnPredicate evaluates truthy.
 */
export declare const forEachConfObj: (
    predicateDoFns: [
        (val: any, path: string[]) => boolean,
        (val: any, path: string[]) => void,
    ]) => (obj: Object) => void;

/**
 * Creates a promise that will resolve when a complete event is recieved or rejects when an error event is recieved
 * from the input observable.
 * 
 * @returns an array of recieved events.
 */
export declare const toPromise: (
    observable: { subscribe: (subscriber: Subscriber<any>) => void }
    ) => Promise<any[]>;

/**
 * @returns the property at a given path in the specified object or undefined if the path doesn't exist.
 */
 export declare const getPath: (path: string[], obj: Object) => any | undefined;

/**
 * @returns the property at a given path in the specified object or the given fallback if the path doesn't exist.
 */
export declare const getPath: (or: any, path: string[]) => (obj: Object) => any;

/**
 * Will mutate an object and assoc the given value at the specified path, creating objects along the way if they don't exist yet.
 * 
 * @returns the mutated object
 */
export declare const mutAssocPath: (path: string[], val: any) => (obj: Object) => Object;
