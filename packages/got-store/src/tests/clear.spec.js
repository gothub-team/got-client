import { createTestStore } from './shared.js';
import { MISSING_PARAM_ERROR } from '../errors.js';

describe('store:clear', () => {
    test('should call `dispatch` with correct parameters', () => {
        /* #region Test Bed Creation */
        const graphName = 'graph1';

        const {
            store: { clear },
            dispatch,
            onError,
        } = createTestStore();
        /* #endregion */

        /* #region Execution and Validation */
        clear(graphName);

        expect(dispatch).toBeCalledWith({
            type: 'GOT/CLEAR',
            payload: {
                graphName,
            },
        });
        expect(onError).not.toBeCalled();
        /* #endregion */
    });
    test('should delete graph completely from state', () => {
        /* #region Test Bed Creation */
        const graphName1 = 'graph1';

        const {
            store: { clear },
            getState,
            onError,
        } = createTestStore({
            [graphName1]: {},
        });
        /* #endregion */

        /* #region Execution and Validation */
        clear(graphName1);

        expect(onError).not.toBeCalled();
        expect(getState()).not.toHaveProperty(graphName1);
        /* #endregion */
    });
    test('should not modify other graphs if specified graph does not exist', () => {
        /* #region Test Bed Creation */
        const graphName1 = 'graph1';
        const graphName2 = 'graph2';

        const {
            store: { clear },
            getState,
            onError,
        } = createTestStore({
            [graphName1]: {},
        });
        /* #endregion */

        /* #region Execution and Validation */
        clear(graphName2);

        expect(onError).not.toBeCalled();
        expect(getState()).toHaveProperty(graphName1);
        expect(getState()).not.toHaveProperty(graphName2);
        /* #endregion */
    });
    test('should call `onError` in case of invalid input (undefined graphName)', () => {
        /* #region Test Bed Creation */
        const graphName1 = 'graph1';

        const {
            initialState,
            store: { clear },
            getState,
            dispatch,
            onError,
        } = createTestStore({
            [graphName1]: {},
        });
        /* #endregion */

        /* #region Execution and Validation */
        clear(undefined);
        expect(onError).toBeCalledWith(expect.objectContaining({
            name: MISSING_PARAM_ERROR,
            missing: 'graphName',
        }));

        expect(getState()).toEqual(initialState);
        expect(dispatch).not.toBeCalled();
        /* #endregion */
    });
});
