import * as uuid from 'uuid';
import { createTestStore } from './shared.js';
import { MISSING_PARAM_ERROR } from '../errors.js';

describe('store:Views', () => {
    describe('selectView', () => {
    // Basic
        test('should select the correct view tree based on the given view (without alias)', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const node2Id = 'node2';
            const node3Id = 'node3';
            const edgeTypes = 'from/to';
            const view = {
                [from1Id]: {
                    edges: {
                        [edgeTypes]: { },
                    },
                },
            };
            const graph = {
                nodes: {
                    [from1Id]: { id: from1Id, value: 'value' },
                    [node1Id]: { id: node1Id, value: 'value' },
                    [node2Id]: { id: node2Id, value: 'value' },
                    [node3Id]: { id: node3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                                [node2Id]: true,
                                [node3Id]: true,
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([from1Id]);
            // from1 edges
            expect(viewTree).toHaveProperty([from1Id, edgeTypes]);
            // from/to nodes
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id]);
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node2Id]);
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node3Id]);
        /* #endregion */
        });
        test('should select the correct view tree based on the given view (with alias)', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const node2Id = 'node2';
            const node3Id = 'node3';
            const edgeTypes = 'from/to';
            const aliasNode = 'todoList';
            const aliasEdge = 'todos';
            const view = {
                [from1Id]: {
                    as: aliasNode,
                    edges: {
                        [edgeTypes]: {
                            as: aliasEdge,
                        },
                    },
                },
            };
            const graph = {
                nodes: {
                    [from1Id]: { id: from1Id, value: 'value' },
                    [node1Id]: { id: node1Id, value: 'value' },
                    [node2Id]: { id: node2Id, value: 'value' },
                    [node3Id]: { id: node3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                                [node2Id]: true,
                                [node3Id]: true,
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // todoList
            expect(viewTree).toHaveProperty([aliasNode]);
            // todoList edges
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge]);
            // todos nodes
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, node1Id]);
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, node2Id]);
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, node3Id]);
        /* #endregion */
        });
        test('should always include the node IDs in the node views (without alias)', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const node2Id = 'node2';
            const node3Id = 'node3';
            const edgeTypes = 'from/to';
            const view = {
                [from1Id]: {
                    edges: {
                        [edgeTypes]: { },
                    },
                },
            };
            const graph = {
                nodes: {
                    [from1Id]: { id: from1Id, value: 'value' },
                    [node1Id]: { id: node1Id, value: 'value' },
                    [node2Id]: { id: node2Id, value: 'value' },
                    [node3Id]: { id: node3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                                [node2Id]: true,
                                [node3Id]: true,
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([from1Id, 'nodeId'], from1Id);
            // from/to nodes
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id, 'nodeId'], node1Id);
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node2Id, 'nodeId'], node2Id);
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node3Id, 'nodeId'], node3Id);
        /* #endregion */
        });
        // reverse edges
        test('should select the correct view tree with a reversed edge based on the given view (without alias)', async () => {
            /* #region Test Bed Creation */
            const toId = 'toId1';
            const from1Id = 'fromId1';
            const from2Id = 'fromId2';
            const from3Id = 'fromId3';
            const edgeTypes = 'from/to';
            const view = {
                [toId]: {
                    edges: {
                        [edgeTypes]: {
                            reverse: true,
                        },
                    },
                },
            };
            const graph = {
                nodes: {
                    [toId]: { id: toId, value: 'value' },
                    [from1Id]: { id: from1Id, value: 'value' },
                    [from2Id]: { id: from2Id, value: 'value' },
                    [from3Id]: { id: from3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: { to: { [toId]: true } },
                        [from2Id]: { to: { [toId]: true } },
                        [from3Id]: { to: { [toId]: true } },
                    },
                },
                index: {
                    reverseEdges: {
                        to: {
                            [toId]: {
                                from: {
                                    [from1Id]: true,
                                    [from2Id]: true,
                                    [from3Id]: true,
                                },
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
                /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([toId]);
            // from1 edges
            expect(viewTree).toHaveProperty([toId, edgeTypes]);
            // from/to nodes
            expect(viewTree).toHaveProperty([toId, edgeTypes, from1Id]);
            expect(viewTree).toHaveProperty([toId, edgeTypes, from2Id]);
            expect(viewTree).toHaveProperty([toId, edgeTypes, from3Id]);
            /* #endregion */
        });
        test('should select the correct view tree with a reversed edge based on the given view (with alias)', async () => {
            /* #region Test Bed Creation */
            const toId = 'toId1';
            const from1Id = 'fromId1';
            const from2Id = 'fromId2';
            const from3Id = 'fromId3';
            const edgeTypes = 'from/to';
            const aliasNode = 'todo';
            const aliasEdge = 'todoLists';
            const view = {
                [toId]: {
                    as: aliasNode,
                    edges: {
                        [edgeTypes]: {
                            as: aliasEdge,
                            reverse: true,
                        },
                    },
                },
            };
            const graph = {
                nodes: {
                    [toId]: { id: toId, value: 'value' },
                    [from1Id]: { id: from1Id, value: 'value' },
                    [from2Id]: { id: from2Id, value: 'value' },
                    [from3Id]: { id: from3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: { to: { [toId]: true } },
                        [from2Id]: { to: { [toId]: true } },
                        [from3Id]: { to: { [toId]: true } },
                    },
                },
                index: {
                    reverseEdges: {
                        to: {
                            [toId]: {
                                from: {
                                    [from1Id]: true,
                                    [from2Id]: true,
                                    [from3Id]: true,
                                },
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
                /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([aliasNode]);
            // from1 edges
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge]);
            // from/to nodes
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from1Id]);
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from2Id]);
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from3Id]);
            /* #endregion */
        });
        // should stack multiple graphs correctly
        test('stack multiple graphs correctly', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const node2Id = 'node2';
            const node3Id = 'node3';
            const edgeTypes = 'from/to';
            const graph1Name = 'graph1';
            const graph2Name = 'graph2';
            const view = {
                [from1Id]: {
                    edges: {
                        [edgeTypes]: {
                            include: {
                                node: true,
                            },
                        },
                    },
                },
            };
            const mainGraph = {
                nodes: {
                    [from1Id]: { id: from1Id, value: 'value' },
                    [node1Id]: { id: node1Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                            },
                        },
                    },
                },
            };
            const graph1 = {
                nodes: {
                    [node2Id]: { id: node2Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node2Id]: true,
                            },
                        },
                    },
                },
            };
            const graph2 = {
                nodes: {
                    [node1Id]: { id: node1Id, value: 'newValue' },
                    [node3Id]: { id: node3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node3Id]: true,
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph: mainGraph },
                [graph1Name]: { graph: graph1 },
                [graph2Name]: { graph: graph2 },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main', graph1Name, graph2Name)(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([from1Id]);
            // from1 edges
            expect(viewTree).toHaveProperty([from1Id, edgeTypes]);
            // from/to nodes
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id]);
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id, 'node', 'value'], 'newValue');
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node2Id]);
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node3Id]);
        /* #endregion */
        });
        // Includes
        test('should include nodes for nodes and edges', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const from1 = { id: from1Id, value: 'value' };
            const node1 = { id: node1Id, value: 'value' };
            const edgeTypes = 'from/to';
            const view = {
                [from1Id]: {
                    include: { node: true },
                    edges: {
                        [edgeTypes]: {
                            include: { node: true },
                        },
                    },
                },
            };
            const graph = {
                nodes: {
                    [from1Id]: from1,
                    [node1Id]: node1,
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([from1Id, 'node'], from1);
            // from/to nodes
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id, 'node'], node1);
        /* #endregion */
        });
        test('should include metadata for nodes and edges', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const node2Id = 'node2';
            const node1Metadata = { order: 1 };
            const node2Metadata = true;
            const edgeTypes = 'from/to';
            const view = {
                [from1Id]: {
                    edges: {
                        [edgeTypes]: {
                            include: { metadata: true },
                        },
                    },
                },
            };
            const graph = {
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: node1Metadata,
                                [node2Id]: node2Metadata,
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from/to nodes
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id, 'metadata'], node1Metadata);
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node2Id, 'metadata'], node2Metadata);
        /* #endregion */
        });
        test('should include rights for nodes and edges', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const email = 'some@mail.me';
            const from1Rights = { user: { [email]: { read: true, write: true } } };
            const node1Rights = { user: { [email]: { read: true, write: false } } };
            const edgeTypes = 'from/to';
            const view = {
                [from1Id]: {
                    include: { rights: true },
                    edges: {
                        [edgeTypes]: {
                            include: { rights: true },
                        },
                    },
                },
            };
            const graph = {
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                            },
                        },
                    },
                },
                rights: {
                    [from1Id]: from1Rights,
                    [node1Id]: node1Rights,
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([from1Id, 'rights'], from1Rights);
            // from/to nodes
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id, 'rights'], node1Rights);
        /* #endregion */
        });
        test('should include files for nodes and edges', async () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const from1Files = { someFile: { url: 'some.url/file1.txt' } };
            const node1Files = { someFile: { url: 'some.url/file2.txt' } };
            const edgeTypes = 'from/to';
            const view = {
                [from1Id]: {
                    include: { files: true },
                    edges: {
                        [edgeTypes]: {
                            include: { files: true },
                        },
                    },
                },
            };
            const graph = {
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                            },
                        },
                    },
                },
                files: {
                    [from1Id]: from1Files,
                    [node1Id]: node1Files,
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([from1Id, 'files'], from1Files);
            // from/to nodes
            expect(viewTree).toHaveProperty([from1Id, edgeTypes, node1Id, 'files'], node1Files);
        /* #endregion */
        });
        test('shouldinclude all props for reverse edges', async () => {
            /* #region Test Bed Creation */
            const toId = 'toId1';
            const from1Id = 'fromId1';
            const from2Id = 'fromId2';
            const from3Id = 'fromId3';
            const edgeTypes = 'from/to';
            const aliasNode = 'todo';
            const aliasEdge = 'todoLists';
            const edgeFrom1ToMetadata = { value: 1 };
            const edgeFrom2ToMetadata = { value: 2 };
            const edgeFrom3ToMetadata = { value: 3 };
            const view = {
                [toId]: {
                    as: aliasNode,
                    include: {
                        node: true,
                    },
                    edges: {
                        [edgeTypes]: {
                            as: aliasEdge,
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
            const graph = {
                nodes: {
                    [toId]: { id: toId, value: 'value' },
                    [from1Id]: { id: from1Id, value: 'value' },
                    [from2Id]: { id: from2Id, value: 'value' },
                    [from3Id]: { id: from3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: { to: { [toId]: edgeFrom1ToMetadata } },
                        [from2Id]: { to: { [toId]: edgeFrom2ToMetadata } },
                        [from3Id]: { to: { [toId]: edgeFrom3ToMetadata } },
                    },
                },
                index: {
                    reverseEdges: {
                        to: {
                            [toId]: {
                                from: {
                                    [from1Id]: true,
                                    [from2Id]: true,
                                    [from3Id]: true,
                                },
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
                /* #endregion */

            /* #region Execution and Validation */
            const viewTree = select(selectView('main')(view));

            expect(onError).not.toBeCalled();
            // from1
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from1Id, 'nodeId'], from1Id);
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from1Id, 'node'], { id: from1Id, value: 'value' });
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from1Id, 'metadata'], edgeFrom1ToMetadata);
            // from2
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from2Id, 'nodeId'], from2Id);
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from2Id, 'node'], { id: from2Id, value: 'value' });
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from2Id, 'metadata'], edgeFrom2ToMetadata);
            // from3
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from3Id, 'nodeId'], from3Id);
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from3Id, 'node'], { id: from3Id, value: 'value' });
            expect(viewTree).toHaveProperty([aliasNode, aliasEdge, from3Id, 'metadata'], edgeFrom3ToMetadata);
            /* #endregion */
        });
        // Errors
        test('should call `onError` in case of invalid input', async () => {
        /* #region Test Bed Creation */
            const view = {};

            const {
                store: { selectView },
                select,
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = select(selectView()(view));
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'stack',
            }));
            expect(output1).toBeUndefined();

            const output2 = select(selectView('main')());
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'view',
            }));
            expect(output2).toBeUndefined();

            expect(dispatch).not.toBeCalled();
        /* #endregion */
        });
    });

    describe('performance', () => {
        test('should select 100 parent and 1000 child objects in under 10ms', () => {
            const runTimes = 10;
            const generateRandomString = (length = 5) => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);

            let totalTime = 0;
            for (let counter = 0; counter < runTimes; counter += 1) {
                const {
                    store: {
                        selectView,
                        add,
                    },
                    select,
                } = createTestStore({ });

                // generate debug data
                for (let i = 0; i < 100; i += 1) {
                    const locationId = uuid.v4();
                    const location = {
                        id: locationId, createdDate: new Date().toISOString(), path: `${generateRandomString()}/${generateRandomString()}`, tags: [generateRandomString(), generateRandomString()],
                    };
                    add('main')('root/location')('root')(location);
                    for (let j = 0; j < 10; j += 1) {
                        const objectId = uuid.v4();
                        const object = {
                            id: objectId, createdDate: new Date().toISOString(), isAtLocation: true, name: generateRandomString(10), oldLocation: false,
                        };
                        add('main')('location/object')(locationId)(object);
                    }
                }

                const view = {
                    'root': {
                        as: 'root',
                        edges: {
                            'root/location': {
                                as: 'locations',
                                include: {
                                    node: true,
                                    edges: true,
                                },
                                edges: {
                                    'location/object': {
                                        as: 'objects',
                                        include: {
                                            node: true,
                                            edges: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                };

                const start = performance.now();
                select(selectView('main', 'temp')(view));
                const end = performance.now();

                totalTime += end - start;
            }

            console.log('ran in ', totalTime / runTimes, 'ms');

            expect(totalTime / runTimes).toBeLessThanOrEqual(10);
        });
    });

    describe('getView', () => {
        test('should return the same value as select(selectView) (should select the correct view tree based on the given view (without alias))', () => {
        /* #region Test Bed Creation */
            const from1Id = 'from1';
            const node1Id = 'node1';
            const node2Id = 'node2';
            const node3Id = 'node3';
            const edgeTypes = 'from/to';
            const view = {
                [from1Id]: {
                    edges: {
                        [edgeTypes]: { },
                    },
                },
            };
            const graph = {
                nodes: {
                    [from1Id]: { id: from1Id, value: 'value' },
                    [node1Id]: { id: node1Id, value: 'value' },
                    [node2Id]: { id: node2Id, value: 'value' },
                    [node3Id]: { id: node3Id, value: 'value' },
                },
                edges: {
                    from: {
                        [from1Id]: {
                            to: {
                                [node1Id]: true,
                                [node2Id]: true,
                                [node3Id]: true,
                            },
                        },
                    },
                },
            };

            const {
                store: {
                    selectView,
                    getView,
                },
                select,
                onError,
            } = createTestStore({
                main: { graph },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const selectorOutput = select(selectView('main')(view));
            const getterOutput = getView('main')(view);

            expect(onError).not.toBeCalled();
            // expect(getterOutput).toEqual(selectorOutput); //does not work because of functions

            /* #region tests for selector output */
            // from1
            expect(selectorOutput).toHaveProperty([from1Id]);
            // from1 edges
            expect(selectorOutput).toHaveProperty([from1Id, edgeTypes]);
            // from/to nodes
            expect(selectorOutput).toHaveProperty([from1Id, edgeTypes, node1Id]);
            expect(selectorOutput).toHaveProperty([from1Id, edgeTypes, node2Id]);
            expect(selectorOutput).toHaveProperty([from1Id, edgeTypes, node3Id]);
            /* #endregion */

            /* #region tests for getter output */
            // from1
            expect(getterOutput).toHaveProperty([from1Id]);
            // from1 edges
            expect(getterOutput).toHaveProperty([from1Id, edgeTypes]);
            // from/to nodes
            expect(getterOutput).toHaveProperty([from1Id, edgeTypes, node1Id]);
            expect(getterOutput).toHaveProperty([from1Id, edgeTypes, node2Id]);
            expect(getterOutput).toHaveProperty([from1Id, edgeTypes, node3Id]);
            /* #endregion */

        /* #endregion */
        });
    });
});
