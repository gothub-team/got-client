import { GOT_ACTION_MERGE_OVERWRITE, gotReducer } from '../../index.js';

describe('reducer::mergeOverwrite', () => {
    test('should merge nodes into existing graph', () => {
        const graph1 = {
            graph: {
                nodes: {
                    node1: { id: 'node1' },
                },
            },
        };

        const graph2 = {
            nodes: {
                node2: { id: 'node2' },
            },
        };

        const action = {
            type: GOT_ACTION_MERGE_OVERWRITE,
            payload: {
                fromGraph: graph2,
                toGraphName: 'graph1',
            },
        };

        const result = gotReducer({ graph1 }, action);

        const expectedResult = {
            graph: {
                nodes: {
                    node1: { id: 'node1' },
                    node2: { id: 'node2' },
                },
            },
        };

        expect(result.graph1).toEqual(expectedResult);
    });
    test('should merge correctly to non existing graph', () => {
        const graph2 = {
            nodes: {
                node2: { id: 'node2' },
            },
        };

        const action = {
            type: GOT_ACTION_MERGE_OVERWRITE,
            payload: {
                fromGraph: graph2,
                toGraphName: 'graph1',
            },
        };

        const result = gotReducer({}, action);

        const expectedResult = {
            graph: {
                nodes: {
                    node2: { id: 'node2' },
                },
            },
        };

        expect(result.graph1).toEqual(expectedResult);
    });
    test('should merge correctly when merging empty object to non existing graph', () => {
        const graph2 = { };

        const action = {
            type: GOT_ACTION_MERGE_OVERWRITE,
            payload: {
                fromGraph: graph2,
                toGraphName: 'graph1',
            },
        };

        const result = gotReducer({}, action);

        const expectedResult = {
            graph: {},
        };

        expect(result.graph1).toEqual(expectedResult);
    });
});
