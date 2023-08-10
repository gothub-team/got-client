/* eslint-disable default-param-last */
/* eslint-disable consistent-return */
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import {
    forEachCondObj,
    mergeDeepLeft,
    mergeLeft,
    mergeWith,
    useSubscriber,
    useResult,
} from '@gothub-team/got-util';
import {
    createSuccessAndErrorGraphs,
    selectPathFromStack,
    pickMapGraph,
    selectNodeFromStack,
    selectEdgeFromStack,
    mergeGraphsRight,
} from '@gothub-team/got-core';
import {
    GOT_ACTION_ADD,
    GOT_ACTION_ASSOC,
    GOT_ACTION_CLEAR,
    GOT_ACTION_CLEAR_ALL,
    GOT_ACTION_DISSOC,
    GOT_ACTION_INHERIT_RIGHTS,
    GOT_ACTION_MERGE,
    GOT_ACTION_MERGE_ERROR,
    GOT_ACTION_MERGE_OVERWRITE,
    GOT_ACTION_REMOVE,
    GOT_ACTION_REMOVE_FILE,
    GOT_ACTION_SET_FILE,
    GOT_ACTION_SET_NODE,
    GOT_ACTION_SET_RIGHTS,
    GOT_ACTION_SET_ROLE_RIGHTS,
    GOT_ACTION_SET_VAR,
    GOT_ACTION_UPLOAD_COMPLETE,
    GOT_ACTION_UPLOAD_ERROR,
    GOT_ACTION_UPLOAD_PROGRESS,
} from './reducer.js';

