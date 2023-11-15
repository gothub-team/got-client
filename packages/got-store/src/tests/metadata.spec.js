import { createTestStore } from './shared.js';
import { INVALID_PARAM_ERROR, MISSING_PARAM_ERROR } from '../errors.js';

describe('store:Metadata', () => {
    describe('selectMetadata', () => {
        test('should return the metadata for a given relation between a from and to node', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const node1 = { id: toId1 };
            const edgeFrom1To1Metadata = { value: 1 };
            const graphName1 = 'graph1';

            const {
                store: { selectMetadata },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [toId1]: edgeFrom1To1Metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectMetadata(graphName1)(`${fromType}/${toType}`)(fromId)(toId1));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(edgeFrom1To1Metadata);
            /* #endregion */
        });
        test('should stack metadata correctly (true, undefined)', () => {
            expect(testMetadataStacking(true, undefined)).toBeTruthy(); // TODO maybe check .toBe(true) instead
        });
        test('should stack metadata correctly (undefined, true)', () => {
            expect(testMetadataStacking(undefined, true)).toBeTruthy(); // TODO maybe check .toBe(true) instead
        });
        test('should stack metadata correctly (true, false)', () => {
            expect(testMetadataStacking(true, false)).toBe(false);
        });
        test('should stack metadata correctly (false, true)', () => {
            expect(testMetadataStacking(false, true)).toBe(true);
        });
        test('should stack metadata correctly (obj, false)', () => {
            expect(testMetadataStacking({ value: 1 }, false)).toBe(false);
        });
        test('should stack metadata correctly (false, obj)', () => {
            expect(testMetadataStacking(false, { value: 1 })).toEqual({ value: 1 });
        });
        test('should stack metadata correctly (obj, true)', () => {
            expect(testMetadataStacking({ value: 1 }, true)).toEqual({ value: 1 });
        });
        test('should stack metadata correctly (true, obj)', () => {
            expect(testMetadataStacking(true, { value: 1 })).toEqual({ value: 1 });
        });
        test('should stack metadata correctly (obj, obj)', () => {
            const res = testMetadataStacking({ value1: 'og1', value2: 'toEdit2' }, { value2: 'edit2', value3: 'add3' });
            const expectedRes = { value1: 'og1', value2: 'edit2', value3: 'add3' };
            expect(res).toEqual(expectedRes);
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const node1 = { id: toId1 };
            const edgeFrom1To1Metadata = { value: 1 };
            const graphName1 = 'graph1';

            const {
                store: { selectMetadata },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: {
                                    [toType]: {
                                        [toId1]: edgeFrom1To1Metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = select(selectMetadata()(`${fromType}/${toType}`)(fromId1)(toId1));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toEqual(undefined);

            const output2 = select(selectMetadata(graphName1)()(fromId1)(toId1));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );
            expect(output2).toEqual(undefined);

            const output3 = select(selectMetadata(graphName1)(`${fromType}`)(fromId1)(toId1));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );
            expect(output3).toEqual(undefined);

            const output4 = select(selectMetadata(graphName1)(`${fromType}/${toType}`)()(toId1));
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );
            expect(output4).toEqual(undefined);

            const output5 = select(selectMetadata(graphName1)(`${fromType}/${toType}`)(fromId1)());
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toId',
                }),
            );
            expect(output5).toEqual(undefined);

            /* #endregion */
        });
    });

    describe('getMetadata', () => {
        test('should return the same result as selectMetadata (should return the metadata for a given relation between a from and to node)', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const node1 = { id: toId1 };
            const edgeFrom1To1Metadata = { value: 1 };
            const graphName1 = 'graph1';

            const {
                store: { selectMetadata, getMetadata },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId]: {
                                    [toType]: {
                                        [toId1]: edgeFrom1To1Metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const selectOutput = select(selectMetadata(graphName1)(`${fromType}/${toType}`)(fromId)(toId1));
            const getOutput = getMetadata(graphName1)(`${fromType}/${toType}`)(fromId)(toId1);

            expect(onError).not.toBeCalled();
            expect(getOutput).toEqual(selectOutput);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId1 = 'fromId';
            const fromType = 'fromType';
            const toType = 'toType';
            const toId1 = 'node1';
            const node1 = { id: toId1 };
            const edgeFrom1To1Metadata = { value: 1 };
            const graphName1 = 'graph1';

            const {
                store: { getMetadata },
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        nodes: {
                            [toId1]: node1,
                        },
                        edges: {
                            [fromType]: {
                                [fromId1]: {
                                    [toType]: {
                                        [toId1]: edgeFrom1To1Metadata,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = getMetadata()(`${fromType}/${toType}`)(fromId1)(toId1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'stack',
                }),
            );
            expect(output1).toEqual(undefined);

            const output2 = getMetadata(graphName1)()(fromId1)(toId1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'edgeTypes',
                }),
            );
            expect(output2).toEqual(undefined);

            const output3 = getMetadata(graphName1)(`${fromType}`)(fromId1)(toId1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: INVALID_PARAM_ERROR,
                    invalid: 'edgeTypes',
                }),
            );
            expect(output3).toEqual(undefined);

            const output4 = getMetadata(graphName1)(`${fromType}/${toType}`)()(toId1);
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'fromId',
                }),
            );
            expect(output4).toEqual(undefined);

            const output5 = getMetadata(graphName1)(`${fromType}/${toType}`)(fromId1)();
            expect(onError).toBeCalledWith(
                expect.objectContaining({
                    name: MISSING_PARAM_ERROR,
                    missing: 'toId',
                }),
            );
            expect(output5).toEqual(undefined);

            /* #endregion */
        });
    });
});

const testMetadataStacking = (metadata1, metadata2) => {
    /* #region Test Bed Creation */
    const fromId = 'fromId';
    const fromType = 'fromType';
    const toType = 'toType';
    const toId1 = 'node1';
    const node1 = { id: toId1 };
    const graphName1 = 'graph1';
    const graphName2 = 'graph2';

    const {
        store: { selectMetadata },
        select,
        onError,
    } = createTestStore({
        [graphName1]: {
            graph: {
                nodes: {
                    [toId1]: node1,
                },
                edges: {
                    [fromType]: {
                        [fromId]: {
                            [toType]: {
                                [toId1]: metadata1,
                            },
                        },
                    },
                },
            },
        },
        [graphName2]: {
            graph: {
                nodes: {
                    [toId1]: node1,
                },
                edges: {
                    [fromType]: {
                        [fromId]: {
                            [toType]: {
                                [toId1]: metadata2,
                            },
                        },
                    },
                },
            },
        },
    });

    const output = select(selectMetadata(graphName1, graphName2)(`${fromType}/${toType}`)(fromId)(toId1));

    expect(onError).not.toBeCalled();
    return output;
};
