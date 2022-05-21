import { MISSING_PARAM_ERROR } from '../errors.js';
import { createTestStore } from './shared.js';

describe('store:Rights', () => {
    describe('selectRights', () => {
        test('should get rights for the specified node', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const user = 'user1';
            const graphName1 = 'graph1';
            const nodeRights = {
                user: {
                    [user]: {
                        read: true,
                        write: true,
                    },
                },
            };

            const {
                store: { selectRights },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectRights(graphName1)(nodeId));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(nodeRights);
            /* #endregion */
        });
        test('should stack rights correctly (merge rights)', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const user = 'user1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const nodeRights1 = {
                user: {
                    [user]: {
                        read: true,
                        write: true,
                    },
                },
            };
            const nodeRights2 = {
                user: {
                    [user]: {
                        write: false,
                        admin: true,
                    },
                },
            };

            const {
                store: { selectRights },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectRights(graphName1, graphName2)(nodeId));

            const expectedRights = {
                user: {
                    [user]: {
                        read: true,
                        write: false,
                        admin: true,
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedRights);
            /* #endregion */
        });
        test('should stack rights correctly (merge users)', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const user1 = 'user1';
            const user2 = 'user2';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const nodeRights1 = {
                user: {
                    [user1]: {
                        read: true,
                        write: true,
                    },
                },
            };
            const nodeRights2 = {
                user: {
                    [user2]: {
                        write: true,
                        admin: true,
                    },
                },
            };

            const {
                store: { selectRights },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights2,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectRights(graphName1, graphName2)(nodeId));

            const expectedRights = {
                user: {
                    [user1]: {
                        read: true,
                        write: true,
                    },
                    [user2]: {
                        write: true,
                        admin: true,
                    },
                },
            };
            expect(onError).not.toBeCalled();
            expect(output).toEqual(expectedRights);
            /* #endregion */
        });
        test('should not override rights with not existing rights from higher stacked graphs', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const user = 'user1';
            const graphName1 = 'graph1';
            const graphName2 = 'graph2';
            const nodeRights1 = {
                user: {
                    [user]: {
                        read: true,
                        write: true,
                    },
                },
            };

            const {
                store: { selectRights },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights1,
                        },
                    },
                },
                [graphName2]: {
                    graph: {
                        rights: {
                            [nodeId]: {},
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output = select(selectRights(graphName1, graphName2)(nodeId));

            expect(onError).not.toBeCalled();
            expect(output).toEqual(nodeRights1);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const user = 'user1';
            const graphName1 = 'graph1';

            const nodeRights = {
                user: {
                    [user]: {
                        read: true,
                        write: true,
                    },
                },
            };

            const {
                store: { selectRights },
                select,
                dispatch,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const output1 = select(selectRights()(nodeId));
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'stack',
            }));
            expect(output1).toBeUndefined();

            const output2 = select(selectRights(graphName1)(undefined));
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'nodeId',
            }));
            expect(output2).toBeUndefined();

            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('getRights', () => {
        test('should return the same value as select(selectRights) (should get rights for the specified node)', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const user = 'user1';
            const graphName1 = 'graph1';
            const nodeRights = {
                user: {
                    [user]: {
                        read: true,
                        write: true,
                    },
                },
            };

            const {
                store: { selectRights, getRights },
                select,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            const selectorOutput = select(selectRights(graphName1)(nodeId));
            const getterOutput = getRights(graphName1)(nodeId);

            expect(onError).not.toBeCalled();
            expect(selectorOutput).toEqual(getterOutput);
            /* #endregion */
        });
    });

    describe('setRights', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const nodeId = 'node1';
            const graphName = 'graph1';
            const email = 'userEmail';
            const rights = {
                read: true,
                write: true,
                admin: true,
            };

            const {
                store: { setRights },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            setRights(graphName)(nodeId)(email, rights);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/SET_RIGHTS',
                payload: {
                    graphName,
                    nodeId,
                    email,
                    rights,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should set/delete specified rights types for specified node', () => {
            /* #region Test Bed Creation */
            const user = 'user1';
            const nodeId = 'node1';
            const graphName1 = 'graph1';
            const userRights = {
                read: false,
                write: true,
            };

            const {
                store: { setRights },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: {
                                user: {
                                    [user]: {
                                        read: true,
                                        admin: true,
                                    },
                                },
                            },
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            setRights(graphName1)(nodeId)(user, userRights);

            const expectedRights = {
                read: false,
                write: true,
                admin: true,
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'rights', nodeId, 'user', user], expectedRights);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const user = 'user1';
            const nodeId = 'node1';
            const graphName1 = 'graph1';
            const userRights = {
                read: false,
                write: true,
            };

            const {
                initialState,
                store: { setRights },
                getState,
                dispatch,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            setRights(undefined)(nodeId)(user, userRights);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'graphName',
            }));
            setRights(graphName1)(undefined)(user, userRights);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'nodeId',
            }));
            setRights(graphName1)(nodeId)(undefined, userRights);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'email',
            }));
            setRights(graphName1)(nodeId)(user, undefined);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'rights',
            }));

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });

    describe('inheritRights', () => {
        test('should call `dispatch` with correct parameters', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const nodeId = 'node1';
            const graphName = 'graph1';

            const {
                store: { inheritRights },
                dispatch,
                onError,
            } = createTestStore();
            /* #endregion */

            /* #region Execution and Validation */
            inheritRights(graphName)(nodeId)(fromId);

            expect(dispatch).toBeCalledWith({
                type: 'GOT/INHERIT_RIGHTS',
                payload: {
                    graphName,
                    nodeId,
                    fromId,
                },
            });
            expect(onError).not.toBeCalled();
            /* #endregion */
        });
        test('should flag node for inherit rights', () => {
            /* #region Test Bed Creation */
            const user = 'user1';
            const fromId = 'fromId';
            const nodeId = 'node1';
            const graphName1 = 'graph1';
            const nodeRights = {
                user: {
                    [user]: {
                        read: true,
                        admin: true,
                    },
                },
            };

            const {
                store: { inheritRights },
                getState,
                onError,
            } = createTestStore({
                [graphName1]: {
                    graph: {
                        rights: {
                            [nodeId]: nodeRights,
                        },
                    },
                },
            });
            /* #endregion */

            /* #region Execution and Validation */
            inheritRights(graphName1)(nodeId)(fromId);

            const expectedRights = {
                ...nodeRights,
                inherit: {
                    from: fromId,
                },
            };
            expect(onError).not.toBeCalled();
            expect(getState()).toHaveProperty([graphName1, 'graph', 'rights', nodeId], expectedRights);
            /* #endregion */
        });
        test('should call `onError` in case of invalid input', () => {
            /* #region Test Bed Creation */
            const fromId = 'fromId';
            const nodeId = 'node1';
            const graphName1 = 'graph1';

            const {
                initialState,
                store: { inheritRights },
                getState,
                dispatch,
                onError,
            } = createTestStore({});
            /* #endregion */

            /* #region Execution and Validation */
            inheritRights(undefined)(nodeId)(fromId);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'graphName',
            }));

            inheritRights(graphName1)(undefined)(fromId);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'nodeId',
            }));

            inheritRights(graphName1)(nodeId)(undefined);
            expect(onError).toBeCalledWith(expect.objectContaining({
                name: MISSING_PARAM_ERROR,
                missing: 'fromId',
            }));

            expect(getState()).toEqual(initialState);
            expect(dispatch).not.toBeCalled();
            /* #endregion */
        });
    });
});
