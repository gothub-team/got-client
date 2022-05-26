/* eslint-disable default-param-last */
/* eslint-disable consistent-return */
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import {
    convergeOverPaths,
    forEachCondObj,
    mergeDeepLeft,
    mergeLeft,
    mergeWith,
    overPath,
    useSubscriber,
    useResult,
} from '@gothub-team/got-util';
import {
    mergeOverwriteGraphsLeft,
    createSuccessAndErrorGraphs,
    selectPathFromStack,
    pickMapGraph,
    mergeGraphsLeft,
    doViewGraph,
    includeNode,
    includeRights,
    includeFiles,
    includeMetadata,
    mergeGraphsRight,
} from '@gothub-team/got-core';
import { validateInput } from './errors.js';

export const GOT_ACTION_MERGE = 'GOT/MERGE';
export const GOT_ACTION_MERGE_OVERWRITE = 'GOT/MERGE_OVERWRITE';
export const GOT_ACTION_MERGE_ERROR = 'GOT/MERGE_ERROR';
export const GOT_ACTION_CLEAR = 'GOT/CLEAR';
export const GOT_ACTION_CLEAR_ALL = 'GOT/CLEAR_ALL';
export const GOT_ACTION_SET_VAR = 'GOT/SET_VAR';
export const GOT_ACTION_SET_NODE = 'GOT/SET_NODE';
export const GOT_ACTION_ADD = 'GOT/ADD';
export const GOT_ACTION_REMOVE = 'GOT/REMOVE';
export const GOT_ACTION_ASSOC = 'GOT/ASSOC';
export const GOT_ACTION_DISSOC = 'GOT/DISSOC';
export const GOT_ACTION_SET_RIGHTS = 'GOT/SET_RIGHTS';
export const GOT_ACTION_INHERIT_RIGHTS = 'GOT/INHERIT_RIGHTS';
export const GOT_ACTION_SET_FILE = 'GOT/SET_FILE';
export const GOT_ACTION_REMOVE_FILE = 'GOT/REMOVE_FILE';
export const GOT_ACTION_UPLOAD_PROGRESS = 'GOT/UPLOAD_PROGRESS';
export const GOT_ACTION_UPLOAD_COMPLETE = 'GOT/UPLOAD_COMPLETE';
export const GOT_ACTION_UPLOAD_ERROR = 'GOT/UPLOAD_ERROR';

