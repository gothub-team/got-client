/* eslint-disable default-param-last */
/* eslint-disable consistent-return */
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { forEachCondObj, mergeLeft, useSubscriber, useResult } from '@gothub-team/got-util';
import {
    createSuccessAndErrorGraphs,
    selectPathFromStack,
    pickMapGraph,
    mergeGraphsRight,
    getNodeStack,
    nodeFromNodeStack,
    getEdgeStack,
    metadataFromEdgeStack,
    edgeFromEdgeStack,
    getReverseEdgeStack,
    getRightStack,
    rightFromRightStack,
    getFileStack,
    filesFromFileStack,
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

export const createRawStore = ({ api, dispatch, select }) => {
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
    const clear = (graphName) => {
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
    const getVar = (stack, name) => select((state) => selectVar(stack, name, state));
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

    const selectNode = (stack, nodeId, state) => {
        const nodeStack = getNodeStack(state, stack);
        return nodeFromNodeStack(nodeStack, nodeId);
    };
    const getNode = (stack, nodeId) => select((state) => selectNode(stack, nodeId, state));
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
        const edgeStack = getEdgeStack(state, stack);
        return metadataFromEdgeStack(edgeStack, fromType, fromId, toType, toId);
    };
    const getMetadata = (stack, edgeTypes, fromId, toId) =>
        select((state) => selectMetadata(stack, edgeTypes, fromId, toId, state));

    const selectEdge = (stack, edgeTypes, fromId, state) => {
        const [fromType, toType] = R.split('/', edgeTypes);

        const edgeStack = getEdgeStack(state, stack);
        return edgeFromEdgeStack(edgeStack, fromType, fromId, toType);
    };
    const getEdge = (stack, edgeTypes, fromId) => select((state) => selectEdge(stack, edgeTypes, fromId, state));

    const selectReverseEdge = (stack, edgeTypes, toId, state) => {
        const [fromType, toType] = R.split('/', edgeTypes);

        const reverseEdgeStack = getReverseEdgeStack(state, stack);
        const edgeStack = getEdgeStack(state, stack);

        const fromIds = Object.keys(edgeFromEdgeStack(reverseEdgeStack, toType, toId, fromType));

        const edge = {};
        for (let i = 0; i < fromIds.length; i += 1) {
            const fromId = fromIds[i];
            const metadata = metadataFromEdgeStack(edgeStack, fromType, fromId, toType, toId);
            if (metadata) {
                edge[fromId] = metadata;
            }
        }

        return edge;
    };
    const getReverseEdge = (stack, edgeTypes, toId) =>
        select((state) => selectReverseEdge(stack, edgeTypes, toId, state));

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

    const selectRights = (stack, nodeId, state) => {
        const rightStack = getRightStack(state, stack);
        return rightFromRightStack(rightStack, nodeId);
    };
    const getRights = (stack, nodeId) => select((state) => selectRights(stack, nodeId, state));
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

    const selectFiles = (stack, nodeId, state) => {
        const fileStack = getFileStack(state, stack);
        return filesFromFileStack(fileStack, nodeId);
    };
    const getFiles = (stack, nodeId) => select((state) => selectFiles(stack, nodeId, state));
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

        RA.isNotNilOrEmpty(successGraph) &&
            dispatch({
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

        RA.isNotNilOrEmpty(errorGraph) &&
            dispatch({
                type: GOT_ACTION_MERGE_ERROR,
                payload: {
                    fromGraph: errorGraph,
                    toGraphName: graphName,
                },
            });

        const { subscribe, subscriber } = useSubscriber();
        const uploadFiles = async () => {
            const [getUploads, setUploads] = useResult([]);
            forEachCondObj([[(_, path) => RA.lengthEq(2, path), (_, path) => setUploads(R.append(uploadFile(path)))]])(
                R.propOr({}, 'files', successGraph),
            );
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

                await api.upload(uploadUrls, file, {
                    contentType,
                    uploadId,
                    partSize,
                    onProgress: (progress) =>
                        subscriber.next({
                            type: GOT_ACTION_UPLOAD_PROGRESS,
                            payload: {
                                graphName: toGraphName,
                                nodeId,
                                prop,
                                progress,
                            },
                        }),
                });

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

        return apiResult;
    };

    const selectView = (stack, view, state) => {
        const nodeStack = getNodeStack(state, stack);
        const edgeStack = getEdgeStack(state, stack);
        const reverseEdgeStack = getReverseEdgeStack(state, stack);
        const fileStack = getFileStack(state, stack);
        const rightStack = getRightStack(state, stack);

        const queryNode = (queryObj, nodeId, node, metadata) => {
            const bag = { nodeId };
            const { include } = queryObj;

            // include node bag info
            if (include?.metadata && metadata) {
                bag.metadata = metadata;
            }
            if (include?.node) {
                bag.node = node;
            }
            if (include?.rights) {
                bag.rights = rightFromRightStack(rightStack, nodeId);
            }
            if (include?.files) {
                bag.files = filesFromFileStack(fileStack, nodeId);
            }

            // include edges
            const { edges } = queryObj;
            if (edges) {
                const keys = Object.keys(edges);
                for (let i = 0; i < keys.length; i += 1) {
                    const edgeTypes = keys[i];
                    const subQueryObj = edges[edgeTypes];
                    if (!subQueryObj) continue;
                    const edgeAlias = subQueryObj.as ?? edgeTypes;

                    bag[edgeAlias] = queryEdge(subQueryObj, edgeTypes, nodeId);
                }
            }

            return bag;
        };

        const queryEdge = (queryObj, edgeTypes, nodeId) => {
            const [fromType, toType] = edgeTypes.split('/');
            const edgeIds = queryObj.reverse
                ? edgeFromEdgeStack(reverseEdgeStack, toType, nodeId, fromType)
                : edgeFromEdgeStack(edgeStack, fromType, nodeId, toType);

            if (!edgeIds) return;

            const edgeBag = {};
            const keys = Object.keys(edgeIds);
            for (let i = 0; i < keys.length; i += 1) {
                const toId = keys[i];
                const metadata = queryObj.reverse
                    ? metadataFromEdgeStack(edgeStack, fromType, toId, toType, nodeId)
                    : edgeIds[toId];
                if (!metadata) continue;

                const toNode = nodeFromNodeStack(nodeStack, toId);
                if (!toNode) continue;

                edgeBag[toId] = queryNode(queryObj, toId, toNode, metadata);
            }

            return edgeBag;
        };

        const result = {};
        const rootIds = Object.keys(view);
        for (let i = 0; i < rootIds.length; i += 1) {
            const nodeId = rootIds[i];
            const queryObj = view[nodeId];
            if (!queryObj) continue;

            const nodeAlias = queryObj?.as ?? nodeId;
            const node = nodeFromNodeStack(nodeStack, nodeId);
            if (!node) continue;

            result[nodeAlias] = queryNode(queryObj, nodeId, node);
        }

        return result;
    };
    const getView = (stack, view) => select((state) => selectView(stack, view, state));

    return {
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
    };
};
