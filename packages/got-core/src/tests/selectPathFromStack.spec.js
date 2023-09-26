import { mergeLeft } from 'ramda';
import { selectPathFromStack } from '../index.js';

describe('selectPathFromStack', () => {
    test('should not crash when state is undefined', () => {
        const state = undefined;

        selectPathFromStack(['nodes', 'node1'], ['graph1', 'graph2'], mergeLeft, state);
    });
    test('should merge items from path in stack', () => {
        const state = {
            graph1: {
                nodes: {
                    node1: { id: 'node1', val1: 'og1', val2: 'og2' },
                },
            },
            graph2: {
                nodes: {
                    node1: { id: 'node1', val2: 'edit2', val3: 'new3' },
                },
            },
        };

        const res = selectPathFromStack(['nodes', 'node1'], ['graph1', 'graph2'], mergeLeft, state);

        expect(res).toEqual({ id: 'node1', val1: 'og1', val2: 'edit2', val3: 'new3' });
    });
});
