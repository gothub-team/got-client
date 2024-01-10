import { MISSING_PARAM_ERROR } from '../errors.js';
import { createTestStore } from './shared.spec.js';

describe('store:pull', () => {
    describe('API', () => {
        test('should call API with the requested view in body', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const view = {
                [nodeId]: {
                    include: {
                        node: true,
                    },
                },
            };

            const {
                store: { pull },
                onError,
                api,
            } = createTestStore({}, {});
            /* #endregion */

            /* #region Execution and Validation */
            await pull(view);

            expect(onError).not.toBeCalled();
            expect(api.pull).toBeCalledWith(view);
            /* #endregion */
        });
        test('should call API with the requested view in body with as and reverse tags', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const edgeTypes = 'parent/child';
            const view = {
                [nodeId]: {
                    include: {
                        node: true,
                    },
                    edges: {
                        [edgeTypes]: {
                            as: 'children',
                            reverse: true,
                            include: {
                                node: true,
                                edges: true,
                                metadata: true,
                            },
                        },
                    },
                },
            };

            const {
                store: { pull },
                onError,
                api,
            } = createTestStore({}, {});
            /* #endregion */

            /* #region Execution and Validation */
            await pull(view);

            expect(onError).not.toBeCalled();
            expect(api.pull).toBeCalledWith(view);
            /* #endregion */
        });
    });

    describe('Return', () => {
        test('should return the graph that is returned by the API', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const view = {
                [nodeId]: {
                    include: {
                        node: true,
                    },
                },
            };

            const pullResult = {
                nodes: {
                    [nodeId]: { id: nodeId },
                },
            };

            const {
                store: { pull },
            } = createTestStore(
                {},
                {
                    pull: () => pullResult,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            const res = await pull(view);

            expect(res).toBe(pullResult);
            /* #endregion */
        });
    });

    describe('Dispatch', () => {
        describe('Nodes', () => {
            test('should dispatch node that was returned by the API', async () => {
                /* #region Test Bed Creation */
                const node1Id = 'node1';
                const node1 = { id: node1Id, value1: 'og1', value2: 'og2' };
                const view = {
                    [node1Id]: {
                        include: {
                            node: true,
                        },
                    },
                };
                const pullOutput = {
                    nodes: {
                        [node1Id]: node1,
                    },
                };

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {},
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);

                const expectedFromGraph = {
                    nodes: {
                        [node1Id]: node1,
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
            test('should dispatch undefined for node that was not returned by the API', async () => {
                /* #region Test Bed Creation */
                const node1Id = 'node1';
                const node1 = { id: node1Id, value1: 'og1', value2: 'og2' };
                const view = {
                    [node1Id]: {
                        include: {
                            node: true,
                        },
                    },
                };
                const pullOutput = {};

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {
                                nodes: {
                                    [node1Id]: node1,
                                },
                            },
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);

                const expectedFromGraph = {
                    nodes: {
                        [node1Id]: undefined,
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
        });

        describe('Edges', () => {
            test('should dispatch edge that was returned by the API', async () => {
                /* #region Test Bed Creation */
                const fromId = 'fromId';
                const toNode1Id = 'toId1';
                const fromType = 'fromType';
                const toType = 'toType';
                const edgeTypes = `${fromType}/${toType}`;
                const metadata = { value1: 'og1', value2: 'og2' };
                const view = {
                    [fromId]: {
                        edges: {
                            [edgeTypes]: {
                                include: {
                                    edges: true,
                                    metadata: true,
                                },
                            },
                        },
                    },
                };
                const pullOutput = {
                    edges: {
                        [fromType]: { [fromId]: { [toType]: { [toNode1Id]: metadata } } },
                    },
                };

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {},
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);
                const expectedFromGraph = {
                    edges: {
                        [fromType]: { [fromId]: { [toType]: { [toNode1Id]: metadata } } },
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
            test('should dispatch undefined for edge that wasnt returned by the API', async () => {
                /* #region Test Bed Creation */
                const fromId = 'fromId';
                const toNode1Id = 'toId1';
                const fromType = 'fromType';
                const toType = 'toType';
                const edgeTypes = `${fromType}/${toType}`;
                const metadata = { value1: 'og1', value2: 'og2' };
                const view = {
                    [fromId]: {
                        edges: {
                            [edgeTypes]: {
                                include: {
                                    edges: true,
                                    metadata: true,
                                },
                            },
                        },
                    },
                };
                const pullOutput = {};

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {
                                edges: {
                                    [fromType]: { [fromId]: { [toType]: { [toNode1Id]: metadata } } },
                                },
                            },
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);
                const expectedFromGraph = {
                    edges: {
                        [fromType]: { [fromId]: { [toType]: { [toNode1Id]: undefined } } },
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
        });

        describe('Reverse Edges', () => {
            test('should dispatch reverse edge that was returned by the API', async () => {
                /* #region Test Bed Creation */
                const fromId = 'fromId';
                const toNode1Id = 'toId1';
                const fromType = 'fromType';
                const toType = 'toType';
                const edgeTypes = `${fromType}/${toType}`;
                const metadata = { value1: 'og1', value2: 'og2' };
                const view = {
                    [toNode1Id]: {
                        edges: {
                            [edgeTypes]: {
                                reverse: true,
                                include: {
                                    edges: true,
                                    metadata: true,
                                },
                            },
                        },
                    },
                };
                const pullOutput = {
                    edges: {
                        [fromType]: { [fromId]: { [toType]: { [toNode1Id]: metadata } } },
                    },
                    index: {
                        reverseEdges: {
                            [toType]: {
                                [toNode1Id]: {
                                    [fromType]: {
                                        [fromId]: true,
                                    },
                                },
                            },
                        },
                    },
                };

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {},
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);
                const expectedFromGraph = {
                    edges: {
                        [fromType]: { [fromId]: { [toType]: { [toNode1Id]: metadata } } },
                    },
                    index: {
                        reverseEdges: {
                            [toType]: {
                                [toNode1Id]: {
                                    [fromType]: {
                                        [fromId]: true,
                                    },
                                },
                            },
                        },
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
            test('should dispatch undefined for reverse edge that wasnt returned by the API', async () => {
                /* #region Test Bed Creation */
                const fromId = 'fromId';
                const toNode1Id = 'toId1';
                const fromType = 'fromType';
                const toType = 'toType';
                const edgeTypes = `${fromType}/${toType}`;
                const metadata = { value1: 'og1', value2: 'og2' };
                const view = {
                    [toNode1Id]: {
                        edges: {
                            [edgeTypes]: {
                                reverse: true,
                                include: {
                                    edges: true,
                                    metadata: true,
                                },
                            },
                        },
                    },
                };
                const pullOutput = {};

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {
                                edges: {
                                    [fromType]: { [fromId]: { [toType]: { [toNode1Id]: metadata } } },
                                },
                                index: {
                                    reverseEdges: {
                                        [toType]: {
                                            [toNode1Id]: {
                                                [fromType]: {
                                                    [fromId]: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);
                const expectedFromGraph = {
                    edges: {
                        [fromType]: { [fromId]: { [toType]: { [toNode1Id]: undefined } } },
                    },
                    index: {
                        reverseEdges: {
                            [toType]: {
                                [toNode1Id]: {
                                    [fromType]: {
                                        [fromId]: undefined,
                                    },
                                },
                            },
                        },
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
        });

        describe('Rights', () => {
            test('should dispatch node rights object that was returned by the API', async () => {
                /* #region Test Bed Creation */
                const user = 'user@test.me';
                const node1Id = 'node1';
                const node1Rights = {
                    user: {
                        [user]: {
                            read: true,
                            write: true,
                            admin: true,
                        },
                    },
                };
                const view = {
                    [node1Id]: {
                        include: {
                            rights: true,
                        },
                    },
                };
                const pullOutput = {
                    rights: {
                        [node1Id]: node1Rights,
                    },
                };

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {},
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);

                const expectedFromGraph = {
                    rights: {
                        [node1Id]: node1Rights,
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
            test('should dispatch undefined for node rights object that was not returned by the API', async () => {
                /* #region Test Bed Creation */
                const user = 'user@test.me';
                const node1Id = 'node1';
                const node1Rights = {
                    user: {
                        [user]: {
                            read: true,
                            write: true,
                            admin: true,
                        },
                    },
                };
                const view = {
                    [node1Id]: {
                        include: {
                            rights: true,
                        },
                    },
                };
                const pullOutput = {};

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {
                                rights: {
                                    [node1Id]: node1Rights,
                                },
                            },
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);

                const expectedFromGraph = {
                    rights: {
                        [node1Id]: undefined,
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
        });

        describe('Files', () => {
            test('should dispatch node files object that was returned by the API', async () => {
                /* #region Test Bed Creation */
                const prop1 = 'file1';
                const node1Id = 'node1';
                const node1Files = {
                    [prop1]: {
                        url: 'someurl.com',
                    },
                };
                const view = {
                    [node1Id]: {
                        include: {
                            files: true,
                        },
                    },
                };
                const pullOutput = {
                    files: {
                        [node1Id]: node1Files,
                    },
                };

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {},
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);

                const expectedFromGraph = {
                    files: {
                        [node1Id]: node1Files,
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
            test('should dispatch undefined for node files object that was not returned by the API', async () => {
                /* #region Test Bed Creation */
                const prop1 = 'file1';
                const node1Id = 'node1';
                const node1Files = {
                    [prop1]: {
                        url: 'someurl.com',
                    },
                };
                const view = {
                    [node1Id]: {
                        include: {
                            files: true,
                        },
                    },
                };
                const pullOutput = {};

                const {
                    store: { pull },
                    dispatch,
                    onError,
                } = createTestStore(
                    {
                        main: {
                            graph: {
                                files: {
                                    [node1Id]: node1Files,
                                },
                            },
                        },
                    },
                    {
                        pull: () => pullOutput,
                    },
                );
                /* #endregion */

                /* #region Execution and Validation */
                await pull(view);

                const expectedFromGraph = {
                    files: {
                        [node1Id]: undefined,
                    },
                };
                expect(onError).not.toBeCalled();
                expect(dispatch).toBeCalledWith({
                    type: 'GOT/MERGE_OVERWRITE',
                    payload: {
                        fromGraph: expectedFromGraph,
                        toGraphName: 'main',
                    },
                });
                /* #endregion */
            });
        });
    });

    describe('Warn Handling', () => {
        test('should call `onWarn` when view is an empty object', async () => {
            /* #region Test Bed Creation */
            const view = {};

            const {
                store: { pull },
                onWarn,
                dispatch,
            } = createTestStore({}, {});
            /* #endregion */

            /* #region Execution and Validation */
            await pull(view);

            expect(onWarn).toHaveBeenCalled();
            expect(dispatch).not.toHaveBeenCalled();
            /* #endregion */
        });
        test('should return empty graph when view is an empty object', async () => {
            /* #region Test Bed Creation */
            const view = {};

            const {
                store: { pull },
            } = createTestStore({}, {});
            /* #endregion */

            /* #region Execution and Validation */
            const res = await pull(view);
            expect(res).toEqual({});
            /* #endregion */
        });
    });

    describe('Error Handling', () => {
        test('should call `onError` in case of API encounters an error', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const view = {
                [nodeId]: {
                    include: {
                        node: true,
                    },
                },
            };
            const apiError = new Error('SomeError');

            const {
                store: { pull },
                dispatch,
                onError,
            } = createTestStore(
                {},
                {
                    pull: () => {
                        throw apiError;
                    },
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await pull(view);

            expect(onError).toBeCalledWith(apiError);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', async () => {
            /* #region Test Bed Creation */
            const {
                store: { pull },
                dispatch,
                onError,
            } = createTestStore(
                {},
                {
                    pull: () => {},
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await pull(undefined);

            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'view',
                }),
            );
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });
});
