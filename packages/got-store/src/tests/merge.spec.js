import { createTestStore } from './shared.js';
import { MISSING_PARAM_ERROR } from '../errors.js';

describe('store:merge', () => {
    describe('Dispatch', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const fromGraphName = 'fromGraphName';
            const toGraphName = 'toGraphName';

            const {
                store: { merge },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            merge(fromGraphName, toGraphName);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/MERGE',
                payload: {
                    fromGraphName,
                    toGraphName,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('Nodes', () => {
        test('should merge nodes into toGraph', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const node1 = { id: 'node1' };
            const node2 = { id: 'node2' };

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [node1.id]: node1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        nodes: {
                            [node2.id]: node2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1);

            const expectedGraph = {
                graph: {
                    nodes: {
                        [node1.id]: node1,
                        [node2.id]: node2,
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge nodes into toGraph which does not exist', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const node1 = { id: 'node1' };
            const node2 = { id: 'node2' };

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName2]: {
                    graph: {
                        nodes: {
                            [node1.id]: node1,
                            [node2.id]: node2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1);

            const expectedGraph = {
                graph: {
                    nodes: {
                        [node1.id]: node1,
                        [node2.id]: node2,
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should patch overlapping nodes', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, value1: 'og1', value2: 'og2' };
            const node1patch = { id: nodeId1, value2: 'edit2', value3: 'edit3' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
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
                            [nodeId1]: node1patch,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    nodes: {
                        [nodeId1]: {
                            id: nodeId1,
                            value1: 'og1',
                            value2: 'edit2',
                            value3: 'edit3',
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should not overwrite overlapping nodes with true', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
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
                            [nodeId1]: true,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    nodes: {
                        [nodeId1]: node1,
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should not deep merge overlapping nodes', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, obj: { value1: 'og1', value2: 'og2' } };
            const node1patch = { id: nodeId1, obj: { value2: 'edit2', value3: 'edit3' } };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
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
                            [nodeId1]: node1patch,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    nodes: {
                        [nodeId1]: node1patch,
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should keep node marked for deletion', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
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
                            [nodeId1]: false,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId1], false);
            /* #endregion */
        });
    });

    describe('Edges', () => {
        test('should merge edges into toGraph (seperate fromTypes)', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromType2 = 'fromType2';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType2]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    edges: {
                        [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                        [fromType2]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge edges into toGraph (seperate fromIds)', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const fromId2 = 'fromId2';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId2]: { [toType1]: { [nodeId1]: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    edges: {
                        [fromType1]: {
                            [fromId1]: { [toType1]: { [nodeId1]: true } },
                            [fromId2]: { [toType1]: { [nodeId1]: true } },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge edges into toGraph (seperate toTypes)', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const toType2 = 'toType2';
            const nodeId1 = 'node1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType2]: { [nodeId1]: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    edges: {
                        [fromType1]: {
                            [fromId1]: {
                                [toType1]: { [nodeId1]: true },
                                [toType2]: { [nodeId1]: true },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge edges into toGraph (seperate toIds)', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId2]: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    edges: {
                        [fromType1]: {
                            [fromId1]: {
                                [toType1]: {
                                    [nodeId1]: true,
                                    [nodeId2]: true,
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge edges into toGraph (merge metadata)', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const metadata2 = { value2: 'edit2', value3: 'edit3' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: metadata2 } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    edges: {
                        [fromType1]: {
                            [fromId1]: {
                                [toType1]: {
                                    [nodeId1]: {
                                        value1: 'og1',
                                        value2: 'edit2',
                                        value3: 'edit3',
                                    },
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge edges into toGraph (not overwrite metadata with true)', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    edges: {
                        [fromType1]: {
                            [fromId1]: {
                                [toType1]: {
                                    [nodeId1]: metadata1,
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should not deep merge metadata', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { obj: { value1: 'og1', value2: 'og2' } };
            const metadata1Patch = { obj: { value2: 'edit2', value3: 'edit3' } };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: metadata1Patch } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    edges: {
                        [fromType1]: {
                            [fromId1]: {
                                [toType1]: {
                                    [nodeId1]: metadata1Patch,
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should keep edge marked with false for deletion', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: {
                                [fromId1]: {
                                    [toType1]: {
                                        [nodeId1]: metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: {
                                [fromId1]: {
                                    [toType1]: {
                                        [nodeId1]: false,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'edges', fromType1, fromId1, toType1, nodeId1], false);
            /* #endregion */
        });
        test('should keep edge marked with undefined for deletion', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType1]: {
                                [fromId1]: {
                                    [toType1]: {
                                        [nodeId1]: metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType1]: {
                                [fromId1]: {
                                    [toType1]: {
                                        [nodeId1]: undefined,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'edges', fromType1, fromId1, toType1, nodeId1], undefined);
            /* #endregion */
        });
    });

    describe('Reverse Edges', () => {
        test('should merge reverse edges into toGraph (seperate toTypes)', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toType2 = 'toType2';
            const toId = 'toId1';
            const fromType1 = 'fromType1';
            const fromId = 'fromId1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: { [toId]: { [fromType1]: { [fromId]: true } } },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType2]: { [toId]: { [fromType1]: { [fromId]: true } } },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    index: {
                        reverseEdges: {
                            [toType1]: { [toId]: { [fromType1]: { [fromId]: true } } },
                            [toType2]: { [toId]: { [fromType1]: { [fromId]: true } } },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge reverse edges into toGraph (seperate toIds)', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toId1 = 'toId1';
            const toId2 = 'toId2';
            const fromType1 = 'fromType1';
            const fromId1 = 'from1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: { [toId1]: { [fromType1]: { [fromId1]: true } } },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: { [toId2]: { [fromType1]: { [fromId1]: true } } },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    index: {
                        reverseEdges: {
                            [toType1]: {
                                [toId1]: { [fromType1]: { [fromId1]: true } },
                                [toId2]: { [fromType1]: { [fromId1]: true } },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge reverse edges into toGraph (seperate fromTypes)', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toId1 = 'toId1';
            const fromType1 = 'fromType1';
            const fromType2 = 'fromType2';
            const fromId1 = 'fromId1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: { [toId1]: { [fromType1]: { [fromId1]: true } } },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: { [toId1]: { [fromType2]: { [fromId1]: true } } },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    index: {
                        reverseEdges: {
                            [toType1]: {
                                [toId1]: {
                                    [fromType1]: { [fromId1]: true },
                                    [fromType2]: { [fromId1]: true },
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge reverse edges into toGraph (seperate fromIds)', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toId1 = 'toId1';
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const fromId2 = 'fromId2';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: { [toId1]: { [fromType1]: { [fromId1]: true } } },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: { [toId1]: { [fromType1]: { [fromId2]: true } } },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    index: {
                        reverseEdges: {
                            [toType1]: {
                                [toId1]: {
                                    [fromType1]: {
                                        [fromId1]: true,
                                        [fromId2]: true,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        // TODO maybe expect merge to always transform any truthy values of reverse edges to true?
        test('should keep reverse edge marked for deletion', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toId1 = 'toId1';
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: {
                                    [toId1]: {
                                        [fromType1]: {
                                            [fromId1]: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: {
                                    [toId1]: {
                                        [fromType1]: {
                                            [fromId1]: false,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'index', 'reverseEdges', toType1, toId1, fromType1, fromId1], false);
            /* #endregion */
        });
        test('should keep reverse edge marked as undefined', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toId1 = 'toId1';
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: {
                                    [toId1]: {
                                        [fromType1]: {
                                            [fromId1]: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        index: {
                            reverseEdges: {
                                [toType1]: {
                                    [toId1]: {
                                        [fromType1]: {
                                            [fromId1]: undefined,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'index', 'reverseEdges', toType1, toId1, fromType1, fromId1], undefined);
            /* #endregion */
        });
    });

    describe('User Rights', () => {
        test('should merge user rights into toGraph (seperate nodeIds)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const user1 = 'user1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId2]: { user: { [user1]: { read: true, admin: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: { user: { [user1]: { read: true, write: true } } },
                        [nodeId2]: { user: { [user1]: { read: true, admin: true } } },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge user rights into toGraph (seperate users)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const user1 = 'user1';
            const user2 = 'user2';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user2]: { read: true, admin: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            user: {
                                [user1]: { read: true, write: true },
                                [user2]: { read: true, admin: true },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge user rights into toGraph (merge rights)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const user1 = 'user1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user1]: { read: true, admin: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            user: {
                                [user1]: {
                                    read: true,
                                    write: true,
                                    admin: true,
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should keep user rights marked for deletion', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const user1 = 'user1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user1]: { read: false, admin: false } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            user: {
                                [user1]: {
                                    read: false,
                                    write: true,
                                    admin: false,
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
    });

    describe('Role Rights', () => {
        test('should merge role rights into toGraph (seperate nodeIds)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const role1 = 'role1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId2]: { role: { [role1]: { read: true, admin: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: { role: { [role1]: { read: true, write: true } } },
                        [nodeId2]: { role: { [role1]: { read: true, admin: true } } },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge role rights into toGraph (seperate roles)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const role1 = 'role1';
            const role2 = 'role2';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role2]: { read: true, admin: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            role: {
                                [role1]: { read: true, write: true },
                                [role2]: { read: true, admin: true },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge role rights into toGraph (merge rights)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const role1 = 'role1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role1]: { read: true, admin: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            role: {
                                [role1]: {
                                    read: true,
                                    write: true,
                                    admin: true,
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should keep role rights marked for deletion', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const role1 = 'role1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role1]: { read: true, write: true } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role1]: { read: false, admin: false } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            role: {
                                [role1]: {
                                    read: false,
                                    write: true,
                                    admin: false,
                                },
                            },
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
    });

    describe('Files', () => {
        test('should merge files into toGraph (should merge seperate nodeIds)', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const prop1 = 'file1';
            const url1 = 'someurl1.com';
            const url2 = 'someurl2.com';

            const fileView1 = {
                [prop1]: {
                    url1,
                },
            };
            const fileView2 = {
                [prop1]: {
                    url2,
                },
            };

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId1]: fileView1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        files: {
                            [nodeId2]: fileView2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1);

            const expectedGraph = {
                graph: {
                    files: {
                        [nodeId1]: fileView1,
                        [nodeId2]: fileView2,
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge files into toGraph (should merge seperate props)', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const nodeId1 = 'node1';
            const prop1 = 'file1';
            const prop2 = 'file2';
            const url1 = 'someurl1.com';
            const url2 = 'someurl2.com';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId1]: {
                                [prop1]: {
                                    url1,
                                },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        files: {
                            [nodeId1]: {
                                [prop2]: {
                                    url2,
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1);

            const expectedGraph = {
                graph: {
                    files: {
                        [nodeId1]: {
                            [prop1]: {
                                url1,
                            },
                            [prop2]: {
                                url2,
                            },
                        },
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge files into toGraph (should completely overwrite seperate entries)', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const nodeId1 = 'node1';
            const prop1 = 'file1';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId1]: {
                                [prop1]: {
                                    value1: 'og1',
                                    value2: 'og2',
                                },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        files: {
                            [nodeId1]: {
                                [prop1]: {
                                    value2: 'newOg2',
                                    value3: 'newOg3',
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1);

            const expectedGraph = {
                graph: {
                    files: {
                        [nodeId1]: {
                            [prop1]: {
                                value2: 'newOg2',
                                value3: 'newOg3',
                            },
                        },
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
        test('should merge files into toGraph (should merge file marked for deletion)', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const nodeId1 = 'node1';
            const prop1 = 'file1';
            const url = 'someurl.com';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId1]: {
                                [prop1]: {
                                    url,
                                },
                            },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        files: {
                            [nodeId1]: {
                                [prop1]: false,
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1);

            const expectedGraph = {
                graph: {
                    files: {
                        [nodeId1]: {
                            [prop1]: false,
                        },
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        });
    });

    describe('Error handling', () => {
        // Missing Graphs in state
        test('should not modify toGraph if fromGraph does not exist', () => {
        /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                initialState,
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId1]: node1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            expect(onError).not.toBeCalled();
            expect(getState()[graphName1]).toEqual(initialState[graphName1]);
        /* #endregion */
        });
        test('should copy graph if toGraph does not exist', () => {
        /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const node1 = { id: nodeId1 };
            const node2 = { id: nodeId2 };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { merge },
                getState,
                onError,
            } = createTestStore({
                [graphName2]: {
                    graph: {
                        nodes: {
                            [nodeId1]: node1,
                            [nodeId2]: node2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            merge(graphName2, graphName1); // merge stack2 into stack1

            const expectedState = {
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId1]: node1,
                            [nodeId2]: node2,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        nodes: {
                            [nodeId1]: node1,
                            [nodeId2]: node2,
                        },
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()[graphName1]).toEqual(expectedState[graphName1]);
            expect(getState()[graphName2]).toEqual(expectedState[graphName2]);
        /* #endregion */
        });
        // Invalid Input
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
                store: { merge },
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
            merge(undefined, graphName1);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'fromGraphName',
            }));

            merge(graphName2, undefined);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'toGraphName',
            }));

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
        /* #endregion */
        });
    });
});
