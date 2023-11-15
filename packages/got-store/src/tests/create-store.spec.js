import { CONFIGURATION_ERROR } from '../errors.js';
import { createStore } from '../index.js';

describe('store:createStore', () => {
    test('should call `onWarn` in case of undefined `api`, `dispatch` or `select`', async () => {
        /* #region Test Bed Creation */
        const onWarn = jest.fn();
        createStore({
            onWarn,
        });
        /* #endregion */

        /* #region Execution and Validation */
        expect(onWarn).toBeCalledWith(
            expect.objectContaining({
                name: CONFIGURATION_ERROR,
                missing: 'api',
            }),
        );
        expect(onWarn).toBeCalledWith(
            expect.objectContaining({
                name: CONFIGURATION_ERROR,
                missing: 'dispatch',
            }),
        );
        expect(onWarn).toBeCalledWith(
            expect.objectContaining({
                name: CONFIGURATION_ERROR,
                missing: 'select',
            }),
        );
        /* #endregion */
    });
    test('should call `onError` in case of undefined `api`', async () => {
        /* #region Test Bed Creation */
        const nodeId = 'node1';
        const view = {
            [nodeId]: {
                include: {
                    node: true,
                },
            },
        };

        const onError = jest.fn();
        const onWarn = jest.fn();
        const dispatch = jest.fn();
        const select = jest.fn();
        const { pull } = createStore({
            onError,
            onWarn,
            dispatch,
            select,
        });
        /* #endregion */

        /* #region Execution and Validation */
        await pull(view);

        expect(onError).toBeCalledWith(
            expect.objectContaining({
                name: CONFIGURATION_ERROR,
                missing: 'api',
            }),
        );
        expect(dispatch).not.toBeCalled();
        expect(select).not.toBeCalled();
        /* #endregion */
    });
    test('should call `onError` in case of undefined `dispatch`', async () => {
        /* #region Test Bed Creation */
        const onError = jest.fn();
        const onWarn = jest.fn();
        const select = jest.fn();

        const { merge } = createStore({
            api: {
                push: jest.fn(),
                pull: jest.fn(),
            },
            onError,
            onWarn,
            select,
        });
        /* #endregion */

        /* #region Execution and Validation */
        await merge('graph1', 'graph2');

        expect(onError).toBeCalledWith(
            expect.objectContaining({
                name: CONFIGURATION_ERROR,
                missing: 'dispatch',
            }),
        );
        /* #endregion */
    });
    test('should call `onError` in case of undefined `select`', async () => {
        /* #region Test Bed Creation */
        const onError = jest.fn();
        const onWarn = jest.fn();
        const dispatch = jest.fn();

        const { push } = createStore({
            api: {
                push: jest.fn(),
                pull: jest.fn(),
            },
            dispatch,
            onError,
            onWarn,
        });
        /* #endregion */

        /* #region Execution and Validation */
        await push('graph1');

        expect(onError).toBeCalledWith(
            expect.objectContaining({
                name: CONFIGURATION_ERROR,
                missing: 'select',
            }),
        );
        expect(dispatch).not.toBeCalled();
        /* #endregion */
    });
});
