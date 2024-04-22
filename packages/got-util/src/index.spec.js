import { getPathOr, assocPathMutate, mergeRight, getPath, mergeGraphObjRight } from './index.js';

const testWith = (mergeFn) => {
    test('should merge two objects correctly', () => {
        const obj1 = {
            value1: 1,
            value2: true,
            value3: 'babel',
            value4: 'someValue',
            value5: 'someValue',
            value6: 'someValue',
        };
        const obj2 = {
            value1: 2,
            value2: false,
            value3: 'sabel',
            value4: null,
            value5: undefined,
            value7: 'someValue',
        };

        const result = mergeFn(obj1, obj2);
        const expected = {
            value1: 2,
            value2: false,
            value3: 'sabel',
            value4: null,
            value5: undefined,
            value6: 'someValue',
            value7: 'someValue',
        };

        expect(result).toEqual(expected);
    });
    test('should not overwrite with undefined', () => {
        const obj1 = {
            value1: 1,
            value2: true,
            value3: 'babel',
            value4: 'someValue',
            value5: 'someValue',
            value6: 'someValue',
        };
        const obj2 = undefined;

        const result = mergeFn(obj1, obj2);

        expect(result).toEqual(obj1);
    });
    test('should overwrite with null', () => {
        const obj1 = {
            value1: 1,
            value2: true,
            value3: 'babel',
            value4: 'someValue',
            value5: 'someValue',
            value6: 'someValue',
        };
        const obj2 = null;

        const result = mergeFn(obj1, obj2);

        expect(result).toEqual(null);
    });
    test('should overwrite null', () => {
        const obj1 = null;
        const obj2 = {
            value1: 1,
            value2: true,
            value3: 'babel',
            value4: 'someValue',
            value5: 'someValue',
            value6: 'someValue',
        };

        const result = mergeFn(obj1, obj2);

        expect(result).toEqual(obj2);
    });
};

describe('mergeRight', () => {
    testWith(mergeRight);
});

describe('mergeGraphObjRight', () => {
    testWith(mergeGraphObjRight);
});

describe('getPath', () => {
    test('should get prop at path with path length = 1', () => {
        const obj = {
            prop: 'value',
        };

        const result = getPath(['prop'], obj);
        const expected = 'value';

        expect(result).toEqual(expected);
    });
    test('should return instance at path with path length = 1 ', () => {
        const instance = { prop: 'value' };
        const obj = {
            prop: instance,
        };

        const result = getPath(['prop'], obj);

        expect(result === instance).toBeTruthy();
    });
    test('should return undefined if path does not exist with path length = 1 ', () => {
        const obj = {
            prop: 'value',
        };

        const result = getPath(['otherProp'], obj);
        const expected = undefined;

        expect(result).toEqual(expected);
    });
    test('should get prop at path with path length = 3', () => {
        const obj = {
            some: {
                test: {
                    path: 'value',
                },
            },
        };

        const result = getPath(['some', 'test', 'path'], obj);
        const expected = 'value';

        expect(result).toEqual(expected);
    });
    test('should return instance at path with path length = 3 ', () => {
        const instance = { prop: 'value' };
        const obj = {
            some: {
                test: {
                    path: instance,
                },
            },
        };

        const result = getPath(['some', 'test', 'path'], obj);

        expect(result === instance).toBeTruthy();
    });
    test('should return undefined if path does not exist with path length = 3 ', () => {
        const obj = {
            some: {
                test: {
                    path: 'value',
                },
            },
        };

        const result1 = getPath(['invalid', 'test', 'path'], obj);
        const result2 = getPath(['some', 'invalid', 'path'], obj);
        const result3 = getPath(['some', 'test', 'invalid'], obj);
        const expected = undefined;

        expect(result1).toEqual(expected);
        expect(result2).toEqual(expected);
        expect(result3).toEqual(expected);
    });
});

