import { createTestStore } from './shared.spec.js';
import { MISSING_PARAM_ERROR } from '../errors.js';

describe('store:mergeGraph', () => {
    test('should call `onError` in case of invalid input', () => {
        /* #region Test Bed Creation */
        const nodeId1 = 'node1';
        const nodeId2 = 'node2';

        const node1 = { id: nodeId1 };
        const node2 = { id: nodeId2 };

        const graphName1 = 'graph1';
        const graphName2 = 'graph2';

        const {
            initialState,
            store: { mergeGraph },
            getState,
            dispatch,
            onError,
        } = createTestStore({
            [graphName1]: {
                graph: {
                    nodes: {
                        [nodeId1]: node1,
                    },
                },
            },
            [graphName2]: {
                graph: {
                    nodes: {
                        [nodeId2]: node2,
                    },
                },
            },
        });
        /* #endregion */

        /* #region Execution and Validation */
        mergeGraph(undefined, graphName1);
        expect(onError).toBeCalledWith(
            expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'fromGraph',
            }),
        );

        mergeGraph({}, undefined);
        expect(onError).toBeCalledWith(
            expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'toGraphName',
            }),
        );

        expect(getState()).toEqual(initialState);
        expect(dispatch).not.toBeCalled();
        /* #endregion */
    });
});
