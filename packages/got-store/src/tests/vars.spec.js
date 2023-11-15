import { MISSING_PARAM_ERROR } from '../errors.js';
import { createTestStore } from './shared.js';

describe('store:Vars', () => {
    describe('selectVar', () => {
        test('should get var if var exists', () => {
            /* #region Test Bed Creation */
            const varName = 'key';
            const varValue1 = 'value1';
            const graphName1 = 'graph1';

            const {
                store: { selectVar },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {
                        [varName]: varValue1,
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectVar(graphName1)(varName));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(varValue1);
            /* #endregion */
        });
        test('should stack vars correctly', () => {
            /* #region Test Bed Creation */
            const varName = 'key';
            const varValue1 = 'value1';
            const varValue2 = 'value2';

            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectVar },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {
                        [varName]: varValue1,
                    },
                },
                [graphName2]: {
                    vars: {
                        [varName]: varValue2,
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectVar(graphName1, graphName2)(varName));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(varValue2);
            /* #endregion */
        });
        test('should not override vars with undefined from higher stacked graphs', () => {
            /* #region Test Bed Creation */
            const varName = 'key';
            const varValue1 = 'value1';

            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectVar },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {
                        [varName]: varValue1,
                    },
                },
                [graphName2]: {
                    vars: {},
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectVar(graphName1, graphName2)(varName));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(varValue1);
            /* #endregion */
        });
        test('should return undefined if var does not exist in any stacked views', () => {
            /* #region Test Bed Creation */
            const varName = 'key';

            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectVar },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {},
                },
                [graphName2]: {
                    vars: {},
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectVar(graphName1, graphName2)(varName));

            expect(onError).not.toBeCalled();
            expect(output).toBeUndefined();
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const varName = 'var1';
            const varValue1 = 'value1';

            const graphName1 = 'graph1';

            const {
                store: { selectVar },
                select,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {
                        [varName]: varValue1,
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = select(selectVar()(varName));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toBeUndefined();

            const output2 = select(selectVar(graphName1)(undefined));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'name',
                }),
            );
            expect(output2).toBeUndefined();

            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('getVar', () => {
        test('should return the same value as select(selectVar) (should get var if var exists)', () => {
            /* #region Test Bed Creation */
            const varName = 'key';
            const varValue1 = 'value1';
            const graphName1 = 'graph1';

            const {
                store: { selectVar, getVar },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {
                        [varName]: varValue1,
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const getterOutput = getVar(graphName1)(varName);
            const selectorOutput = select(selectVar(graphName1)(varName));

            expect(onError).not.toBeCalled();
            expect(getterOutput).toEqual(selectorOutput);
            /* #endregion */
        });
    });

    describe('setVar', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const graphName = 'graph1';
            const name = 'varName';
            const value = 'value';

            const {
                store: { setVar },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            setVar(graphName)(name, value);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/SET_VAR',
                payload: {
                    graphName,
                    name,
                    value,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should set var in specified view', () => {
            /* #region Test Bed Creation */
            const varName = 'key';
            const varValue1 = 'value1';
            const graphName1 = 'graph1';

            const {
                store: { setVar },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            setVar(graphName1)(varName, varValue1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'vars', varName], varValue1);
            /* #endregion */
        });
        test('should do nothing if value is undefined', () => {
            /* #region Test Bed Creation */
            const varName = 'key';
            const varValue1 = 'value1';
            const graphName1 = 'graph1';

            const {
                store: { setVar },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {
                        [varName]: varValue1,
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            setVar(graphName1)(varName, undefined);

            const expectedGraph = {
                [graphName1]: {
                    vars: {
                        [varName]: undefined,
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()[graphName1]).toEqual(expectedGraph[graphName1]);
            /* #endregion */
        });
        test('should set var if value is null', () => {
            /* #region Test Bed Creation */
            const varName = 'key';
            const varValue1 = 'value1';
            const varValue2 = null;
            const graphName1 = 'graph1';

            const {
                store: { setVar },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {
                        [varName]: varValue1,
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            setVar(graphName1)(varName, varValue2);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'vars', varName], varValue2);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const varName = 'var1';
            const varValue1 = 'value1';
            const graphName1 = 'graph1';

            const {
                initialState,
                store: { setVar },
                getState,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    vars: {},
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            setVar(undefined)(varName, varValue1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'graphName',
                }),
            );

            setVar(graphName1)(undefined, varValue1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'name',
                }),
            );

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });
});
