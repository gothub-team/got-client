import { createTestStore } from './shared.spec.js';
import { INVALID_PARAM_ERROR, MISSING_PARAM_ERROR } from '../errors.js';

describe('store:Edges', () => {
    describe('selectEdge', () => {
        test('should get hashmaps of `toId`s associated with metadata = true', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId1]: node1metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: node1metadata,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should get hashmaps of `toId`s associated with metadata = obj', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata = { order: 0 };
            const graphName1 = 'graph1';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: node1metadata,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should get hashmaps of `toId`s without edges where metadata are false', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const graphName1 = 'graph1';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: false } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {};

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should get hashmaps of `toId`s without edges where nodes are false', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const node1metadata = true;
            const node2metadata = { order: 1 };
            const graphName1 = 'graph1';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: false,
                            [nodeId2]: { id: nodeId2 },
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId1]: node1metadata,
                                        [nodeId2]: node2metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId2]: node2metadata,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (merge edges)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const node1 = { id: nodeId1 };
            const node2 = { id: nodeId2 };
            const node1metadata = true;
            const node2metadata = true;
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                            [nodeId2]: node2,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId2]: node2metadata } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: node1metadata,
                [nodeId2]: node2metadata,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (merge metadata [object, object])', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata1 = { order: 0 };
            const node1metadata2 = { folder: 'folder' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata2 } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: { order: 0, folder: 'folder' },
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (merge metadata [false, object])', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata1 = false;
            const node1metadata2 = { folder: 'folder' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata2 } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: node1metadata2,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (merge metadata [true, object])', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata1 = true;
            const node1metadata2 = { folder: 'folder' };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata2 } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: node1metadata2,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (merge metadata [object, false])', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata1 = { folder: 'folder' };
            const node1metadata2 = false;
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata2 } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {};

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (merge metadata [object, true])', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata1 = { folder: 'folder' };
            const node1metadata2 = true;
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata2 } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: node1metadata1,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (false overrides from values lower stacked graphs)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata1 = { order: 0 };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: false } } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {};

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (should override not edge with not existing edge from higher stacked graphs)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata1 = { order: 0 };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: { [fromId]: { [toType]: { [nodeId1]: node1metadata1 } } },
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        edges: {
                            [fromType]: { [fromId]: { [toType]: {} } },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {
                [nodeId1]: node1metadata1,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should stack edge correctly (should return empty object if edge does not exist in any stacked views)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectEdge(graphName1, graphName2)(`${fromType}/${toType}`)(fromId));

            const expectedOutput = {};

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { selectEdge },
                select,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId1]: node1metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = select(selectEdge()(`${fromType}/${toType}`)(fromId));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toEqual({});

            const output2 = select(selectEdge(graphName1)(undefined)(fromId));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );
            expect(output2).toEqual({});

            const output3 = select(selectEdge(graphName1)(`${fromType}`)(fromId));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );
            expect(output3).toEqual({});

            const output4 = select(selectEdge(graphName1)(`${fromType}/${toType}`)(undefined));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );
            expect(output4).toEqual({});

            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('getEdge', () => {
        test('should return the same value as select (selectEdge) (should get hashmaps of `toId`s associated with metadata = true)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { selectEdge, getEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId1]: node1metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const selectorOutput = select(selectEdge(graphName1)(`${fromType}/${toType}`)(fromId));
            const getterOutput = getEdge(graphName1)(`${fromType}/${toType}`)(fromId);

            expect(onError).not.toBeCalled();
            expect(getterOutput).toEqual(selectorOutput);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId1 = 'node1';
            const node1 = { id: nodeId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { getEdge },
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId1]: node1metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = getEdge()(`${fromType}/${toType}`)(fromId);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toEqual({});

            const output2 = getEdge(graphName1)(undefined)(fromId);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );
            expect(output2).toEqual({});

            const output3 = getEdge(graphName1)(`${fromType}`)(fromId);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );
            expect(output3).toEqual({});

            const output4 = getEdge(graphName1)(`${fromType}/${toType}`)(undefined);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );
            expect(output4).toEqual({});

            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('selectReverseEdge', () => {
        test('should select hashmaps of `fromIds`s indexed in reverse edges which are associated with metadata = true', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const toNode1 = { id: toId1 };
            const fromNode1 = { id: fromId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { selectReverseEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: toNode1,
                            [fromId1]: fromNode1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: {
                                    [toType]: {
                                        [toId1]: node1metadata,
                                    },
                                },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
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
            const output = select(selectReverseEdge(graphName1)(`${fromType}/${toType}`)(toId1));

            const expectedOutput = {
                [fromId1]: node1metadata,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should select hashmaps of `fromIds`s indexed in reverse edges which are associated with metadata = obj', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const toNode1 = { id: toId1 };
            const fromNode1 = { id: fromId1 };
            const node1metadata = { value: 1 };
            const graphName1 = 'graph1';

            const {
                store: { selectReverseEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: toNode1,
                            [fromId1]: fromNode1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: {
                                    [toType]: {
                                        [toId1]: node1metadata,
                                    },
                                },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
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
            const output = select(selectReverseEdge(graphName1)(`${fromType}/${toType}`)(toId1));

            const expectedOutput = {
                [fromId1]: node1metadata,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should select hashmaps of `fromIds`s without edges where reverse index is falsy', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId1';
            const fromId2 = 'fromId2';
            const fromId3 = 'fromId3';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const toNode1 = { id: toId1 };
            const fromNode1 = { id: fromId1 };
            const fromNode2 = { id: fromId2 };
            const fromNode3 = { id: fromId3 };
            const graphName1 = 'graph1';

            const {
                store: { selectReverseEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: toNode1,
                            [fromId1]: fromNode1,
                            [fromId2]: fromNode2,
                            [fromId3]: fromNode3,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: { [toType]: { [toId1]: true } },
                                [fromId2]: { [toType]: { [toId1]: true } },
                                [fromId3]: { [toType]: { [toId1]: true } },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
                                            [fromId1]: true,
                                            [fromId2]: false,
                                            [fromId3]: undefined,
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
            const output = select(selectReverseEdge(graphName1)(`${fromType}/${toType}`)(toId1));

            const expectedOutput = {
                [fromId1]: true,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should select hashmaps of `fromIds`s without edges where metadata is falsy', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId1';
            const fromId2 = 'fromId2';
            const fromId3 = 'fromId3';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const toNode1 = { id: toId1 };
            const fromNode1 = { id: fromId1 };
            const fromNode2 = { id: fromId2 };
            const fromNode3 = { id: fromId3 };
            const graphName1 = 'graph1';

            const {
                store: { selectReverseEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: toNode1,
                            [fromId1]: fromNode1,
                            [fromId2]: fromNode2,
                            [fromId3]: fromNode3,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: { [toType]: { [toId1]: true } },
                                [fromId2]: { [toType]: { [toId1]: false } },
                                [fromId3]: { [toType]: { [toId1]: undefined } },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
                                            [fromId1]: true,
                                            [fromId2]: true,
                                            [fromId3]: true,
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
            const output = select(selectReverseEdge(graphName1)(`${fromType}/${toType}`)(toId1));

            const expectedOutput = {
                [fromId1]: true,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should select hashmaps of `fromIds`s without edges where nodes are falsy', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId1';
            const fromId2 = 'fromId2';
            const fromId3 = 'fromId3';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const toNode1 = { id: toId1 };
            const fromNode1 = { id: fromId1 };
            const graphName1 = 'graph1';

            const {
                store: { selectReverseEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: toNode1,
                            [fromId1]: fromNode1,
                            [fromId2]: false,
                            [fromId3]: undefined,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: { [toType]: { [toId1]: true } },
                                [fromId2]: { [toType]: { [toId1]: true } },
                                [fromId3]: { [toType]: { [toId1]: true } },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
                                            [fromId1]: true,
                                            [fromId2]: true,
                                            [fromId3]: true,
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
            const output = select(selectReverseEdge(graphName1)(`${fromType}/${toType}`)(toId1));

            const expectedOutput = {
                [fromId1]: true,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should select hashmaps of `fromIds`s with a correctly stacked reverse index', () => {
            /**
             * Should keep edges from 1, overwrite undefined for 2, false for 3 and get overwritten with false by 4
             */
            /* #region Test Bed Creation */
            const fromId1 = 'fromId1';
            const fromId2 = 'fromId2';
            const fromId3 = 'fromId3';
            const fromId4 = 'fromId4';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const toNode1 = { id: toId1 };
            const fromNode1 = { id: fromId1 };
            const fromNode2 = { id: fromId2 };
            const fromNode3 = { id: fromId3 };
            const fromNode4 = { id: fromId4 };
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';

            const {
                store: { selectReverseEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: toNode1,
                            [fromId1]: fromNode1,
                            [fromId2]: fromNode2,
                            [fromId3]: fromNode3,
                            [fromId4]: fromNode4,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: { [toType]: { [toId1]: true } },
                                [fromId2]: { [toType]: { [toId1]: true } },
                                [fromId3]: { [toType]: { [toId1]: true } },
                                [fromId4]: { [toType]: { [toId1]: true } },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
                                            [fromId1]: true,
                                            [fromId2]: false,
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
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
                                            [fromId2]: true,
                                            [fromId3]: true,
                                            [fromId4]: false,
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
            const output = select(selectReverseEdge(graphName1, graphName2)(`${fromType}/${toType}`)(toId1));

            const expectedOutput = {
                [fromId1]: true,
                [fromId2]: true,
                [fromId3]: true,
            };

            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedOutput);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const from1 = { id: fromId };
            const to1 = { id: toId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { selectReverseEdge },
                select,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: from1,
                            [toId1]: to1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [toId1]: node1metadata,
                                    },
                                },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
                                            [fromId]: true,
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
            const output1 = select(selectReverseEdge()(`${fromType}/${toType}`)(toId1));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toEqual({});

            const output2 = select(selectReverseEdge(graphName1)(undefined)(toId1));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );
            expect(output2).toEqual({});

            const output3 = select(selectReverseEdge(graphName1)(`${fromType}`)(toId1));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );
            expect(output3).toEqual({});

            const output4 = select(selectReverseEdge(graphName1)(`${fromType}/${toType}`)(undefined));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toId',
                }),
            );
            expect(output4).toEqual({});

            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('getReverseEdge', () => {
        test('should return the same value as select (should select hashmaps of `fromIds`s indexed in reverse edges which are associated with metadata = true)', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const toNode1 = { id: toId1 };
            const fromNode1 = { id: fromId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { selectReverseEdge, getReverseEdge },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: toNode1,
                            [fromId1]: fromNode1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: {
                                    [toType]: {
                                        [toId1]: node1metadata,
                                    },
                                },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [toId1]: {
                                        [fromType]: {
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
            const selectOutput = select(selectReverseEdge(graphName1)(`${fromType}/${toType}`)(toId1));
            const getOutput = getReverseEdge(graphName1)(`${fromType}/${toType}`)(toId1);

            expect(onError).not.toBeCalled();
            expect(getOutput).toEqual(selectOutput);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const from1 = { id: fromId };
            const to1 = { id: toId1 };
            const node1metadata = true;
            const graphName1 = 'graph1';

            const {
                store: { getReverseEdge },
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: from1,
                            [toId1]: to1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [toId1]: node1metadata,
                                    },
                                },
                            },
                        },
                        reverseEdges: {
                            [toType]: {
                                [toId1]: {
                                    [fromType]: {
                                        [fromId]: true,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = getReverseEdge()(`${fromType}/${toType}`)(toId1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toEqual({});

            const output2 = getReverseEdge(graphName1)(undefined)(toId1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );
            expect(output2).toEqual({});

            const output3 = getReverseEdge(graphName1)(`${fromType}`)(toId1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );
            expect(output3).toEqual({});

            const output4 = getReverseEdge(graphName1)(`${fromType}/${toType}`)(undefined);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toId',
                }),
            );
            expect(output4).toEqual({});

            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('add', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const fromType = 'fromType';
            const toType = 'toType';
            const edgeTypes = `${fromType}/${toType}`;
            const fromId = 'fromId';
            const nodeId = 'node1';
            const toNode = { id: nodeId };
            const metadata = { order: 0 };
            const graphName = 'graph1';

            const {
                store: { add },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            add(graphName)(edgeTypes)(fromId)(toNode, metadata);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/ADD',
                payload: {
                    graphName,
                    fromType,
                    toType,
                    fromId,
                    toNode,
                    metadata,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should create edge and node in the specified graph without specified metadata (set node, set metadata = true)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const graphName1 = 'graph1';

            const {
                store: { add },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            add(graphName1)(`${fromType}/${toType}`)(fromId)(node1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            expect(getState()).toHaveProperty([graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId], true);
            /* #endregion */
        });
        test('should create edge and node in the specified graph with specified metadata (set node, set metadata)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata = { order: 0 };
            const graphName1 = 'graph1';

            const {
                store: { add },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            add(graphName1)(`${fromType}/${toType}`)(fromId)(node1, node1metadata);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId],
                node1metadata,
            );
            /* #endregion */
        });
        test('should patch node if node already exists', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId, value1: 'og1', value2: 'og2' };
            const node2 = { id: nodeId, value2: 'edit2', value3: 'edit3' };
            const graphName1 = 'graph1';

            const {
                store: { add },
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
            add(graphName1)(`${fromType}/${toType}`)(fromId)(node2);

            const expectedNode = {
                id: nodeId,
                value1: 'og1',
                value2: 'edit2',
                value3: 'edit3',
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], expectedNode);
            expect(getState()).toHaveProperty([graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId], true);
            /* #endregion */
        });
        test('should patch metadata if edge already exists', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = { value1: 'og1', value2: 'og2' };
            const node1metadata2 = { value2: 'edit2', value3: 'edit3' };
            const graphName1 = 'graph1';

            const {
                store: { add },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            add(graphName1)(`${fromType}/${toType}`)(fromId)(node1, node1metadata2);

            const expectedMetadata = {
                value1: 'og1',
                value2: 'edit2',
                value3: 'edit3',
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId],
                expectedMetadata,
            );
            /* #endregion */
        });
        test('should index edge as reverse as well', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const edgeFromToMetadata = { value: 1 };
            const graphName1 = 'graph1';

            const {
                store: { add },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            add(graphName1)(`${fromType}/${toType}`)(fromId)(node1, edgeFromToMetadata);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'index', 'reverseEdges', toType, nodeId, fromType, fromId],
                true,
            );
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata = { order: 0 };
            const graphName1 = 'graph1';

            const {
                initialState,
                store: { add },
                getState,
                dispatch,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            add(undefined)(`${fromType}/${toType}`)(fromId)(node1, node1metadata);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'graphName',
                }),
            );

            add(graphName1)(undefined)(fromId)(node1, node1metadata);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );

            add(graphName1)(`${fromType}`)(fromId)(node1, node1metadata);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );

            add(graphName1)(`${fromType}/${toType}`)(undefined)(node1, node1metadata);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );

            add(graphName1)(`${fromType}/${toType}`)(fromId)({ prop: 'someProp' }, node1metadata);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode.id',
                }),
            );

            add(graphName1)(`${fromType}/${toType}`)(fromId)(undefined, node1metadata);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode',
                }),
            );

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('remove', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const fromType = 'fromType';
            const toType = 'toType';
            const edgeTypes = `${fromType}/${toType}`;
            const fromId = 'fromId';
            const nodeId = 'node1';
            const toNode = { id: nodeId };
            const graphName = 'graph1';

            const {
                store: { remove },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            remove(graphName)(edgeTypes)(fromId)(toNode);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/REMOVE',
                payload: {
                    graphName,
                    fromType,
                    toType,
                    fromId,
                    toNode,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should remove edge and node in the specified graph (set node, metadata to false)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = true;
            const graphName1 = 'graph1';

            const {
                store: { remove },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            remove(graphName1)(`${fromType}/${toType}`)(fromId)(node1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], false);
            expect(getState()).toHaveProperty([graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId], false);
            /* #endregion */
        });
        test('should remove reverse index for edge as well', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = true;
            const graphName1 = 'graph1';

            const {
                store: { remove },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [nodeId]: {
                                        [fromType]: {
                                            [fromId]: true,
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
            remove(graphName1)(`${fromType}/${toType}`)(fromId)(node1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'index', 'reverseEdges', toType, nodeId, fromType, fromId],
                false,
            );
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = true;
            const graphName1 = 'graph1';

            const {
                initialState,
                store: { remove },
                getState,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            remove(undefined)(`${fromType}/${toType}`)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'graphName',
                }),
            );

            remove(graphName1)(undefined)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );

            remove(graphName1)(`${fromType}`)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );

            remove(graphName1)(`${fromType}/${toType}`)(undefined)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );

            remove(graphName1)(`${fromType}/${toType}`)(fromId)({ prop: 'someProp' });
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode.id',
                }),
            );

            remove(graphName1)(`${fromType}/${toType}`)(fromId)(undefined);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode',
                }),
            );

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('assoc', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const fromType = 'fromType';
            const toType = 'toType';
            const edgeTypes = `${fromType}/${toType}`;
            const fromId = 'fromId';
            const nodeId = 'node1';
            const toNode = { id: nodeId };
            const graphName = 'graph1';
            const metadata = { order: 0 };

            const {
                store: { assoc },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            assoc(graphName)(edgeTypes)(fromId)(toNode, metadata);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/ASSOC',
                payload: {
                    graphName,
                    fromType,
                    toType,
                    fromId,
                    toNode,
                    metadata,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should only set edge with edgeTypes from fromId to toNode without metadata', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const graphName1 = 'graph1';

            const {
                store: { assoc },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            assoc(graphName1)(`${fromType}/${toType}`)(fromId)(node1);

            expect(onError).not.toBeCalled();
            expect(getState()).not.toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            expect(getState()).toHaveProperty([graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId], true);
            /* #endregion */
        });
        test('should only set edge with edgeTypes from fromId to toNode with metadata', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = { order: 0 };
            const graphName1 = 'graph1';

            const {
                store: { assoc },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            assoc(graphName1)(`${fromType}/${toType}`)(fromId)(node1, node1metadata1);

            expect(onError).not.toBeCalled();
            expect(getState()).not.toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId],
                node1metadata1,
            );
            /* #endregion */
        });
        test('should patch metadata if edge already exists', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = { value1: 'og1', value2: 'og2' };
            const node1metadata2 = { value2: 'edit2', value3: 'edit3' };
            const graphName1 = 'graph1';

            const {
                store: { assoc },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            assoc(graphName1)(`${fromType}/${toType}`)(fromId)(node1, node1metadata2);

            const expectedMetadata = {
                value1: 'og1',
                value2: 'edit2',
                value3: 'edit3',
            };
            expect(onError).not.toBeCalled();
            expect(getState()).not.toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId],
                expectedMetadata,
            );
            /* #endregion */
        });
        test('should index edge as reverse as well', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const edgeFromToMetadata = { value: 1 };
            const graphName1 = 'graph1';

            const {
                store: { assoc },
                getState,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            assoc(graphName1)(`${fromType}/${toType}`)(fromId)(node1, edgeFromToMetadata);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'index', 'reverseEdges', toType, nodeId, fromType, fromId],
                true,
            );
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const graphName1 = 'graph1';

            const {
                initialState,
                store: { assoc },
                getState,
                dispatch,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            assoc(undefined)(`${fromType}/${toType}`)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'graphName',
                }),
            );

            assoc(graphName1)(undefined)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );

            assoc(graphName1)(`${fromType}`)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );

            assoc(graphName1)(`${fromType}/${toType}`)(undefined)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );

            assoc(graphName1)(`${fromType}/${toType}`)(fromId)({ prop: 'someProp' });
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode.id',
                }),
            );

            assoc(graphName1)(`${fromType}/${toType}`)(fromId)(undefined);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode',
                }),
            );

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('dissoc', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const fromType = 'fromType';
            const toType = 'toType';
            const edgeTypes = `${fromType}/${toType}`;
            const fromId = 'fromId';
            const nodeId = 'node1';
            const toNode = { id: nodeId };
            const graphName = 'graph1';

            const {
                store: { dissoc },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            dissoc(graphName)(edgeTypes)(fromId)(toNode);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/DISSOC',
                payload: {
                    graphName,
                    fromType,
                    toType,
                    fromId,
                    toNode,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should only remove edge in the specified graph (set metadata to false)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = true;
            const graphName1 = 'graph1';

            const {
                store: { dissoc },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            dissoc(graphName1)(`${fromType}/${toType}`)(fromId)(node1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'nodes', nodeId], node1);
            expect(getState()).toHaveProperty([graphName1, 'graph', 'edges', fromType, fromId, toType, nodeId], false);
            /* #endregion */
        });
        test('should remove reverse index for edge as well', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = true;
            const graphName1 = 'graph1';

            const {
                store: { dissoc },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [nodeId]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                        index: {
                            reverseEdges: {
                                [toType]: {
                                    [nodeId]: {
                                        [fromType]: {
                                            [fromId]: true,
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
            dissoc(graphName1)(`${fromType}/${toType}`)(fromId)(node1);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(
                [graphName1, 'graph', 'index', 'reverseEdges', toType, nodeId, fromType, fromId],
                false,
            );
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromNode = { id: fromId };
            const fromType = 'fromType';
            const toType = 'toType';
            const nodeId = 'node1';
            const node1 = { id: nodeId };
            const node1metadata1 = true;
            const graphName1 = 'graph1';

            const {
                initialState,
                store: { dissoc },
                getState,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [fromId]: fromNode,
                            [nodeId]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [nodeId]: node1metadata1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            dissoc(undefined)(`${fromType}/${toType}`)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'graphName',
                }),
            );

            dissoc(graphName1)(undefined)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );

            dissoc(graphName1)(`${fromType}`)(fromId)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );

            dissoc(graphName1)(`${fromType}/${toType}`)(undefined)(node1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );

            dissoc(graphName1)(`${fromType}/${toType}`)(fromId)({ prop: 'someProp' });
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode.id',
                }),
            );

            dissoc(graphName1)(`${fromType}/${toType}`)(fromId)(undefined);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toNode',
                }),
            );

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });
});