export const createRawStore = ({
    api,
    dispatch,
    select,
}) => {
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
    const clearAll = () => {
        dispatch({
            type: GOT_ACTION_CLEAR_ALL,
        });
    };

    const selectVar = (stack, name, state) => selectPathFromStack(['vars', name], stack, mergeLeft, state);
    const getVar = (stack, name) => select(state => selectVar(stack, name, state));
    const setVar = (graphName, name, value) => {
        dispatch({
            type: GOT_ACTION_SET_VAR,
            payload: {
                graphName,
                name,
                value,
            },
        });
    };

    const selectNode = (stack, nodeId, state) => selectNodeFromStack(nodeId, stack, state);
    const getNode = (stack, nodeId) => select(state => selectNode(stack, nodeId, state));
    const setNode = (graphName, node) => {
        dispatch({
            type: GOT_ACTION_SET_NODE,
            payload: {
                graphName,
                node,
            },
        });
    };

    const selectMetadata = (stack, edgeTypes, fromId, toId, state) => {
        const [fromType, toType] = R.split('/', edgeTypes);
        return selectPathFromStack(['graph', 'edges', fromType, fromId, toType, toId], stack, mergeLeft, state);
    };
    const getMetadata = (stack, edgeTypes, fromId, toId) => select(state => selectMetadata(stack, edgeTypes, fromId, toId, state));

    const selectEdge = (stack, edgeTypes, fromId, state) => {
        const [fromType, toType] = R.split('/', edgeTypes);
        const edgeIds = selectEdgeFromStack(fromType, fromId, toType, stack, state);

        return R.pickBy(RA.isTruthy, edgeIds);
    };
    const getEdge = (stack, edgeTypes, fromId) => select(state => selectEdge(stack, edgeTypes, fromId, state));

    const selectReverseEdge = (stack, edgeTypes, toId, state) => {
        const [fromType, toType] = R.split('/', edgeTypes);
        const [getResult, setResult] = useResult({});

        const edgeIds = selectPathFromStack(['graph', 'index', 'reverseEdges', toType, toId, fromType], stack, mergeWith(mergeLeft), state);
        R.compose(
            R.forEachObjIndexed((val, fromId) => {
                if (val) {
                    const metadata = selectMetadata(stack, edgeTypes, fromId, toId, state);
                    metadata && setResult(R.assoc(fromId, metadata));
                }
            }),
        )(edgeIds);
        return getResult();
    };
    const getReverseEdge = (stack, edgeTypes, toId) => select(state => selectReverseEdge(stack, edgeTypes, toId, state));

    const add = (graphName, edgeTypes, fromId, toNode, metadata) => {
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
    const remove = (graphName, edgeTypes, fromId, toNode) => {
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
    const assoc = (graphName, edgeTypes, fromId, toNode, metadata) => {
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
    const dissoc = (graphName, edgeTypes, fromId, toNode) => {
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

    const selectRights = (stack, nodeId, state) => selectPathFromStack(['graph', 'rights', nodeId], stack, mergeDeepLeft, state);
    const getRights = (stack, nodeId) => select(state => selectRights(stack, nodeId, state));
    const setRights = (graphName, nodeId, email, rights) => {
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
    const setRoleRights = (graphName, nodeId, role, rights) => {
        dispatch({
            type: GOT_ACTION_SET_ROLE_RIGHTS,
            payload: {
                graphName,
                nodeId,
                role,
                rights,
            },
        });
    };
    const inheritRights = (graphName, nodeId, fromId) => {
        dispatch({
            type: GOT_ACTION_INHERIT_RIGHTS,
            payload: {
                graphName,
                nodeId,
                fromId,
            },
        });
    };

    const selectFiles = (stack, nodeId, state) => selectPathFromStack(['graph', 'files', nodeId], stack, mergeLeft, state);
    const getFiles = (stack, nodeId) => select(state => selectFiles(stack, nodeId, state));
    const setFile = (graphName, nodeId, prop, filename, file) => {
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
    const removeFile = (graphName, nodeId, prop) => {
        dispatch({
            type: GOT_ACTION_REMOVE_FILE,
            payload: {
                graphName,
                nodeId,
                prop,
            },
        });
    };

    const push = async (graphName, toGraphName = 'main') => {
        const graph = select(R.pathOr(false, [graphName, 'graph']));
        const fileStore = select(R.pathOr(false, [graphName, 'files']));
        const pushBody = R.omit(['index'], graph);
        const apiResult = graph ? await api.push(pushBody) : {};

        const [successGraph, errorGraph] = createSuccessAndErrorGraphs(graph, apiResult);

        RA.isNotNilOrEmpty(successGraph) && dispatch({
            type: GOT_ACTION_MERGE,
            payload: {
                fromGraph: successGraph,
                toGraphName,
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
                        graphName: toGraphName,
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
                                graphName: toGraphName,
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
                        graphName: toGraphName,
                        nodeId,
                        prop,
                    },
                });
            } catch (error) {
                subscriber.next({
                    type: GOT_ACTION_UPLOAD_ERROR,
                    payload: {
                        graphName: toGraphName,
                        nodeId,
                        prop,
                        error,
                    },
                });
            }
        };

        return { uploads: { subscribe, start: uploadFiles } };
    };
    const pull = async (view, toGraphName = 'main') => {
        const toGraph = select(R.pathOr(false, [toGraphName, 'graph']));
        const apiResult = api.pull(view);
        const falseGraph = pickMapGraph(RA.stubUndefined, view, toGraph);

        const fromGraph = mergeGraphsRight(falseGraph, await apiResult);

        dispatch({
            type: GOT_ACTION_MERGE_OVERWRITE,
            payload: {
                fromGraph,
                toGraphName,
            },
        });
    };
    const selectView = (stack, view, state) => {
        const queryNode = (queryObj, nodeId, metadata) => {
            const bag = { nodeId };
            const { include } = queryObj;

            // include node bag info
            if (include?.metadata && metadata) {
                bag.metadata = metadata;
            }
            if (include?.node) {
                bag.node = selectNode(stack, nodeId, state);
            }
            if (include?.rights) {
                bag.rights = selectRights(stack, nodeId, state);
            }
            if (include?.files) {
                bag.files = selectFiles(stack, nodeId, state);
            }

            // include edges
            const { edges } = queryObj;
            if (edges) {
                const keys = Object.keys(edges);
                for (let i = 0; i < keys.length; i += 1) {
                    const edgeTypes = keys[i];
                    const edgeAlias = edges[edgeTypes].as ?? edgeTypes;

                    bag[edgeAlias] = queryEdge(edges[edgeTypes], edgeTypes, nodeId);
                }
            }

            return bag;
        };

        const queryEdge = (queryObj, edgeTypes, nodeId) => {
            const [fromType, toType] = R.split('/', edgeTypes);
            const edgeIds = queryObj.reverse ? selectPathFromStack(['graph', 'index', 'reverseEdges', toType, nodeId, fromType], stack, mergeWith(mergeLeft), state) : selectEdgeFromStack(fromType, nodeId, toType, stack, state);

            if (!edgeIds) return;

            const edgeBag = {};
            const keys = Object.keys(edgeIds);
            const values = Object.values(edgeIds);
            for (let i = 0; i < keys.length; i += 1) {
                const toId = keys[i];
                const metadata = queryObj.reverse ? selectMetadata(stack, edgeTypes, toId, nodeId, state) : values[i];
                if (!metadata) return;

                if (metadata) {
                    edgeBag[toId] = queryNode(queryObj, toId, metadata);
                }
            }

            return edgeBag;
        };

        const result = {};
        R.forEachObjIndexed((nestedQueryObj, nodeId) => {
            const nodeAlias = nestedQueryObj.as ?? nodeId;

            result[nodeAlias] = queryNode(nestedQueryObj, nodeId);
        }, view);

        return result;
    };
    const getView = (stack, view) => select(state => selectView(stack, view, state));

    return ({
        merge,
        mergeGraph,
        mergeOverwriteGraph,
        clear,
        clearAll,

        selectVar,
        getVar,
        setVar,

        selectNode,
        getNode,
        setNode,

        selectMetadata,
        getMetadata,

        selectEdge,
        getEdge,
        selectReverseEdge,
        getReverseEdge,
        add,
        remove,
        assoc,
        dissoc,

        selectRights,
        getRights,
        setRights,
        setRoleRights,
        inheritRights,

        selectFiles,
        getFiles,
        setFile,
        removeFile,

        push,
        pull,

        selectView,
        getView,
    });
};
