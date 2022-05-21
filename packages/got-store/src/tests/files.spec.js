import { Blob } from 'buffer';
import { createTestStore } from './shared.js';
import { INVALID_PARAM_ERROR, MISSING_PARAM_ERROR } from '../errors.js';

describe('store:files', () => {
    describe('selectFiles', () => {
        test('should get files for the specified node', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const name1 = 'file1';
            const name2 = 'file1';
            const nodeFileView = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
                [name2]: {
                    type: 'video/mp4',
                    size: 2024,
                    url: 'https://someOtherUrl.com',
                },
            };

            const {
                store: { selectFiles },
                select,
                onError,
            } = createTestStore({
                main: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const result = select(selectFiles('main')(nodeId));

            expect(onError).not.toBeCalled();
            expect(result).toEqual(nodeFileView);
        /* #endregion */
        });
        test('should stack files correctly', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const name1 = 'file1';
            const graphName1 = 'graph1';
            const nodeFileView1 = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
            };

            const nodeFileView2 = {
                [name1]: {
                    type: 'text/plain',
                    size: 1024,
                    url: 'https://someotherurl.com',
                },
            };

            const {
                store: { selectFiles },
                select,
                onError,
            } = createTestStore({
                main: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView1,
                        },
                    },
                },
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const result = select(selectFiles('main', graphName1)(nodeId));

            expect(onError).not.toBeCalled();
            expect(result).toEqual(nodeFileView2);
        /* #endregion */
        });
        test('should not override files with not exsiting files from higher stacked graphs', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const name1 = 'file1';
            const graphName1 = 'graph1';
            const nodeFileView1 = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
            };

            const {
                store: { selectFiles },
                select,
                onError,
            } = createTestStore({
                main: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView1,
                        },
                    },
                },
                [graphName1]: {
                    graph: {
                        files: { },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const result = select(selectFiles('main', graphName1)(nodeId));

            expect(onError).not.toBeCalled();
            expect(result).toEqual(nodeFileView1);
        /* #endregion */
        });
        test('should keep files marked for deletion when stacking', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const name1 = 'file1';
            const graphName1 = 'graph1';
            const nodeFileView1 = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
            };

            const nodeFileView2 = {
                [name1]: false,
            };

            const {
                store: { selectFiles },
                select,
                onError,
            } = createTestStore({
                main: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView1,
                        },
                    },
                },
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const result = select(selectFiles('main', graphName1)(nodeId));

            expect(onError).not.toBeCalled();
            expect(result).toEqual(nodeFileView2);
        /* #endregion */
        });
        test('should overwrite files marked for deletion when stacking', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const name1 = 'file1';
            const graphName1 = 'graph1';
            const nodeFileView1 = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
            };

            const {
                store: { selectFiles },
                select,
                onError,
            } = createTestStore({
                main: {
                    graph: {
                        files: {
                            [nodeId]: {
                                [name1]: false,
                            },
                        },
                    },
                },
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView1,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const result = select(selectFiles('main', graphName1)(nodeId));

            expect(onError).not.toBeCalled();
            expect(result).toEqual(nodeFileView1);
        /* #endregion */
        });
        test('should merge file views correctly', () => {
        /* #region Test Bed Creation */
            const nodeId1 = 'node1';
            const name1 = 'file1';
            const name2 = 'file2';
            const graphName1 = 'graph1';
            const nodeFileView1 = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
            };

            const nodeFileView2 = {
                [name2]: {
                    type: 'text/plain',
                    size: 1024,
                    url: 'https://someotherurl.com',
                },
            };

            const {
                store: { selectFiles },
                select,
                onError,
            } = createTestStore({
                main: {
                    graph: {
                        files: {
                            [nodeId1]: nodeFileView1,
                        },
                    },
                },
                [graphName1]: {
                    graph: {
                        files: {
                            [nodeId1]: nodeFileView2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const result = select(selectFiles('main', graphName1)(nodeId1));

            const expectedResult = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
                [name2]: {
                    type: 'text/plain',
                    size: 1024,
                    url: 'https://someotherurl.com',
                },
            };

            expect(onError).not.toBeCalled();
            expect(result).toEqual(expectedResult);
        /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';

            const {
                store: { selectFiles },
                select,
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = select(selectFiles()(nodeId));
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'stack',
            }));
            expect(output1).toBeUndefined();

            const output2 = select(selectFiles('main')());
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'nodeId',
            }));
            expect(output2).toBeUndefined();

            expect(dispatch).not.toBeCalled();
        /* #endregion */
        });
    });

    describe('getFiles', () => {
        test('should return the same value as select(selectFiles) (should get files for the specified node)', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const name1 = 'file1';
            const name2 = 'file1';
            const nodeFileView = {
                [name1]: {
                    type: 'text/plain',
                    size: 11,
                    url: 'https://someurl.com',
                },
                [name2]: {
                    type: 'video/mp4',
                    size: 2024,
                    url: 'https://someOtherUrl.com',
                },
            };

            const {
                store: { selectFiles, getFiles },
                select,
                onError,
            } = createTestStore({
                main: {
                    graph: {
                        files: {
                            [nodeId]: nodeFileView,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const selectorOutput = select(selectFiles('main')(nodeId));
            const getterOutput = getFiles('main')(nodeId);

            expect(onError).not.toBeCalled();
            expect(selectorOutput).toEqual(getterOutput);
        /* #endregion */
        });
    });

    describe('setFile', () => {
        test('should call `dispatch` with correct parameters', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const filename = 'file1.txt';
            const file = new Blob(['hello there'], { type: 'text/plain' });
            const graphName = 'graph1';

            const {
                store: { setFile },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            setFile(graphName)(nodeId)(prop, filename, file);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/SET_FILE',
                payload: {
                    graphName,
                    nodeId,
                    prop,
                    filename,
                    file,
                },
            });
            expect(onError).not.toBeCalled();
        /* #endregion */
        });
        test('should set content type and size in graph', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const filename = 'file1.txt';
            const file = new Blob(['hello there'], { type: 'text/plain' });
            const graphName = 'graph1';

            const {
                store: { setFile },
                getState,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            setFile(graphName)(nodeId)(prop, filename, file);

            const expectedFile = {
                filename,
                contentType: 'text/plain',
                fileSize: file.size,
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName, 'graph', 'files', nodeId, prop], expectedFile);
        /* #endregion */
        });
        test('should set file blob in files', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const filename = 'file1.txt';
            const file = new Blob(['hello there'], { type: 'text/plain' });
            const graphName = 'graph1';

            const {
                store: { setFile },
                getState,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            setFile(graphName)(nodeId)(prop, filename, file);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName, 'files', nodeId, prop, 'file'], file);
        /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
        /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const filename = 'file1.txt';
            const file = new Blob(['hello there'], { type: 'text/plain' });
            const graphName = 'graph1';

            const {
                store: { setFile },
                getState,
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            setFile()(nodeId)(prop, file);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'graphName',
            }));

            setFile(graphName)(undefined)(prop, filename, file);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'nodeId',
            }));

            setFile(graphName)(nodeId)(undefined, filename, file);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'prop',
            }));

            setFile(graphName)(nodeId)(prop, undefined, file);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'filename',
            }));

            setFile(graphName)(nodeId)(prop, filename, undefined);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'file',
            }));

            setFile(graphName)(nodeId)(prop, filename, { type: 'text/plain' });
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: INVALID_PARAM_ERROR,
                invalid: 'file',
            }));

            setFile(graphName)(nodeId)(prop, filename, new Blob(['hello there']));
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'file.type',
            }));

            expect(getState()).toEqual({});
            expect(dispatch).not.toBeCalled();
        /* #endregion */
        });
    });

    describe('removeFile', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const graphName = 'graph1';

            const {
                store: { removeFile },
                dispatch,
                onError,
            } = createTestStore();
                /* #endregion */

            /* #region Execution and Validation */
            removeFile(graphName)(nodeId)(prop);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/REMOVE_FILE',
                payload: {
                    graphName,
                    nodeId,
                    prop,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should set entry in graph to false', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const graphName = 'graph1';
            const type = 'text/plain';

            const {
                store: { removeFile },
                getState,
                onError,
            } = createTestStore({
                [graphName]: {
                    graph: {
                        files: {
                            [nodeId]: {
                                [prop]: {
                                    type,
                                    size: 11,
                                },
                            },
                        },
                    },
                },
            });
                /* #endregion */

            /* #region Execution and Validation */
            removeFile(graphName)(nodeId)(prop);

            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName, 'graph', 'files', nodeId, prop], false);
            /* #endregion */
        });
        test('should dissoc file blob in files if exists', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const graphName = 'graph1';
            const type = 'text/plain';
            const file = new Blob(['hello there'], { type });

            const {
                store: { removeFile },
                getState,
                onError,
            } = createTestStore({
                [graphName]: {
                    files: {
                        [nodeId]: {
                            [prop]: {
                                file,
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            removeFile(graphName)(nodeId)(prop);

            expect(onError).not.toBeCalled();
            expect(getState()).not.toHaveProperty([graphName, 'files', nodeId, prop]);
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const prop = 'file1';
            const graphName = 'graph1';

            const {
                store: { removeFile },
                getState,
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            removeFile()(nodeId)(prop);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'graphName',
            }));

            removeFile(graphName)(undefined)(prop);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'nodeId',
            }));

            removeFile(graphName)(nodeId)(undefined);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'prop',
            }));

            expect(getState()).toEqual({});
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });
});
