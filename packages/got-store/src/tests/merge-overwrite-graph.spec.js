import * as R from 'ramda';
import { createTestStore, generateRandomTestData } from './shared.spec.js';
import { MISSING_PARAM_ERROR } from '../errors.js';

describe('store:mergeOverwriteGraph', () => {
    describe('Dispatch', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const toGraphName = 'graph1';
            const nodeId1 = 'node1';
            const graph = {
                nodes: {
                    [nodeId1]: { id: nodeId1, value: 1 },
                },
            };

            const {
                store: { mergeOverwriteGraph },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, toGraphName);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/MERGE_OVERWRITE',
                payload: {
                    fromGraph: graph,
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
            const toGraphName = 'graph1';
            const node1 = { id: 'node1' };
            const node2 = { id: 'node2' };

            const graph = {
                nodes: {
                    [node2.id]: node2,
                },
            };

            const {
                store: { mergeOverwriteGraph },
                getState,
                onError,
            } = createTestStore({
                [toGraphName]: {
                    graph: {
                        nodes: {
                            [node1.id]: node1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, toGraphName);

            const expectedGraph = {
                graph: {
                    nodes: {
                        [node1.id]: node1,
                        [node2.id]: node2,
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(toGraphName, expectedGraph);
            /* #endregion */
        });
        test('should merge nodes into toGraph which does not exist', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const node1 = { id: 'node1' };
            const node2 = { id: 'node2' };

            const graph = {
                nodes: {
                    [node1.id]: node1,
                    [node2.id]: node2,
                },
            };

            const {
                store: { mergeOverwriteGraph },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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

        const testMergeNode = (id, node, nodePatch, expectedResult) => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';

            const graph = {
                nodes: {
                    [id]: nodePatch,
                },
            };

            const {
                store: { mergeOverwriteGraph },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [id]: node,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1); // merge graph into stack1

            const expectedGraph = {
                graph: {
                    nodes: {
                        [id]: expectedResult,
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        };

        test('should overwrite overlapping nodes [object, object]', () => {
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, value1: 'og1', value2: 'og2' };
            const node1patch = { id: nodeId1, value2: 'edit2', value3: 'edit3' };
            testMergeNode(nodeId1, node1, node1patch, node1patch);
        });
        test('should overwrite overlapping nodes [false, object]', () => {
            const nodeId1 = 'node1';
            const node1 = false;
            const node1patch = { id: nodeId1, value2: 'edit2', value3: 'edit3' };
            testMergeNode(nodeId1, node1, node1patch, node1patch);
        });
        test('should overwrite overlapping nodes [true, object]', () => {
            const nodeId1 = 'node1';
            const node1 = true;
            const node1patch = { id: nodeId1, value2: 'edit2', value3: 'edit3' };
            testMergeNode(nodeId1, node1, node1patch, node1patch);
        });
        test('should overwrite overlapping nodes [object, false]', () => {
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, value1: 'og1', value2: 'og2' };
            const node1patch = false;
            testMergeNode(nodeId1, node1, node1patch, node1patch);
        });
        test('should not overwrite overlapping nodes [object, true]', () => {
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, value1: 'og1', value2: 'og2' };
            const node1patch = true;
            testMergeNode(nodeId1, node1, node1patch, node1);
        });
        test('should dissoc overlapping node [object, undefined]', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1, val: 3 };
            const graphName1 = 'graph1';

            const graph = {
                nodes: {
                    [nodeId1]: undefined,
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            mergeOverwriteGraph(graph, graphName1); // merge graph into stack1

            const hasNodePath = R.hasPath([graphName1, 'graph', 'nodes', nodeId1], getState());

            expect(onError).not.toBeCalled();
            expect(hasNodePath).toBeFalsy();
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

            const graph = {
                edges: {
                    [fromType2]: { [fromId1]: { [toType1]: { [nodeId1]: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1); // merge stack2 into stack1

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

            const graph = {
                edges: {
                    [fromType1]: { [fromId2]: { [toType1]: { [nodeId1]: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1); // merge stack2 into stack1

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

            const graph = {
                edges: {
                    [fromType1]: { [fromId1]: { [toType2]: { [nodeId1]: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1); // merge stack2 into stack1

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

            const graph = {
                edges: {
                    [fromType1]: { [fromId1]: { [toType1]: { [nodeId2]: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1); // merge stack2 into stack1

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

        const testMetadataMerge = (edge, metadata, metadataPatch, expectedResult) => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';

            const graph = R.assocPath(['edges', ...edge], metadataPatch, {});

            const {
                store: { mergeOverwriteGraph },
                getState,
                onError,
            } = createTestStore(R.assocPath([graphName1, 'graph', 'edges', ...edge], metadata, {}));
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1); // merge stack2 into stack1

            const expectedGraph = R.assocPath(['graph', 'edges', ...edge], expectedResult, {});
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(graphName1, expectedGraph);
            /* #endregion */
        };

        test('should merge edges into toGraph (overwrite metadata [object, object])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const metadata1Patch = { value2: 'edit2', value3: 'edit3' };

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1Patch);
        });
        test('should merge edges into toGraph (overwrite metadata [true, object])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = true;
            const metadata1Patch = { value2: 'edit2', value3: 'edit3' };

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1Patch);
        });
        test('should merge edges into toGraph (overwrite metadata [false, object])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = false;
            const metadata1Patch = { value2: 'edit2', value3: 'edit3' };

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1Patch);
        });
        test('should merge edges into toGraph (overwrite metadata [object, false])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const metadata1Patch = false;

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1Patch);
        });
        test('should merge edges into toGraph (overwrite metadata [true, false])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = true;
            const metadata1Patch = false;

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1Patch);
        });
        test('should merge edges into toGraph (overwrite metadata [false, true])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = true;
            const metadata1Patch = true;

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1Patch);
        });
        test('should merge edges into toGraph (not overwrite metadata [object, true])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const metadata1Patch = true;

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1);
        });
        test('should merge edges into toGraph (not overwrite metadata [true, true])', () => {
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = true;
            const metadata1Patch = true;

            testMetadataMerge([fromType1, fromId1, toType1, nodeId1], metadata1, metadata1Patch, metadata1);
        });

        test('should dissoc edges in toGraph when edge is marked with undefined', () => {
            /* #region Test Bed Creation */
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const nodeId1 = 'node1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const graphName1 = 'graph1';

            const graph = {
                edges: {
                    [fromType1]: {
                        [fromId1]: {
                            [toType1]: {
                                [nodeId1]: undefined,
                            },
                        },
                    },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1); // merge stack2 into stack1

            expect(onError).not.toBeCalled();
            const hasPath = R.hasPath([graphName1, 'graph', 'edges', fromType1, fromId1, toType1, nodeId1], getState());
            expect(hasPath).toBeFalsy();
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

            const graph = {
                index: {
                    reverseEdges: {
                        [toType2]: { [toId]: { [fromType1]: { [fromId]: true } } },
                    },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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

            const graph = {
                index: {
                    reverseEdges: {
                        [toType1]: { [toId2]: { [fromType1]: { [fromId1]: true } } },
                    },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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

            const graph = {
                index: {
                    reverseEdges: {
                        [toType1]: { [toId1]: { [fromType2]: { [fromId1]: true } } },
                    },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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

            const graph = {
                index: {
                    reverseEdges: {
                        [toType1]: { [toId1]: { [fromType1]: { [fromId2]: true } } },
                    },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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
        test('should keep reverse edge marked for deletion', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toId1 = 'toId1';
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const graphName1 = 'graph1';

            const graph = {
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
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'index', 'reverseEdges', toType1, toId1, fromType1, fromId1],
                false,
            );
            /* #endregion */
        });
        test('should dissoc reverse edge marked as undefined', () => {
            /* #region Test Bed Creation */
            const toType1 = 'toType1';
            const toId1 = 'toId1';
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const graphName1 = 'graph1';

            const graph = {
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
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            expect(onError).not.toBeCalled();
            const hasPath = R.hasPath(
                [graphName1, 'graph', 'index', 'reverseEdges', toType1, toId1, fromType1, fromId1],
                getState(),
            );
            expect(hasPath).toBeFalsy();
            /* #endregion */
        });
    });

    describe('User Rights', () => {
        test('should merge node rights object into toGraph (seperate nodeIds)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const user1 = 'user1';
            const graphName1 = 'graph1';

            const graph = {
                rights: {
                    [nodeId2]: { user: { [user1]: { read: true, admin: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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
        test('should overwrite node rights object in toGraph (overwrite rights)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const user1 = 'user1';
            const graphName1 = 'graph1';

            const graph = {
                rights: {
                    [nodeId1]: { user: { [user1]: { read: false, admin: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            user: {
                                [user1]: {
                                    read: false,
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
        test('should dissoc node rights object marked with undefined', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const user1 = 'user1';
            const graphName1 = 'graph1';

            const graph = {
                rights: {
                    [nodeId1]: undefined,
                },
            };

            const {
                store: { mergeOverwriteGraph },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { user: { [user1]: { read: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            expect(onError).not.toBeCalled();
            const hasPath = R.hasPath([graphName1, 'graph', 'rights', nodeId1], getState());
            expect(hasPath).toBeFalsy();
            /* #endregion */
        });
    });
    describe('Role Rights', () => {
        test('should merge node rights object into toGraph (seperate nodeIds)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const role1 = 'role1';
            const graphName1 = 'graph1';

            const graph = {
                rights: {
                    [nodeId2]: { role: { [role1]: { read: true, admin: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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
        test('should overwrite node rights object in toGraph (overwrite rights)', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const role1 = 'role1';
            const graphName1 = 'graph1';

            const graph = {
                rights: {
                    [nodeId1]: { role: { [role1]: { read: false, admin: true } } },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            const expectedGraph = {
                graph: {
                    rights: {
                        [nodeId1]: {
                            role: {
                                [role1]: {
                                    read: false,
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
        test('should dissoc node rights object marked with undefined', () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const role1 = 'role1';
            const graphName1 = 'graph1';

            const graph = {
                rights: {
                    [nodeId1]: undefined,
                },
            };

            const {
                store: { mergeOverwriteGraph },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId1]: { role: { [role1]: { read: true } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            expect(onError).not.toBeCalled();
            const hasPath = R.hasPath([graphName1, 'graph', 'rights', nodeId1], getState());
            expect(hasPath).toBeFalsy();
            /* #endregion */
        });
    });

    describe('Files', () => {
        test('should merge files into toGraph (should merge seperate nodeIds)', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
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

            const graph = {
                files: {
                    [nodeId2]: fileView2,
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

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
        test('should dissoc node files object marked with undefined', () => {
            /* #region Test Bed Creation */
            const graphName1 = 'graph1';
            const nodeId1 = 'node1';
            const prop1 = 'file1';
            const prop2 = 'file2';

            const graph = {
                files: {
                    [nodeId1]: {
                        [prop2]: {
                            value2: 'newOg2',
                            value3: 'newOg3',
                        },
                    },
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            const expectedGraph = {
                graph: {
                    files: {
                        [nodeId1]: {
                            [prop2]: {
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
            const nodeId1 = 'node1';
            const prop1 = 'file1';
            const url = 'someurl.com';

            const graph = {
                files: {
                    [nodeId1]: undefined,
                },
            };

            const {
                store: { mergeOverwriteGraph },
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
            });
            /* #endregion */

            /* #region Execution and Validation */
            mergeOverwriteGraph(graph, graphName1);

            expect(onError).not.toBeCalled();
            const hasPath = R.hasPath([graphName1, 'files', nodeId1], getState());
            expect(hasPath).toBeFalsy();
            /* #endregion */
        });
    });

    describe('Error handling', () => {
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

    describe('performance', () => {
        const testPerformance = (numParents, numChildren, numChildrenChildren, expectedTime) => {
            const totalNum = numParents + numParents * numChildren + numParents * numChildren * numChildrenChildren;
            test(`should merge ${numParents} parent, ${numChildren} children each and ${numChildrenChildren} childchildren (${totalNum} nodes) in under ${expectedTime}ms`, () => {
                const runTimes = 10;

                let totalTime = 0;
                for (let counter = 0; counter < runTimes; counter += 1) {
                    const {
                        store: { mergeOverwriteGraph },
                    } = createTestStore(
                        generateRandomTestData(numParents, numChildren, numChildrenChildren),
                        undefined,
                        false,
                    );

                    const {
                        main: { graph },
                    } = generateRandomTestData(numParents, numChildren, numChildrenChildren);

                    const start = performance.now();

                    mergeOverwriteGraph(graph, 'main');

                    const end = performance.now();
                    const runTime = end - start;
                    totalTime += runTime;
                }

                console.log(
                    `${numParents} parent, ${numChildren} children each and ${numChildrenChildren} childchildren (${totalNum} nodes) ran in `,
                    totalTime / runTimes,
                    'ms',
                );

                expect(totalTime / runTimes).toBeLessThanOrEqual(expectedTime);
            });
        };

        testPerformance(1000, 0, 0, 10);
        testPerformance(1, 1000, 0, 10);
        testPerformance(1, 1, 1000, 10);
        testPerformance(100, 10, 0, 10);
        testPerformance(100, 100, 0, 100);
        testPerformance(100, 100, 10, 1000);
    });
});
