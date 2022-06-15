import { mutAssocPath, mergeRight } from './index.js';

describe('mergeRight', () => {
    test('should merge two objects correctly', () => {
        const obj1 = {
            value1: 1, value2: true, value3: 'babel', value4: 'someValue', value5: 'someValue', value6: 'someValue',
        };
        const obj2 = {
            value1: 2, value2: false, value3: 'sabel', value4: null, value5: undefined, value7: 'someValue',
        };

        const result = mergeRight(obj1, obj2);
        const expected = {
            value1: 2, value2: false, value3: 'sabel', value4: null, value5: undefined, value6: 'someValue', value7: 'someValue',
        };

        expect(result).toEqual(expected);
    });
    test('should not overwrite with undefined', () => {
        const obj1 = {
            value1: 1, value2: true, value3: 'babel', value4: 'someValue', value5: 'someValue', value6: 'someValue',
        };
        const obj2 = undefined;

        const result = mergeRight(obj1, obj2);

        expect(result).toEqual(obj1);
    });
});

describe('mutAssocPath', () => {
    test('should assoc at path with path length = 1', () => {
        const obj = {};

        const result = mutAssocPath(['prop'], 'value')(obj);
        const expected = {
            prop: 'value',
        };

        expect(result).toEqual(expected);
    });
    test('should not modify other properties with path length = 1 ', () => {
        const obj = { ogProp: 'ogValue' };

        const result = mutAssocPath(['prop'], 'value')(obj);
        const expected = {
            prop: 'value',
            ogProp: 'ogValue',
        };

        expect(result).toEqual(expected);
    });
    test('should return same object instance with path length = 1 ', () => {
        const obj = { ogProp: 'ogValue' };

        const result = mutAssocPath(['prop'], 'value')(obj);

        expect(obj === result).toBeTruthy();
    });
    test('should assoc at path with path length = 3', () => {
        const obj = {};

        const result = mutAssocPath(['some', 'test', 'path'], 'value')(obj);
        const expected = {
            some: {
                test: {
                    path: 'value',
                },
            },
        };

        expect(result).toEqual(expected);
    });
    test('should not modify other properties with path length = 1 ', () => {
        const obj = {
            ogProp1: 'ogValue1',
            some: {
                ogProp2: 'ogValue2',
                test: {
                    ogProp3: 'ogValue3',
                },
            },
        };

        const result = mutAssocPath(['some', 'test', 'path'], 'value')(obj);
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
    test('should return same object instance with path length = 1 ', () => {
        const obj = { ogProp: 'ogValue' };

        const result = mutAssocPath(['some', 'test', 'path'], 'value')(obj);

        expect(obj === result).toBeTruthy();
    });
});