export const createStore = ({
    api,
    dispatch,
    select,
    onError = console.error,
    onWarn = console.warn,
}) => {
    const validateError = validateInput(onError);
    const validateWarn = validateInput(onWarn);

    validateWarn({
        api,
    });
    validateWarn({
        dispatch,
    });
    validateWarn({
        select,
    });

    const merge = (fromGraphName, toGraphName) => {
        dispatch({
            type: GOT_ACTION_MERGE,
            payload: {
                fromGraphName,
                toGraphName,
            },
        });
    };
    const mergeGraph = (fromGraph = {}, toGraphName) => {
        dispatch({
            type: GOT_ACTION_MERGE,
            payload: {
                fromGraph,
                toGraphName,
            },
        });
    };
    const mergeOverwriteGraph = (fromGraph = {}, toGraphName) => {
        dispatch({
            type: GOT_ACTION_MERGE_OVERWRITE,
            payload: {
                fromGraph,
                toGraphName,
            },
        });
    };
    const clear = graphName => {
        dispatch({
            type: GOT_ACTION_CLEAR,
            payload: {
                graphName,
            },
        });
    };

    const selectVar = (...stack) => name => state => selectPathFromStack(['vars', name], stack, mergeLeft, state);
    const getVar = (...stack) => name => select(selectVar(...stack)(name));
    const setVar = graphName => (name, value) => {
        dispatch({
            type: GOT_ACTION_SET_VAR,
            payload: {
                graphName,
                name,
                value,
            },
        });
    };

    const selectNode = (...stack) => nodeId => state => selectPathFromStack(['graph', 'nodes', nodeId], stack, mergeLeft, state);
    const getNode = (...stack) => nodeId => select(selectNode(...stack)(nodeId));
    const setNode = graphName => node => {
        dispatch({
            type: GOT_ACTION_SET_NODE,
            payload: {
                graphName,
                node,
            },
        });
    };

    const selectMetadata = (...stack) => edgeTypes => fromId => toId => state => {
        const [fromType, toType] = R.split('/', edgeTypes);
        return selectPathFromStack(['graph', 'edges', fromType, fromId, toType, toId], stack, mergeLeft, state);
    };
    const getMetadata = (...stack) => edgeTypes => fromId => toId => select(selectMetadata(...stack)(edgeTypes)(fromId)(toId));

    const selectEdge = (...stack) => edgeTypes => fromId => state => {
        const [fromType, toType] = R.split('/', edgeTypes);
        return R.pickBy(
            RA.isTruthy,
            selectPathFromStack(['graph', 'edges', fromType, fromId, toType], stack, mergeWith(mergeLeft), state),
        );
    };
    const getEdge = (...stack) => edgeTypes => fromId => select(selectEdge(...stack)(edgeTypes)(fromId));

    const selectReverseEdge = (...stack) => edgeTypes => toId => state => {
        const [fromType, toType] = R.split('/', edgeTypes);
        const [getResult, setResult] = useResult({});
        R.compose(
            R.mapObjIndexed((val, fromId) => {
                if (val) {
                    const metadata = selectMetadata(...stack)(edgeTypes)(fromId)(toId)(state);
                    metadata && setResult(R.assoc(fromId, metadata));
                }
            }),
            selectPathFromStack(['graph', 'index', 'reverseEdges', toType, toId, fromType], stack, mergeWith(mergeLeft)),
        )(state);
        return getResult();
    };
    const getReverseEdge = (...stack) => edgeTypes => toId => select(selectReverseEdge(...stack)(edgeTypes)(toId));

    const add = graphName => edgeTypes => fromId => (
        toNode,
        metadata,
    ) => {
        const [fromType, toType] = R.split('/', edgeTypes);
        dispatch({
            type: GOT_ACTION_ADD,
            payload: {
                graphName,
                fromType,
                toType,
                fromId,
                toNode,
                metadata,
            },
        });
    };
    const remove = graphName => edgeTypes => fromId => toNode => {
        const [fromType, toType] = R.split('/', edgeTypes);
        dispatch({
            type: GOT_ACTION_REMOVE,
            payload: {
                graphName,
                fromType,
                toType,
                fromId,
                toNode,
            },
        });
    };
    const assoc = graphName => edgeTypes => fromId => (
        toNode,
        metadata,
    ) => {
        const [fromType, toType] = R.split('/', edgeTypes);
        dispatch({
            type: GOT_ACTION_ASSOC,
            payload: {
                graphName,
                fromType,
                toType,
                fromId,
                toNode,
                metadata,
            },
        });
    };
    const dissoc = graphName => edgeTypes => fromId => toNode => {
        const [fromType, toType] = R.split('/', edgeTypes);
        dispatch({
            type: GOT_ACTION_DISSOC,
            payload: {
                graphName,
                fromType,
                toType,
                fromId,
                toNode,
            },
        });
    };

    const selectRights = (...stack) => nodeId => state => selectPathFromStack(['graph', 'rights', nodeId], stack, mergeDeepLeft, state);
    const getRights = (...stack) => nodeId => select(selectRights(...stack)(nodeId));
    const setRights = graphName => nodeId => (email, rights) => {
        dispatch({
            type: GOT_ACTION_SET_RIGHTS,
            payload: {
                graphName,
                nodeId,
                email,
                rights,
            },
        });
    };
    const inheritRights = graphName => nodeId => fromId => {
        dispatch({
            type: GOT_ACTION_INHERIT_RIGHTS,
            payload: {
                graphName,
                nodeId,
                fromId,
            },
        });
    };

    const selectFiles = (...stack) => nodeId => state => selectPathFromStack(['graph', 'files', nodeId], stack, mergeLeft, state);
    const getFiles = (...stack) => nodeId => select(selectFiles(...stack)(nodeId));
    const setFile = graphName => nodeId => (prop, filename, file) => {
        dispatch({
            type: GOT_ACTION_SET_FILE,
            payload: {
                graphName,
                nodeId,
                prop,
                filename,
                file,
            },
        });
    };
    const removeFile = graphName => nodeId => prop => {
        dispatch({
            type: GOT_ACTION_REMOVE_FILE,
            payload: {
                graphName,
                nodeId,
                prop,
            },
        });
    };

    const push = async (graphName, mergeToGraph = 'main') => {
        try {
            const graph = select(R.pathOr(false, [graphName, 'graph']));
            const fileStore = select(R.pathOr(false, [graphName, 'files']));
            const pushBody = R.omit(['index'], graph);
            const apiResult = graph ? await api.push(pushBody) : {};

            const [successGraph, errorGraph] = createSuccessAndErrorGraphs(graph, apiResult);

            RA.isNotNilOrEmpty(successGraph) && dispatch({
                type: GOT_ACTION_MERGE,
                payload: {
                    fromGraph: successGraph,
                    toGraphName: mergeToGraph,
                },
            });

            dispatch({
                type: GOT_ACTION_CLEAR,
                payload: {
                    graphName,
                },
            });

            RA.isNotNilOrEmpty(errorGraph) && dispatch({
                type: GOT_ACTION_MERGE_ERROR,
                payload: {
                    fromGraph: errorGraph,
                    toGraphName: graphName,
                },
            });

            const { subscribe, subscriber } = useSubscriber();
            const uploadFiles = async () => {
                const [getUploads, setUploads] = useResult([]);
                forEachCondObj([
                    [(_, path) => RA.lengthEq(2, path),
                        (_, path) => setUploads(R.append(uploadFile(path)))],
                ])(R.propOr({}, 'files', successGraph));
                await Promise.all(getUploads());
                subscriber.complete();
            };
            const uploadFile = async ([nodeId, prop]) => {
                try {
                    const { contentType, partSize } = R.path(['files', nodeId, prop], graph);
                    const { uploadUrls, uploadId } = R.path(['files', nodeId, prop], apiResult);
                    const file = R.path([nodeId, prop, 'file'], fileStore);

                    subscriber.next({
                        type: GOT_ACTION_UPLOAD_PROGRESS,
                        payload: {
                            graphName: mergeToGraph,
                            nodeId,
                            prop,
                            progress: 0,
                        },
                    });

                    await api.upload(
                        uploadUrls,
                        file,
                        {
                            contentType,
                            uploadId,
                            partSize,
                            onProgress: progress => subscriber.next({
                                type: GOT_ACTION_UPLOAD_PROGRESS,
                                payload: {
                                    graphName: mergeToGraph,
                                    nodeId,
                                    prop,
                                    progress,
                                },
                            }),
                        },
                    );

                    subscriber.next({
                        type: GOT_ACTION_UPLOAD_COMPLETE,
                        payload: {
                            graphName: mergeToGraph,
                            nodeId,
                            prop,
                        },
                    });
                } catch (error) {
                    subscriber.next({
                        type: GOT_ACTION_UPLOAD_ERROR,
                        payload: {
                            graphName: mergeToGraph,
                            nodeId,
                            prop,
                            error,
                        },
                    });
                }
            };

            return { uploads: { subscribe, start: uploadFiles } };
        } catch (error) {
            return onError && onError(error);
        }
    };
    const pull = async (view, mergeToGraph = 'main') => {
        try {
            const toGraph = select(R.pathOr(false, [mergeToGraph, 'graph']));
            const apiResult = api.pull(view);
            const falseGraph = pickMapGraph(RA.stubUndefined, view, toGraph);

            const fromGraph = mergeGraphsRight(falseGraph, await apiResult);

            dispatch({
                type: GOT_ACTION_MERGE_OVERWRITE,
                payload: {
                    fromGraph,
                    toGraphName: mergeToGraph,
                },
            });
        } catch (error) {
            onError && onError(error);
        }
    };
    const selectView = (...stack) => view => state => {
        const [getViewTree, setViewTree] = useResult({});
        const stackGetEdgeToIds = (fromType, nodeId, toType, { reverse } = {}) => reverse
            ? selectReverseEdge(...stack)(`${fromType}/${toType}`)(nodeId)(state)
            : selectEdge(...stack)(`${fromType}/${toType}`)(nodeId)(state);
        doViewGraph({
            nodes: (queryObj, nodeId, edgePath, nodeViewPath, metadata) => {
                setViewTree(
                    R.assocPath(nodeViewPath, {
                        nodeId,
                    }),
                );
                includeMetadata(queryObj) && edgePath && setViewTree(
                    R.assocPath([...nodeViewPath, 'metadata'], metadata),
                );
                includeNode(queryObj) && setViewTree(
                    R.assocPath([...nodeViewPath, 'node'], selectNode(...stack)(nodeId)(state)),
                );
                includeRights(queryObj) && setViewTree(
                    R.assocPath([...nodeViewPath, 'rights'], selectRights(...stack)(nodeId)(state)),
                );
                includeFiles(queryObj) && setViewTree(
                    R.assocPath([...nodeViewPath, 'files'], selectFiles(...stack)(nodeId)(state)),
                );
            },
        }, view, stackGetEdgeToIds);

        return getViewTree();
    };
    const getView = (...stack) => view => select(selectView(...stack)(view));

    return ({
        merge: (fromGraphName, toGraphName) => {
            if (validateError({
                dispatch,
                fromGraphName,
                toGraphName,
            })) {
                return merge(fromGraphName, toGraphName);
            }
        },
        mergeGraph: (fromGraph, toGraphName) => {
            if (validateError({
                dispatch,
                fromGraph,
                toGraphName,
            })) {
                return mergeGraph(fromGraph, toGraphName);
            }
        },
        mergeOverwriteGraph: (fromGraph, toGraphName) => {
            if (validateError({
                dispatch,
                fromGraph,
                toGraphName,
            })) {
                return mergeOverwriteGraph(fromGraph, toGraphName);
            }
        },
        clear: graphName => {
            if (validateError({
                graphName,
            })) {
                return clear(graphName);
            }
        },

        selectVar: (...stack) => name => state => {
            if (validateError({
                stack,
                name,
            })) {
                return selectVar(...stack)(name)(state);
            }
        },
        getVar: (...stack) => name => {
            if (validateError({
                select,
                stack,
                name,
            })) {
                return getVar(...stack)(name);
            }
        },
        setVar: graphName => (name, value) => {
            if (validateError({
                dispatch,
                graphName,
                name,
            })) {
                return setVar(graphName)(name, value);
            }
        },

        selectNode: (...stack) => nodeId => state => {
            if (validateError({
                stack,
                nodeId,
            })) {
                return selectNode(...stack)(nodeId)(state);
            }
        },
        getNode: (...stack) => nodeId => {
            if (validateError({
                select,
                stack,
                nodeId,
            })) {
                return getNode(...stack)(nodeId);
            }
        },
        setNode: graphName => node => {
            if (validateError({
                dispatch,
                graphName,
                node,
            })) {
                return setNode(graphName)(node);
            }
        },

        selectMetadata: (...stack) => edgeTypes => fromId => toId => state => {
            if (validateError({
                stack,
                edgeTypes,
                fromId,
                toId,
            })) {
                return selectMetadata(...stack)(edgeTypes)(fromId)(toId)(state);
            }
            return undefined;
        },
        getMetadata: (...stack) => edgeTypes => fromId => toId => {
            if (validateError({
                stack,
                edgeTypes,
                fromId,
                toId,
            })) {
                return getMetadata(...stack)(edgeTypes)(fromId)(toId);
            }
            return undefined;
        },

        selectEdge: (...stack) => edgeTypes => fromId => state => {
            if (validateError({
                stack,
                edgeTypes,
                fromId,
            })) {
                return selectEdge(...stack)(edgeTypes)(fromId)(state);
            }
            return {};
        },
        getEdge: (...stack) => edgeTypes => fromId => {
            if (validateError({
                select,
                stack,
                edgeTypes,
                fromId,
            })) {
                return getEdge(...stack)(edgeTypes)(fromId);
            }
            return {};
        },
        selectReverseEdge: (...stack) => edgeTypes => toId => state => {
            if (validateError({
                stack,
                edgeTypes,
                toId,
            })) {
                return selectReverseEdge(...stack)(edgeTypes)(toId)(state);
            }
            return {};
        },
        getReverseEdge: (...stack) => edgeTypes => toId => {
            if (validateError({
                stack,
                edgeTypes,
                toId,
            })) {
                return getReverseEdge(...stack)(edgeTypes)(toId);
            }
            return {};
        },
        add: graphName => edgeTypes => fromId => (toNode, metadata) => {
            if (validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })) {
                return add(graphName)(edgeTypes)(fromId)(toNode, metadata);
            }
        },
        remove: graphName => edgeTypes => fromId => toNode => {
            if (validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })) {
                return remove(graphName)(edgeTypes)(fromId)(toNode);
            }
        },
        assoc: graphName => edgeTypes => fromId => (toNode, metadata) => {
            if (validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })) {
                return assoc(graphName)(edgeTypes)(fromId)(toNode, metadata);
            }
        },
        dissoc: graphName => edgeTypes => fromId => toNode => {
            if (validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })) {
                return dissoc(graphName)(edgeTypes)(fromId)(toNode);
            }
        },

        selectRights: (...stack) => nodeId => state => {
            if (validateError({
                stack,
                nodeId,
            })) {
                return selectRights(...stack)(nodeId)(state);
            }
        },
        getRights: (...stack) => nodeId => {
            if (validateError({
                select,
                stack,
                nodeId,
            })) {
                return getRights(...stack)(nodeId);
            }
        },
        setRights: graphName => nodeId => (email, rights) => {
            if (validateError({
                dispatch,
                graphName,
                nodeId,
                email,
                rights,
            })) {
                return setRights(graphName)(nodeId)(email, rights);
            }
        },
        inheritRights: graphName => nodeId => fromId => {
            if (validateError({
                dispatch,
                graphName,
                nodeId,
                fromId,
            })) {
                return inheritRights(graphName)(nodeId)(fromId);
            }
        },

        selectFiles: (...stack) => nodeId => state => {
            if (validateError({
                stack,
                nodeId,
            })) {
                return selectFiles(...stack)(nodeId)(state);
            }
        },
        getFiles: (...stack) => nodeId => {
            if (validateError({
                select,
                stack,
                nodeId,
            })) {
                return getFiles(...stack)(nodeId);
            }
        },
        setFile: graphName => nodeId => (prop, filename, file) => {
            if (validateError({
                dispatch,
                graphName,
                nodeId,
                prop,
                filename,
                file,
            })) {
                return setFile(graphName)(nodeId)(prop, filename, file);
            }
        },
        removeFile: graphName => nodeId => prop => {
            if (validateError({
                dispatch,
                graphName,
                nodeId,
                prop,
            })) {
                return removeFile(graphName)(nodeId)(prop);
            }
        },

        push: async (graphName, toGraphName) => {
            if (validateError({
                api,
                dispatch,
                select,
                graphName,
            })) {
                return push(graphName, toGraphName);
            }
        },
        pull: async (view, toGraphName) => {
            if (validateError({
                api,
                dispatch,
                view,
            })) {
                return pull(view, toGraphName);
            }
        },
        selectView: (...stack) => view => state => {
            if (validateError({
                stack,
                view,
            })) {
                return selectView(...stack)(view)(state);
            }
        },

        getView: (...stack) => view => {
            if (validateError({
                select,
                stack,
                view,
            })) {
                return getView(...stack)(view);
            }
        },
    });
};

