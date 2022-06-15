import * as R from 'ramda';
import * as RA from 'ramda-adjunct';

export const useResult = initialValue => {
    const reference = { current: initialValue };

    const set = input => {
        if (R.is(Function)) {
            reference.current = input(reference.current);
        } else {
            reference.current = input;
        }
    };
    const over = fn => {
        reference.current = fn(reference.current);
    };
    return [
        () => reference.current,
        set,
        over,
    ];
};

const callProp = prop => (...args) => R.compose(
    R.when(
        R.is(Function),
        fn => R.call(fn, ...args),
    ),
    R.propOr(false, prop),
);

export const useSubscriber = () => {
    const [getSubscribers, setSubscribers] = useResult([]);
    const subscribe = sub => {
        const _sub = R.when(
            R.is(Function),
            fn => ({ next: fn, complete: fn }),
        )(sub);
        setSubscribers(R.append(_sub));
        return { unsubscribe: () => unsubscribe(_sub) };
    };
    const unsubscribe = sub => {
        setSubscribers(R.remove(sub));
    };
    const next = e => R.forEach(
        callProp('next')(e),
    )(getSubscribers());
    const complete = e => R.forEach(
        callProp('complete')(e),
    )(getSubscribers());
    const error = e => R.forEach(
        callProp('error')(e),
    )(getSubscribers());

    return { subscribe, unsubscribe, subscriber: { next, complete, error } };
};

export const assocWhen = R.curry((shouldAssoc, prop, value) => R.when(
    shouldAssoc,
    R.assoc(prop, value),
));

export const overPath = R.curry((path, fnOver) => R.over(
    R.lensPath(path),
    fnOver,
));

export const maybeObject = R.unless(RA.isObj, R.always({}));

export const convergeOverPaths = R.curry((path, paths, fnConverge, state) => R.assocPath(
    path,
    convergePaths(paths, fnConverge)(state),
)(state));
export const convergePaths = R.curry((paths, fnConverge) => R.converge(
    fnConverge,
    R.map(R.path, paths),
));

export const mergeRight = R.curry((left, right) => {
    if (left === undefined || right === false) { return right; }
    if (right === undefined) { return left; }
    if (right === true) { return left || right; }

    return R.when(
        RA.isObj,
        R.mergeRight(left),
    )(right);
});
export const mergeLeft = R.flip(mergeRight);

export const mergeWith = R.curry((fnMerge, left, right) => R.mergeWith(fnMerge, maybeObject(left), maybeObject(right)));

export const mergeDeepRight = R.curry((left, right) => R.mergeDeepRight(maybeObject(left), maybeObject(right)));
export const mergeDeepLeft = R.flip(mergeDeepRight);

export const pickMapObj = pickMapFns => obj => {
    const [getResult, setResult] = useResult([]);
    forEachCondObj(
        RA.mapIndexed(
            ([fnPick, fnMap], index) => [fnPick,
                (val, newPath) => setResult(
                    R.assocPath(
                        [index, ...newPath],
                        fnMap(val, newPath),
                    ),
                )],
        )(pickMapFns),
    )(obj);
    return getResult();
};
export const reduceObj = reduceFns => obj => {
    const [getResult, setResult] = useResult([]);
    forEachCondObj(
        RA.mapIndexed(
            ([fnPick, fnReduce], index) => [fnPick,
                (val, newPath) => setResult(
                    overPath(
                        [index],
                        fnReduce(val, newPath),
                    ),
                )],
        )(reduceFns),
    )(obj);
    return getResult();
};
export const forEachCondObj = predicateDoFns => obj => {
    const _INNER_RECURSION = (path = []) => R.mapObjIndexed((val, key) => {
        const newPath = R.append(key, path);
        const condFns = R.pipe(
            R.map(([predicate, fnDo]) => [predicate,
                () => fnDo(val, newPath)]),
            R.append([RA.isObj,
                () => _INNER_RECURSION(newPath)]),
        )(predicateDoFns);
        R.cond(condFns)(val, newPath);
    })(R.pathOr({}, path, obj));
    _INNER_RECURSION();
};

export const toPromise = observable => new Promise((resolve, reject) => {
    const [getResults, setResults] = useResult([]);
    observable.subscribe({
        next: e => setResults(R.append(e)),
        complete: e => resolve(R.append(e, getResults())),
        error: e => reject(R.append(e, getResults())),
    });
});

export const mutAssocPath = (path, val) => obj => {
    let o = obj;
    for (let i = 0; i < path.length - 1; i += 1) {
        const prop = path[i];
        if (prop in o) {
            o = o[prop];
        } else {
            o[prop] = {};
            o = o[prop];
        }
    }

    const lastProp = path[path.length - 1];
    o[lastProp] = val;

    return obj;
};
