import { gotReducer } from '../index.js';
import { GOT_ACTION_CLEAR_ALL } from '../reducer.js';
import { createTestStore } from './shared.spec.js';

describe('store:clear-all', () => {
    test('should call `dispatch` with correct parameters', () => {
        /* #region Test Bed Creation */
        const {
            store: { clearAll },
            dispatch,
            onError,
        } = createTestStore();
        /* #endregion */

        /* #region Execution and Validation */
        clearAll();

        expect(dispatch).toBeCalledWith({
            type: 'GOT/CLEAR_ALL',
        });
        expect(onError).not.toBeCalled();
        /* #endregion */
    });
    test('reducer should return empty object', () => {
        /* #region Test Bed Creation */
        const graphName1 = 'graph1';
        const state = {
            [graphName1]: {},
        };
        /* #endregion */

        /* #region Execution and Validation */
        const action = {
            type: GOT_ACTION_CLEAR_ALL,
        };

        const result = gotReducer(state, action);

        expect(result).toEqual({});
        /* #endregion */
    });
    test('should clear store completely', () => {
        /* #region Test Bed Creation */
        const graphName1 = 'graph1';

        const {
            store: { clearAll },
            getState,
            onError,
        } = createTestStore({
            [graphName1]: {},
        });
        /* #endregion */

        /* #region Execution and Validation */
        clearAll();

        expect(onError).not.toBeCalled();
        expect(getState()).toEqual({});
        /* #endregion */
    });
    test('should do nothing if the store is empty', () => {
        /* #region Test Bed Creation */
        const {
            initialState,
            store: { clearAll },
            getState,
            onError,
        } = createTestStore({});
        /* #endregion */

        /* #region Execution and Validation */
        clearAll();

        expect(onError).not.toBeCalled();
        expect(getState()).toEqual(initialState);
        /* #endregion */
    });
});
