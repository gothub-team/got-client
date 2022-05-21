import { mergeRight } from './index.js';

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