describe('getPathOr', () => {
    test('should get prop at path with path length = 1', () => {
        const obj = {
            prop: 'value',
        };

        const result = getPathOr('fallback', ['prop'])(obj);
        const expected = 'value';

        expect(result).toEqual(expected);
    });
    test('should return instance at path with path length = 1 ', () => {
        const instance = { prop: 'value' };
        const obj = {
            prop: instance,
        };

        const result = getPathOr('fallback', ['prop'])(obj);

        expect(result === instance).toBeTruthy();
    });
    test('should return fallback if path does not exist with path length = 1 ', () => {
        const obj = {
            prop: 'value',
        };

        const result = getPathOr('fallback', ['otherProp'])(obj);
        const expected = 'fallback';

        expect(result).toEqual(expected);
    });
    test('should return fallback if input is undefined with path length = 1 ', () => {
        const obj = undefined;

        const result = getPathOr('fallback', ['prop'])(obj);
        const expected = 'fallback';

        expect(result).toEqual(expected);
    });
    test('should return fallback if input is not object with path length = 1 ', () => {
        const obj = 'someString';

        const result = getPathOr('fallback', ['prop'])(obj);
        const expected = 'fallback';

        expect(result).toEqual(expected);
    });
    test('should return fallback if object along path is undefined with path length = 3 ', () => {
        const obj = {
            some: {
                test: undefined,
            },
        };

        const result = getPathOr('fallback', ['some', 'test', 'path'])(obj);
        const expected = 'fallback';

        expect(result).toEqual(expected);
    });
    test('should get prop at path with path length = 3', () => {
        const obj = {
            some: {
                test: {
                    path: 'value',
                },
            },
        };

        const result = getPathOr('fallback', ['some', 'test', 'path'])(obj);
        const expected = 'value';

        expect(result).toEqual(expected);
    });
    test('should return instance at path with path length = 3 ', () => {
        const instance = { prop: 'value' };
        const obj = {
            some: {
                test: {
                    path: instance,
                },
            },
        };

        const result = getPathOr('fallback', ['some', 'test', 'path'])(obj);

        expect(result === instance).toBeTruthy();
    });
    test('should return undefined if path does not exist with path length = 3 ', () => {
        const obj = {
            some: {
                test: {
                    path: 'value',
                },
            },
        };

        const result1 = getPathOr('fallback', ['invalid', 'test', 'path'])(obj);
        const result2 = getPathOr('fallback', ['some', 'invalid', 'path'])(obj);
        const result3 = getPathOr('fallback', ['some', 'test', 'invalid'])(obj);
        const expected = 'fallback';

        expect(result1).toEqual(expected);
        expect(result2).toEqual(expected);
        expect(result3).toEqual(expected);
    });
});

describe('assocPathMutate', () => {
    test('should assoc at path with path length = 1', () => {
        const obj = {};

        const result = assocPathMutate(['prop'], 'value')(obj);
        const expected = {
            prop: 'value',
        };

        expect(result).toEqual(expected);
    });
    test('should not modify other properties with path length = 1', () => {
        const obj = { ogProp: 'ogValue' };

        const result = assocPathMutate(['prop'], 'value')(obj);
        const expected = {
            prop: 'value',
            ogProp: 'ogValue',
        };

        expect(result).toEqual(expected);
    });
    test('should return same object instance with path length = 1', () => {
        const obj = { ogProp: 'ogValue' };

        const result = assocPathMutate(['prop'], 'value')(obj);

        expect(obj === result).toBeTruthy();
    });
    test('should assoc at path with path length = 3', () => {
        const obj = {};

        const result = assocPathMutate(['some', 'test', 'path'], 'value')(obj);
        const expected = {
            some: {
                test: {
                    path: 'value',
                },
            },
        };

        expect(result).toEqual(expected);
    });
    test('should not modify other properties with path length = 3', () => {
        const obj = {
            ogProp1: 'ogValue1',
            some: {
                ogProp2: 'ogValue2',
                test: {
                    ogProp3: 'ogValue3',
                },
            },
        };

        const result = assocPathMutate(['some', 'test', 'path'], 'value')(obj);
        const expected = {
            ogProp1: 'ogValue1',
            some: {
                ogProp2: 'ogValue2',
                test: {
                    ogProp3: 'ogValue3',
                    path: 'value',
                },
            },
        };

        expect(result).toEqual(expected);
    });
    test('should return same object instance with path length = 3', () => {
        const obj = { ogProp: 'ogValue' };

        const result = assocPathMutate(['some', 'test', 'path'], 'value')(obj);

        expect(obj === result).toBeTruthy();
    });
});
