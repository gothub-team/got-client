import * as R from 'ramda';
import * as RA from 'ramda-adjunct';

export const useResult = (initialValue) => {
    const reference = { current: initialValue };

    const set = (input) => {
        if (R.is(Function)) {
            reference.current = input(reference.current);
        } else {
            reference.current = input;
        }
    };
    const over = (fn) => {
        reference.current = fn(reference.current);
    };
    return [() => reference.current, set, over];
};

const callProp =
    (prop) =>
    (...args) =>
        R.compose(
            R.when(R.is(Function), (fn) => R.call(fn, ...args)),
            R.propOr(false, prop),
        );

export const useSubscriber = () => {
    const [getSubscribers, setSubscribers] = useResult([]);
    const subscribe = (sub) => {
        const _sub = R.when(R.is(Function), (fn) => ({ next: fn, complete: fn }))(sub);
        setSubscribers(R.append(_sub));
        return { unsubscribe: () => unsubscribe(_sub) };
    };
    const unsubscribe = (sub) => {
        setSubscribers(R.remove(sub));
    };
    const next = (e) => R.forEach(callProp('next')(e))(getSubscribers());
    const complete = (e) => R.forEach(callProp('complete')(e))(getSubscribers());
    const error = (e) => R.forEach(callProp('error')(e))(getSubscribers());

    return { subscribe, unsubscribe, subscriber: { next, complete, error } };
};

export const overPath = R.curry((path, fnOver) => R.over(R.lensPath(path), fnOver));

export const maybeObject = R.unless(RA.isObj, R.always({}));

export const convergeOverPaths = R.curry((path, paths, fnConverge, state) =>
    R.assocPath(path, convergePaths(paths, fnConverge)(state))(state),
);
export const convergePaths = R.curry((paths, fnConverge) => R.converge(fnConverge, R.map(R.path, paths)));

export const mergeRight = R.curry((left, right) => {
    if (left === undefined || right === false) {
        return right;
    }
    if (right === undefined) {
        return left;
    }
    if (right === true) {
        return left || right;
    }

    return R.when(RA.isObj, R.mergeRight(left))(right);
});
export const mergeLeft = R.flip(mergeRight);

export const mergeGraphObjRight = (left, right) => {
    // right does not overwrite
    if (right === undefined) {
        return left;
    }

    // right is false or null and overwrites
    if (!right) {
        return right;
    }

    // right is true, take truthy left or overwrite with true
    if (right === true) {
        return left || right;
    }

    // right is object

    // if left is falsy or true, overwrite
    if (!left || left === true) {
        return right;
    }

    // left is also object, merge
    return { ...left, ...right };
};

export const mergeDeepRight = R.curry((left, right) => R.mergeDeepRight(maybeObject(left), maybeObject(right)));
export const mergeDeepLeft = R.flip(mergeDeepRight);

export const reduceObj = (reduceFns) => (obj) => {
    const [getResult, setResult] = useResult([]);
    forEachCondObj(
        RA.mapIndexed(([fnPick, fnReduce], index) => [
            fnPick,
            (val, newPath) => setResult(overPath([index], fnReduce(val, newPath))),
        ])(reduceFns),
    )(obj);
    return getResult();
};
export const forEachCondObj = (predicateDoFns) => (obj) => {
    const _INNER_RECURSION = (path = []) =>
        R.mapObjIndexed((val, key) => {
            const newPath = [...path, key];
            const condFns = R.pipe(
                R.map(([predicate, fnDo]) => [predicate, () => fnDo(val, newPath)]),
                R.append([RA.isObj, () => _INNER_RECURSION(newPath)]),
            )(predicateDoFns);
            R.cond(condFns)(val, newPath);
        })(R.pathOr({}, path, obj));
    _INNER_RECURSION();
};

export const forEachObjDepth = (obj, fnMap, depth = 1, path = []) => {
    if (!obj || typeof obj !== 'object') {
        return;
    }

    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const val = obj[key];
        if (depth === 1) {
            fnMap(val, [...path, key]);
        } else {
            forEachObjDepth(val, fnMap, depth - 1, [...path, key]);
        }
    }
};

export const toPromise = (observable) =>
    new Promise((resolve, reject) => {
        const [getResults, setResults] = useResult([]);
        observable.subscribe({
            next: (e) => setResults(R.append(e)),
            complete: (e) => resolve(R.append(e, getResults())),
            error: (e) => reject(R.append(e, getResults())),
        });
    });

export const generateNewRandom = (prev) => {
    const rand = Math.random();
    return prev !== rand ? rand : generateNewRandom(prev);
};

export const getPathOr = (or, path) => (input) => {
    try {
        let obj = input;
        for (let i = 0; i < path.length; i += 1) {
            const key = path[i];
            if (key in obj) {
                obj = obj[key];
            } else {
                return or;
            }
        }
        return obj;
    } catch (err) {
        return or;
    }
};

export const getPath = (path, input) => getPathOr(undefined, path)(input);

export const assocPathMutate = (path, val) => (input) => {
    let obj = input;
    for (let i = 0; i < path.length - 1; i += 1) {
        const prop = path[i];
        if (prop in obj) {
            obj = obj[prop];
        } else {
            obj[prop] = {};
            obj = obj[prop];
        }
    }

    const lastProp = path[path.length - 1];
    obj[lastProp] = val;

    return input;
};

export const dissocPathMutate = (path) => (input) => {
    let obj = input;
    for (let i = 0; i < path.length - 1; i += 1) {
        const prop = path[i];
        if (prop in obj) {
            obj = obj[prop];
        } else {
            obj[prop] = {};
            obj = obj[prop];
        }
    }

    const lastProp = path[path.length - 1];
    delete obj[lastProp];

    return input;
};
