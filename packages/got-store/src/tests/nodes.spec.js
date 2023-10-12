import { MISSING_PARAM_ERROR } from '../errors.js';
import { createTestStore } from './shared.js';

describe('store:Nodes', () => {
    describe('selectNode', () => {
        test('should get node if node exists', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = { id: nodeId, value: 'asd' };
            const graphName1 = 'graph1';

            const {
                store: { selectNode },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectNode(graphName1)(nodeId));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(node1);
            /* #endregion */
        });
        test('should stack node correctly', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = {
                id: nodeId,
                value1: 'og1',
                value2: 'og2',
            };
            const node2 = {
                id: nodeId,
                value2: 'edit2',
                value3: 'edit3',
            };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectNode },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        nodes: {
                            [nodeId]: node2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectNode(graphName1, graphName2)(nodeId));

            const expectedResult = {
                id: nodeId,
                value1: 'og1',
                value2: 'edit2',
                value3: 'edit3',
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedResult);
            /* #endregion */
        });
        test('should not override node with not existing from higher stacked graphs', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = { id: nodeId, value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectNode },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        nodes: {},
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectNode(graphName1, graphName2)(nodeId));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(node1);
            /* #endregion */
        });
        test('should return undefined if node does not exist in any stacked views', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectNode },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {},
                    },
                },
                [graphName2]: {
                    graph: {
                        nodes: {},
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectNode(graphName1, graphName2)(nodeId));

            expect(onError).not.toBeCalled();
            expect(output).toBeUndefined();
            /* #endregion */
        });
        test('should merge node along the stack (`null` overrides values lower in stack)', () => {
            /* #region Test Bed Creation */
            // TODO not sure if this testcase tests the right thing
            const nodeId = 'node1';
            const node1 = { id: nodeId, value1: 'og' };
            const node2 = null;
            const node3 = { id: nodeId, value2: 'edit' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const graphName3 = 'graph3';

            const {
                store: { selectNode },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        nodes: {
                            [nodeId]: node2,
                        },
                    },
                },
                [graphName3]: {
                    graph: {
                        nodes: {
                            [nodeId]: node3,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectNode(graphName1, graphName2, graphName3)(nodeId));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(node3);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = { id: nodeId, value1: 'og1' };
            const graphName1 = 'graph1';

            const {
                store: { selectNode },
                select,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = select(selectNode()(nodeId));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toBeUndefined();

            const output2 = select(selectNode(graphName1)(undefined));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'nodeId',
                }),
            );
            expect(output2).toBeUndefined();

            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('getNode', () => {
        test('should return the same value as select(selectNode) (should get node if node exists)', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = { id: nodeId, value: 'asd' };
            const graphName1 = 'graph1';

            const {
                store: { selectNode, getNode },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const selectorOutput = select(selectNode(graphName1)(nodeId));
            const getterOutput = getNode(graphName1)(nodeId);

            expect(onError).not.toBeCalled();
            expect(getterOutput).toEqual(selectorOutput);
            /* #endregion */
        });
    });

    describe('setNode', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node = { id: nodeId };
            const graphName = 'graph1';

            const {
                store: { setNode },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            setNode(graphName)(node);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/SET_NODE',
                payload: {
                    graphName,
                    node,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should set node in specified view', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = { id: nodeId, value: 'asd' };
            const graphName1 = 'graph1';

            const {
                store: { setNode },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            setNode(graphName1)(node1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            /* #endregion */
        });
        test('should patch node if node already exists', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = { id: nodeId, value1: 'og1', value2: 'og2' };
            const node2 = { id: nodeId, value2: 'edit2', value3: 'edit3' };
            const graphName1 = 'graph1';

            const {
                store: { setNode },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            setNode(graphName1)(node2);

            const expectedResult = {
                id: nodeId,
                value1: 'og1',
                value2: 'edit2',
                value3: 'edit3',
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], expectedResult);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node1 = { id: nodeId, value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';

            const {
                initialState,
                store: { setNode },
                getState,
                dispatch,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            setNode(undefined)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'graphName',
                }),
            );

            setNode(graphName1)({ prop: 'someProp' });
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'node.id',
                }),
            );

            setNode(graphName1)(undefined);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'node',
                }),
            );

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });
});