export const gotReducer = (state = {}, action) => R.compose(
    reducer => reducer(action.payload)(state),
    R.propOr(() => R.identity, action.type),
)(reducers);

export const reducers = {
    [GOT_ACTION_MERGE]: ({
        falseGraph,
        fromGraph,
        fromGraphName,
        toGraphName,
    }) => R.pipe(
        R.when(
            R.always(RA.isNotNilOrEmpty(fromGraphName)),
            convergeOverPaths(
                [toGraphName, 'graph'],
                [[fromGraphName, 'graph'], [toGraphName, 'graph']],
                mergeGraphsLeft,
            ),
        ),
        R.when(
            R.always(RA.isObj(falseGraph)),
            overPath([toGraphName, 'graph'], mergeGraphsLeft(falseGraph)),
        ),
        R.when(
            R.always(RA.isObj(fromGraph)),
            overPath([toGraphName, 'graph'], mergeGraphsLeft(fromGraph)),
        ),
    ),
    [GOT_ACTION_MERGE_ERROR]: ({
        fromGraph,
        toGraphName,
    }) => R.when(
        R.always(RA.isObj(fromGraph)),
        overPath([toGraphName, 'errors'], mergeGraphsLeft(fromGraph)),
    ),
    [GOT_ACTION_MERGE_OVERWRITE]: ({
        fromGraph,
        toGraphName,
    }) => R.when(
        R.always(RA.isObj(fromGraph)),
        overPath([toGraphName, 'graph'], mergeOverwriteGraphsLeft(fromGraph)),
    ),
    [GOT_ACTION_CLEAR]: ({
        graphName,
    }) => R.dissoc(graphName),
    [GOT_ACTION_CLEAR_ALL]: () => ({}),
    [GOT_ACTION_SET_VAR]: ({
        graphName,
        name,
        value,
    }) => R.assocPath([graphName, 'vars', name], value),

    [GOT_ACTION_SET_NODE]: ({
        graphName,
        node,
    }) => overPath([graphName, 'graph', 'nodes', node.id], mergeLeft(node)),

    [GOT_ACTION_ADD]: ({
        graphName,
        fromType,
        toType,
        fromId,
        toNode,
        metadata = true,
    }) => R.compose(
        R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], true),
        overPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], mergeLeft(metadata)),
        overPath([graphName, 'graph', 'nodes', toNode.id], mergeLeft(toNode)),
    ),
    [GOT_ACTION_REMOVE]: ({
        graphName,
        fromType,
        toType,
        fromId,
        toNode,
    }) => R.compose(
        R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], false),
        R.assocPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], false),
        R.assocPath([graphName, 'graph', 'nodes', toNode.id], false),
    ),
    [GOT_ACTION_ASSOC]: ({
        graphName,
        fromType,
        toType,
        fromId,
        toNode,
        metadata = true,
    }) => R.compose(
        R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], true),
        overPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], mergeLeft(metadata)),
    ),
    [GOT_ACTION_DISSOC]: ({
        graphName,
        fromType,
        toType,
        fromId,
        toNode,
    }) => R.compose(
        R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], false),
        R.assocPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], false),
    ),
    [GOT_ACTION_SET_RIGHTS]: ({
        graphName,
        nodeId,
        email,
        rights,
    }) => overPath([graphName, 'graph', 'rights', nodeId, 'user', email], mergeLeft(rights)),
    [GOT_ACTION_INHERIT_RIGHTS]: ({
        graphName,
        nodeId,
        fromId,
    }) => R.assocPath([graphName, 'graph', 'rights', nodeId, 'inherit', 'from'], fromId),
    [GOT_ACTION_SET_FILE]: ({
        graphName,
        nodeId,
        prop,
        filename,
        file,
    }) => R.compose(
        R.assocPath([graphName, 'files', nodeId, prop], { file }),
        R.assocPath([graphName, 'graph', 'files', nodeId, prop], { filename, contentType: file.type, fileSize: file.size }),
    ),
    [GOT_ACTION_REMOVE_FILE]: ({
        graphName,
        nodeId,
        prop,
    }) => R.compose(
        R.dissocPath([graphName, 'files', nodeId, prop]),
        R.assocPath([graphName, 'graph', 'files', nodeId, prop], false),
    ),
    [GOT_ACTION_UPLOAD_PROGRESS]: ({
        graphName,
        nodeId,
        prop,
        progress,
    }) => R.assocPath([graphName, 'files', nodeId, prop, 'progress'], progress),
    [GOT_ACTION_UPLOAD_COMPLETE]: ({
        graphName,
        nodeId,
        prop,
    }) => R.assocPath([graphName, 'files', nodeId, prop, 'complete'], true),
    [GOT_ACTION_UPLOAD_ERROR]: ({
        graphName,
        nodeId,
        prop,
        error,
    }) => R.assocPath([graphName, 'files', nodeId, prop, 'error'], error),
};
