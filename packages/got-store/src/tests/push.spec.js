import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { Blob } from 'buffer';
import { toPromise } from '@gothub-team/got-util';
import { MISSING_PARAM_ERROR } from '../errors.js';
import { createTestStore } from './shared.spec.js';
import { GOT_ACTION_UPLOAD_COMPLETE, GOT_ACTION_UPLOAD_PROGRESS } from '../reducer.js';

describe('store:push', () => {
    describe('Basic', () => {
        test('should call `dispatch` with correct parameters', async () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const nodeId3 = 'node3';
            const user = 'user';
            const graphName = 'graph';
            const fromType1 = 'fromType1';
            const fromId1 = 'fromId1';
            const toType1 = 'toType1';
            const metadata1 = { value1: 'og1', value2: 'og2' };
            const rights = { read: true, write: true };

            const pushOutput = {
                nodes: {
                    [nodeId1]: { statusCode: 200 },
                    [nodeId2]: { statusCode: 403, name: 'NoWriteRightError' },
                },
                edges: {
                    [fromType1]: {
                        [fromId1]: {
                            [toType1]: {
                                [nodeId1]: { statusCode: 200 },
                                [nodeId2]: { statusCode: 403, name: 'NoWriteRightError' },
                            },
                        },
                    },
                },
                rights: {
                    [nodeId1]: { user: { [user]: { statusCode: 200 } } },
                    [nodeId2]: { user: { [user]: { statusCode: 403, name: 'NoAdminRightError' } } },
                    [nodeId3]: { inherit: { statusCode: 403, name: 'NoAdminRightError' } },
                },
            };

            const {
                store: { push },
                dispatch,
                onError,
            } = createTestStore(
                {
                    [graphName]: {
                        graph: {
                            nodes: {
                                [nodeId1]: { id: nodeId1 },
                                [nodeId2]: { id: nodeId2 },
                            },
                            edges: {
                                [fromType1]: {
                                    [fromId1]: {
                                        [toType1]: {
                                            [nodeId1]: metadata1,
                                            [nodeId2]: metadata1,
                                        },
                                    },
                                },
                            },
                            rights: {
                                [nodeId1]: { user: { [user]: rights } },
                                [nodeId2]: { user: { [user]: rights } },
                                [nodeId3]: { inherit: { from: fromId1 } },
                            },
                        },
                    },
                },
                {
                    push: () => pushOutput,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/MERGE',
                payload: {
                    fromGraph: {
                        nodes: {
                            [nodeId1]: { id: nodeId1 },
                        },
                        edges: {
                            [fromType1]: { [fromId1]: { [toType1]: { [nodeId1]: metadata1 } } },
                        },
                        rights: {
                            [nodeId1]: { user: { [user]: rights } },
                        },
                    },
                    toGraphName: 'main',
                },
            });
            expect(dispatch).toBeCalledWith({
                type: 'GOT/MERGE_ERROR',
                payload: {
                    fromGraph: {
                        nodes: {
                            [nodeId2]: { statusCode: 403, name: 'NoWriteRightError', element: { id: nodeId2 } },
                        },
                        edges: {
                            [fromType1]: {
                                [fromId1]: {
                                    [toType1]: {
                                        [nodeId2]: { statusCode: 403, name: 'NoWriteRightError', element: metadata1 },
                                    },
                                },
                            },
                        },
                        rights: {
                            [nodeId2]: {
                                user: { [user]: { statusCode: 403, name: 'NoAdminRightError', element: rights } },
                            },
                            [nodeId3]: {
                                inherit: { statusCode: 403, name: 'NoAdminRightError', element: { from: fromId1 } },
                            },
                        },
                    },
                    toGraphName: graphName,
                },
            });
            expect(dispatch).toBeCalledWith({
                type: 'GOT/CLEAR',
                payload: {
                    graphName,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should call API with the graph to push in body', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node = { id: nodeId };
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [nodeId]: node,
                },
            };

            const {
                store: { push },
                onError,
                api,
            } = createTestStore(
                {
                    [graphName]: { graph },
                },
                {
                    push: () => {},
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(onError).not.toBeCalled();
            expect(api.push).toBeCalledWith(graph);
            /* #endregion */
        });
        test('should merge pushed graph to main', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node = { id: nodeId };
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [nodeId]: node,
                },
            };

            const apiResult = {
                nodes: {
                    [nodeId]: { statusCode: 200 },
                },
            };

            const {
                store: { push },
                getState,
                onError,
            } = createTestStore(
                {
                    main: {},
                    [graphName]: { graph },
                },
                {
                    push: () => apiResult,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(['main', 'graph'], graph);
            /* #endregion */
        });
        test('should clear pushed graph', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node = { id: nodeId };
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [nodeId]: node,
                },
            };

            const apiResult = {
                nodes: {
                    [nodeId]: { statusCode: 200 },
                },
            };

            const {
                store: { push },
                getState,
                onError,
            } = createTestStore(
                {
                    main: {},
                    [graphName]: { graph },
                },
                {
                    push: () => apiResult,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(onError).not.toBeCalled();
            expect(getState()).not.toHaveProperty(graphName);
            /* #endregion */
        });
        test('should not merge failing items', async () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const node1 = { id: nodeId1 };
            const node2 = { id: nodeId2 };
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [nodeId1]: node1,
                    [nodeId2]: node2,
                },
            };

            const apiResult = {
                nodes: {
                    [nodeId1]: { statusCode: 200 },
                    [nodeId2]: { statusCode: 403 },
                },
            };

            const {
                store: { push },
                getState,
                onError,
            } = createTestStore(
                {
                    main: {},
                    [graphName]: { graph },
                },
                {
                    push: () => apiResult,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            const expectedMainGraph = {
                nodes: {
                    [nodeId1]: node1,
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(['main', 'graph'], expectedMainGraph);
            /* #endregion */
        });
        test('should store failing items in a seperate error graph along with error code', async () => {
            /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const nodeId2 = 'node2';
            const node1 = { id: nodeId1 };
            const node2 = { id: nodeId2 };
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [nodeId1]: node1,
                    [nodeId2]: node2,
                },
            };

            const apiResult = {
                nodes: {
                    [nodeId1]: { statusCode: 200 },
                    [nodeId2]: { statusCode: 403, name: 'NoWriteRightError' },
                },
            };

            const {
                store: { push },
                getState,
                onError,
            } = createTestStore(
                {
                    main: {},
                    [graphName]: { graph },
                },
                {
                    push: () => apiResult,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            const expectedErrors = {
                nodes: {
                    [nodeId2]: { statusCode: 403, name: 'NoWriteRightError', element: node2 },
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName, 'errors'], expectedErrors);
            /* #endregion */
        });
        test('should not merge and clear in case the push operation fails completely', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const node = { id: nodeId };
            const graphName = 'graph';
            const graph = {
                nodes: {
                    [nodeId]: node,
                },
            };
            const apiError = new Error('SomeError');

            const {
                store: { push },
                getState,
                initialState,
                dispatch,
                onError,
            } = createTestStore(
                {
                    main: {},
                    [graphName]: { graph },
                },
                {
                    push: () => {
                        throw apiError;
                    },
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(onError).toBeCalledWith(apiError);
            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('Reverse Edges', () => {
        test('should call API without any indexes', async () => {
            /* #region Test Bed Creation */
            const fromId1 = 'from1';
            const fromNode1 = { id: fromId1 };
            const toId1 = 'to1';
            const toNode1 = { id: toId1 };
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [fromId1]: fromNode1,
                    [toId1]: toNode1,
                },
                edges: {
                    fromType: { [fromId1]: { toType: { [toId1]: { value: 1 } } } },
                },
            };
            const reverseEdgesGraph = {
                ...graph,
                index: { reverseEdges: { fromType: { from: { toType: { to: true } } } } },
            };

            const {
                store: { push },
                onError,
                api,
            } = createTestStore(
                {
                    [graphName]: { graph: reverseEdgesGraph },
                },
                {
                    push: () => {},
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(onError).not.toBeCalled();
            expect(api.push).toBeCalled();
            expect(api.push).toBeCalledWith(
                expect.not.objectContaining({
                    index: { reverseEdges: { fromType: { from: { toType: { to: true } } } } },
                }),
            );
            /* #endregion */
        });
        test('should add reverse index only for successfully pushed edges to successgraph', async () => {
            /* #region Test Bed Creation */
            const fromId1 = 'from1';
            const fromId2 = 'from2';
            const fromNode1 = { id: fromId1 };
            const fromNode2 = { id: fromId2 };
            const toId1 = 'to1';
            const toNode1 = { id: toId1 };
            const fromType = 'fromType1';
            const toType = 'toType1';
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [fromId1]: fromNode1,
                    [fromId2]: fromNode2,
                    [toId1]: toNode1,
                },
                edges: {
                    [fromType]: {
                        [fromId1]: { [toType]: { [toId1]: { value: 1 } } },
                        [fromId2]: { [toType]: { [toId1]: { value: 2 } } },
                    },
                },
                index: {
                    reverseEdges: {
                        [toType]: {
                            [toId1]: {
                                [fromType]: {
                                    [fromId1]: true,
                                    [fromId2]: true,
                                },
                            },
                        },
                    },
                },
            };

            const apiResult = {
                nodes: {
                    [fromId1]: { statusCode: 200 },
                    [fromId2]: { statusCode: 403, name: 'NoWriteRightError' },
                    [toId1]: { statusCode: 200 },
                },
                edges: {
                    [fromType]: {
                        [fromId1]: { [toType]: { [toId1]: { statusCode: 200 } } },
                        [fromId2]: { [toType]: { [toId1]: { statusCode: 403, name: 'NoWriteRightError' } } },
                    },
                },
            };

            const {
                store: { push },
                getState,
                onError,
            } = createTestStore(
                {
                    [graphName]: { graph },
                },
                {
                    push: () => apiResult,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            const expectedMainGraph = {
                nodes: {
                    [fromId1]: fromNode1,
                    [toId1]: toNode1,
                },
                edges: {
                    [fromType]: {
                        [fromId1]: { [toType]: { [toId1]: { value: 1 } } },
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
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty(['main', 'graph'], expectedMainGraph);
            /* #endregion */
        });
        test('should add reverse index only for failed pushed edges to error graph', async () => {
            /* #region Test Bed Creation */
            const fromId1 = 'from1';
            const fromId2 = 'from2';
            const fromNode1 = { id: fromId1 };
            const fromNode2 = { id: fromId2 };
            const toId1 = 'to1';
            const toNode1 = { id: toId1 };
            const fromType = 'fromType1';
            const toType = 'toType1';
            const graphName = 'graph';

            const graph = {
                nodes: {
                    [fromId1]: fromNode1,
                    [fromId2]: fromNode2,
                    [toId1]: toNode1,
                },
                edges: {
                    [fromType]: {
                        [fromId1]: { [toType]: { [toId1]: { value: 1 } } },
                        [fromId2]: { [toType]: { [toId1]: { value: 2 } } },
                    },
                },
                index: {
                    reverseEdges: {
                        [toType]: {
                            [toId1]: {
                                [fromType]: {
                                    [fromId1]: true,
                                    [fromId2]: true,
                                },
                            },
                        },
                    },
                },
            };

            const apiResult = {
                nodes: {
                    [fromId1]: { statusCode: 200 },
                    [fromId2]: { statusCode: 403, name: 'NoWriteRightError' },
                    [toId1]: { statusCode: 200 },
                },
                edges: {
                    [fromType]: {
                        [fromId1]: { [toType]: { [toId1]: { statusCode: 200 } } },
                        [fromId2]: { [toType]: { [toId1]: { statusCode: 403, name: 'NoWriteRightError' } } },
                    },
                },
            };

            const {
                store: { push },
                getState,
                onError,
            } = createTestStore(
                {
                    [graphName]: { graph },
                },
                {
                    push: () => apiResult,
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            const expectedErrorGraph = {
                nodes: {
                    [fromId2]: { statusCode: 403, name: 'NoWriteRightError', element: fromNode2 },
                },
                edges: {
                    [fromType]: {
                        [fromId2]: {
                            [toType]: {
                                [toId1]: { statusCode: 403, name: 'NoWriteRightError', element: { value: 2 } },
                            },
                        },
                    },
                },
                index: {
                    reverseEdges: {
                        [toType]: {
                            [toId1]: {
                                [fromType]: {
                                    [fromId2]: { statusCode: 403, name: 'NoWriteRightError', element: true },
                                },
                            },
                        },
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName, 'errors', 'nodes'], expectedErrorGraph.nodes);
            expect(getState()).toHaveProperty([graphName, 'errors', 'edges'], expectedErrorGraph.edges);
            expect(getState()).toHaveProperty([graphName, 'errors', 'index'], expectedErrorGraph.index);
            expect(getState()).toHaveProperty([graphName, 'errors'], expectedErrorGraph);
            /* #endregion */
        });
    });

    describe('Files', () => {
        test('should call API with the files in graph to push in body', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const graphName = 'graph';
            const prop = 'file1';
            const filename = 'file1.txt';
            const contentType = 'text/plain';
            const file = new Blob(['hello there'], { type: contentType });

            const graph = {
                files: {
                    [nodeId]: {
                        [prop]: {
                            contentType,
                            fileSize: file.size,
                            filename,
                        },
                    },
                },
            };

            const {
                store: { push },
                onError,
                api,
            } = createTestStore(
                {
                    [graphName]: {
                        graph,
                        files: {
                            [nodeId]: {
                                [prop]: {
                                    file,
                                },
                            },
                        },
                    },
                },
                {
                    push: () => {},
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(onError).not.toBeCalled();
            expect(api.push).toBeCalledWith(graph);
            /* #endregion */
        });
        test('should start singlepart upload for files after push', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const graphName = 'graph';
            const prop = 'file1';
            const filename = 'file1.txt';
            const contentType = 'text/plain';
            const file = new Blob(['hello there'], { type: contentType });

            const uploadUrls = ['https://someurl.com'];

            const graphData = {
                graph: {
                    files: {
                        [nodeId]: {
                            [prop]: {
                                contentType,
                                fileSize: file.size,
                                filename,
                            },
                        },
                    },
                },
                files: {
                    [nodeId]: {
                        [prop]: {
                            file,
                        },
                    },
                },
            };

            const {
                store: { push },
                onError,
                api,
            } = createTestStore(
                {
                    [graphName]: graphData,
                },
                {
                    push: () => ({
                        files: {
                            [nodeId]: {
                                [prop]: {
                                    statusCode: 200,
                                    uploadUrls,
                                },
                            },
                        },
                    }),
                    upload: async () => {},
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            const { uploads } = await push(graphName).catch(console.log);

            expect(uploads).toHaveProperty('start');
            expect(uploads.start).toBeInstanceOf(Function);

            expect(uploads).toHaveProperty('subscribe');
            expect(uploads.subscribe).toBeInstanceOf(Function);

            uploads.start();

            expect(onError).not.toBeCalled();
            expect(api.upload).toBeCalledWith(uploadUrls, file, {
                contentType,
                uploadId: undefined,
                partSize: undefined,
                onProgress: expect.any(Function),
            });
            /* #endregion */
        });
        test('should start multipart upload for files after push', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const graphName = 'graph';
            const prop = 'file1';
            const filename = 'file1.txt';
            const contentType = 'text/plain';
            const uploadId = 'someUploadId';
            const file = new Blob(['hello there'], { type: contentType });

            const uploadUrls = ['https://someurl1.com', 'https://someurl2.com'];

            const graphData = {
                graph: {
                    files: {
                        [nodeId]: {
                            [prop]: {
                                contentType,
                                fileSize: file.size,
                                filename,
                            },
                        },
                    },
                },
                files: {
                    [nodeId]: {
                        [prop]: {
                            file,
                        },
                    },
                },
            };

            const {
                store: { push },
                onError,
                api,
            } = createTestStore(
                {
                    [graphName]: graphData,
                },
                {
                    push: () => ({
                        files: {
                            [nodeId]: {
                                [prop]: {
                                    statusCode: 200,
                                    uploadId,
                                    uploadUrls,
                                },
                            },
                        },
                    }),
                    upload: async () => {},
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            const { uploads } = await push(graphName).catch(console.log);

            expect(uploads).toHaveProperty('start');
            expect(uploads.start).toBeInstanceOf(Function);

            expect(uploads).toHaveProperty('subscribe');
            expect(uploads.subscribe).toBeInstanceOf(Function);

            uploads.start();

            expect(onError).not.toBeCalled();
            expect(api.upload).toBeCalledWith(uploadUrls, file, {
                contentType,
                uploadId,
                partSize: undefined,
                onProgress: expect.any(Function),
            });
            /* #endregion */
        });
        test('should return observable subject for all initialized uploads', async () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const graphName = 'graph';
            const prop1 = 'file1';
            const prop2 = 'file2';
            const filename = 'file1.txt';
            const contentType = 'text/plain';
            const file = new Blob(['hello there'], { type: contentType });
            const uploadUrls = ['https://someurl.com'];
            const graphData = {
                graph: {
                    files: {
                        [nodeId]: {
                            [prop1]: {
                                contentType,
                                fileSize: file.size,
                                filename,
                            },
                            [prop2]: {
                                contentType,
                                fileSize: file.size,
                                filename,
                            },
                        },
                    },
                },
                files: {
                    [nodeId]: {
                        [prop1]: {
                            file,
                        },
                        [prop2]: {
                            file,
                        },
                    },
                },
            };

            const {
                store: { push },
                onError,
            } = createTestStore(
                {
                    [graphName]: graphData,
                },
                {
                    push: () => ({
                        files: {
                            [nodeId]: {
                                [prop1]: {
                                    statusCode: 200,
                                    uploadUrls,
                                },
                                [prop2]: {
                                    statusCode: 200,
                                    uploadUrls,
                                },
                            },
                        },
                    }),
                    upload: async () => ({ status: 200 }),
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            const { uploads } = await push(graphName);

            expect(uploads).toHaveProperty('subscribe');
            expect(uploads.subscribe).toBeInstanceOf(Function);

            const eventsPromise = toPromise(uploads);
            uploads.start();
            const events = await eventsPromise;

            expect(events).toBeInstanceOf(Array);
            expect(events[0]).toEqual({
                type: 'GOT/UPLOAD_PROGRESS',
                payload: {
                    graphName: 'main',
                    nodeId,
                    prop: prop1,
                    progress: 0,
                },
            });
            expect(events[1]).toEqual({
                type: 'GOT/UPLOAD_PROGRESS',
                payload: {
                    graphName: 'main',
                    nodeId,
                    prop: prop2,
                    progress: 0,
                },
            });
            expect(events[2]).toEqual({
                type: 'GOT/UPLOAD_COMPLETE',
                payload: {
                    graphName: 'main',
                    nodeId,
                    prop: prop1,
                },
            });
            expect(events[3]).toEqual({
                type: 'GOT/UPLOAD_COMPLETE',
                payload: {
                    graphName: 'main',
                    nodeId,
                    prop: prop2,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should call observable functions correctly for multipart upload after push', async () => {
            /* #region Test Bed Creation */
            const graphName = 'graph';

            // upload 1
            const nodeId1 = 'node1';
            const prop1 = 'file1';
            const filename1 = 'file1.txt';
            const contentType1 = 'text/plain';
            const uploadId1 = 'someUploadId1';
            const file1 = new Blob(['hello there1'], { type: contentType1 });
            const uploadUrls1 = ['https://someurl1.com', 'https://someurl2.com'];

            // upload 2
            const nodeId2 = 'node2';
            const prop2 = 'file2';
            const filename2 = 'file2.txt';
            const contentType2 = 'text/plain';
            const uploadId2 = 'someUploadId2';
            const file2 = new Blob(['hello there2'], { type: contentType2 });
            const uploadUrls2 = [
                'https://someurl3.com',
                'https://someurl4.com',
                'https://someurl5.com',
                'https://someurl6.com',
            ];

            const graphData = {
                graph: {
                    files: {
                        [nodeId1]: {
                            [prop1]: {
                                contentType: contentType1,
                                fileSize: file1.size,
                                filename: filename1,
                            },
                        },
                        [nodeId2]: {
                            [prop2]: {
                                contentType: contentType2,
                                fileSize: file2.size,
                                filename: filename2,
                            },
                        },
                    },
                },
                files: {
                    [nodeId1]: {
                        [prop1]: {
                            file: file1,
                        },
                    },
                    [nodeId2]: {
                        [prop2]: {
                            file: file2,
                        },
                    },
                },
            };

            const {
                store: { push },
                onError,
            } = createTestStore(
                {
                    [graphName]: graphData,
                },
                {
                    push: () => ({
                        files: {
                            [nodeId1]: {
                                [prop1]: {
                                    statusCode: 200,
                                    uploadId: uploadId1,
                                    uploadUrls: uploadUrls1,
                                },
                            },
                            [nodeId2]: {
                                [prop2]: {
                                    statusCode: 200,
                                    uploadId: uploadId2,
                                    uploadUrls: uploadUrls2,
                                },
                            },
                        },
                    }),
                    upload: async (_uploadUrls, b, { onProgress }) => {
                        RA.mapIndexed((val, index) => onProgress((index + 1) / R.length(_uploadUrls)))(_uploadUrls);
                    },
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            const { uploads } = await push(graphName).catch(console.log);

            const next = jest.fn();
            const complete = jest.fn();
            const error = jest.fn();

            uploads.subscribe({
                next: (e) => next(e),
                complete: (e) => complete(e),
                error: (e) => error(e),
            });

            await uploads.start();

            // upload 1
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_PROGRESS,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId1,
                    prop: prop1,
                    progress: 0,
                },
            });
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_PROGRESS,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId1,
                    prop: prop1,
                    progress: 0.5,
                },
            });
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_PROGRESS,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId1,
                    prop: prop1,
                    progress: 1,
                },
            });
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_COMPLETE,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId1,
                    prop: prop1,
                },
            });

            // upload 2
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_PROGRESS,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId2,
                    prop: prop2,
                    progress: 0.25,
                },
            });
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_PROGRESS,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId2,
                    prop: prop2,
                    progress: 0.5,
                },
            });
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_PROGRESS,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId2,
                    prop: prop2,
                    progress: 0.75,
                },
            });
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_PROGRESS,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId2,
                    prop: prop2,
                    progress: 1,
                },
            });
            expect(next).toBeCalledWith({
                type: GOT_ACTION_UPLOAD_COMPLETE,
                payload: {
                    graphName: 'main',
                    nodeId: nodeId2,
                    prop: prop2,
                },
            });

            // finished all uploads
            expect(complete).toBeCalledTimes(1);
            expect(error).not.toBeCalled();
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should merge removed files into main', async () => {
            /**
             * This test takes an existing file in main and tries to remove it by pushing false
             * for that same file in graphName. We expect error and upload not to be called.
             * We expect merge to be dispatched with the file set to false, and the file to be
             * set to false in main afterwards.
             */

            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const graphName = 'graph';
            const prop = 'file1';
            const someSignedUrl = 'https://someSignedUrl.com';

            const {
                store: { push },
                api,
                getState,
                onError,
            } = createTestStore(
                {
                    main: {
                        graph: {
                            files: {
                                [nodeId]: {
                                    [prop]: {
                                        url: someSignedUrl,
                                    },
                                },
                            },
                        },
                    },
                    [graphName]: {
                        graph: {
                            files: {
                                [nodeId]: {
                                    [prop]: false,
                                },
                            },
                        },
                    },
                },
                {
                    push: () => ({
                        files: {
                            [nodeId]: {
                                [prop]: {
                                    statusCode: 200,
                                },
                            },
                        },
                    }),
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            const expectedMainGraph = {
                files: {
                    [nodeId]: {
                        [prop]: false,
                    },
                },
            };

            expect(onError).not.toBeCalled();
            expect(api.upload).not.toBeCalled();
            expect(getState()).toHaveProperty(['main', 'graph'], expectedMainGraph);
            /* #endregion */
        });
    });

    describe('Error Handling', () => {
        test('should call `onError` in case of API encounters an error', async () => {
            /* #region Test Bed Creation */
            const graphName = 'graph';
            const apiError = new Error('SomeError');

            const {
                store: { push },
                dispatch,
                onError,
            } = createTestStore(
                {
                    [graphName]: {
                        graph: {}, // graph needs to exist, otherwise push will not push
                    },
                },
                {
                    push: async () => {
                        throw apiError;
                    },
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(graphName);

            expect(onError).toBeCalledWith(apiError);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
        test('should call `onError` in case of API encounters an error during upload', async () => {
            /**
             * Mocks a successful push with files, but throws and error when upload is being called.
             * We expect onError to be called with the thrown API error
             */
            /* #region Test Bed Creation */
            const graphName = 'graph';
            const apiError = new Error('SomeError');
            const nodeId = 'node1';
            const prop = 'file1';
            const filename = 'file1.txt';
            const contentType = 'text/plain';
            const file = new Blob(['hello there'], { type: contentType });
            const uploadUrls = ['https://someurl.com'];

            const {
                store: { push },
                onError,
            } = createTestStore(
                {
                    [graphName]: {
                        graph: {
                            files: {
                                [nodeId]: {
                                    [prop]: {
                                        contentType,
                                        fileSize: file.size,
                                        filename,
                                    },
                                },
                            },
                        },
                        files: {
                            [nodeId]: {
                                [prop]: {
                                    file,
                                },
                            },
                        },
                    },
                },
                {
                    push: () => ({
                        files: {
                            [nodeId]: {
                                [prop]: {
                                    statusCode: 200,
                                    uploadUrls,
                                },
                            },
                        },
                    }),
                    upload: async () => Promise.reject(apiError),
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            const { uploads } = await push(graphName);

            uploads.start();
            const events = await toPromise(uploads);

            expect(events).toBeInstanceOf(Array);
            expect(events[0]).toEqual({
                type: 'GOT/UPLOAD_ERROR',
                payload: {
                    graphName: 'main',
                    nodeId,
                    prop,
                    error: apiError,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', async () => {
            /* #region Test Bed Creation */
            const {
                store: { push },
                dispatch,
                onError,
            } = createTestStore(
                {},
                {
                    push: () => {},
                },
            );
            /* #endregion */

            /* #region Execution and Validation */
            await push(undefined);

            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'graphName',
                }),
            );
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });
});
