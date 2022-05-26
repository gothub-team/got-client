import { createTestStore } from './shared.js';

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
