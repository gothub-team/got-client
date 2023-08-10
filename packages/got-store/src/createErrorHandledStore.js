/* eslint-disable consistent-return */
import { validateInput } from './errors.js';

export const createErrorHandledStore = (options, store) => {
    const {
        api,
        dispatch,
        select,
        onError = console.error,
        onWarn = console.warn,
    } = options || {};

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
        if (
            validateError({
                dispatch,
                fromGraphName,
                toGraphName,
            })
        ) {
            return store.merge(fromGraphName, toGraphName);
        }
    };
    const mergeGraph = (fromGraph, toGraphName) => {
        if (
            validateError({
                dispatch,
                fromGraph,
                toGraphName,
            })
        ) {
            return store.mergeGraph(fromGraph, toGraphName);
        }
    };
    const mergeOverwriteGraph = (fromGraph, toGraphName) => {
        if (
            validateError({
                dispatch,
                fromGraph,
                toGraphName,
            })
        ) {
            return store.mergeOverwriteGraph(fromGraph, toGraphName);
        }
    };
    const clear = graphName => {
        if (
            validateError({
                graphName,
            })
        ) {
            return store.clear(graphName);
        }
    };
    const clearAll = () => store.clearAll();

    const selectVar = (stack, name, state) => {
        if (
            validateError({
                stack,
                name,
            })
        ) {
            return store.selectVar(stack, name, state);
        }
    };
    const getVar = (stack, name) => {
        if (
            validateError({
                select,
                stack,
                name,
            })
        ) {
            return store.getVar(stack, name);
        }
    };
    const setVar = (graphName, name, value) => {
        if (
            validateError({
                dispatch,
                graphName,
                name,
            })
        ) {
            return store.setVar(graphName, name, value);
        }
    };

    const selectNode = (stack, nodeId, state) => {
        if (
            validateError({
                stack,
                nodeId,
            })
        ) {
            return store.selectNode(stack, nodeId, state);
        }
    };
    const getNode = (stack, nodeId) => {
        if (
            validateError({
                select,
                stack,
                nodeId,
            })
        ) {
            return store.getNode(stack, nodeId);
        }
    };
    const setNode = (graphName, node) => {
        if (
            validateError({
                dispatch,
                graphName,
                node,
            })
        ) {
            return store.setNode(graphName, node);
        }
    };

    const selectMetadata = (stack, edgeTypes, fromId, toId, state) => {
        if (
            validateError({
                stack,
                edgeTypes,
                fromId,
                toId,
            })
        ) {
            return store.selectMetadata(stack, edgeTypes, fromId, toId, state);
        }
        return undefined;
    };
    const getMetadata = (stack, edgeTypes, fromId, toId) => {
        if (
            validateError({
                stack,
                edgeTypes,
                fromId,
                toId,
            })
        ) {
            return store.getMetadata(stack, edgeTypes, fromId, toId);
        }
        return undefined;
    };

    const selectEdge = (stack, edgeTypes, fromId, state) => {
        if (
            validateError({
                stack,
                edgeTypes,
                fromId,
            })
        ) {
            return store.selectEdge(stack, edgeTypes, fromId, state);
        }
        return {};
    };
    const getEdge = (stack, edgeTypes, fromId) => {
        if (
            validateError({
                select,
                stack,
                edgeTypes,
                fromId,
            })
        ) {
            return store.getEdge(stack, edgeTypes, fromId);
        }
        return {};
    };

    const selectReverseEdge = (stack, edgeTypes, toId, state) => {
        if (
            validateError({
                stack,
                edgeTypes,
                toId,
            })
        ) {
            return store.selectReverseEdge(stack, edgeTypes, toId, state);
        }
        return {};
    };
    const getReverseEdge = (stack, edgeTypes, toId) => {
        if (
            validateError({
                stack,
                edgeTypes,
                toId,
            })
        ) {
            return store.getReverseEdge(stack, edgeTypes, toId);
        }
        return {};
    };

    const add = (graphName, edgeTypes, fromId, toNode, metadata) => {
        if (
            validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })
        ) {
            return store.add(graphName, edgeTypes, fromId, toNode, metadata);
        }
    };
    const remove = (graphName, edgeTypes, fromId, toNode) => {
        if (
            validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })
        ) {
            return store.remove(graphName, edgeTypes, fromId, toNode);
        }
    };
    const assoc = (graphName, edgeTypes, fromId, toNode, metadata) => {
        if (
            validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })
        ) {
            return store.assoc(graphName, edgeTypes, fromId, toNode, metadata);
        }
    };
    const dissoc = (graphName, edgeTypes, fromId, toNode) => {
        if (
            validateError({
                dispatch,
                graphName,
                edgeTypes,
                fromId,
                toNode,
            })
        ) {
            return store.dissoc(graphName, edgeTypes, fromId, toNode);
        }
    };

    const selectRights = (stack, nodeId, state) => {
        if (
            validateError({
                stack,
                nodeId,
            })
        ) {
            return store.selectRights(stack, nodeId, state);
        }
    };
    const getRights = (stack, nodeId) => {
        if (
            validateError({
                select,
                stack,
                nodeId,
            })
        ) {
            return store.getRights(stack, nodeId);
        }
    };
    const setRights = (graphName, nodeId, email, rights) => {
        if (
            validateError({
                dispatch,
                graphName,
                nodeId,
                email,
                rights,
            })
        ) {
            return store.setRights(graphName, nodeId, email, rights);
        }
    };
    const setRoleRights = (graphName, nodeId, role, rights) => {
        if (
            validateError({
                dispatch,
                graphName,
                nodeId,
                role,
                rights,
            })
        ) {
            return store.setRoleRights(graphName, nodeId, role, rights);
        }
    };
    const inheritRights = (graphName, nodeId, fromId) => {
        if (
            validateError({
                dispatch,
                graphName,
                nodeId,
                fromId,
            })
        ) {
            return store.inheritRights(graphName, nodeId, fromId);
        }
    };

    const selectFiles = (stack, nodeId, state) => {
        if (
            validateError({
                stack,
                nodeId,
            })
        ) {
            return store.selectFiles(stack, nodeId, state);
        }
    };
    const getFiles = (stack, nodeId) => {
        if (
            validateError({
                select,
                stack,
                nodeId,
            })
        ) {
            return store.getFiles(stack, nodeId);
        }
    };
    const setFile = (graphName, nodeId, prop, filename, file) => {
        if (
            validateError({
                dispatch,
                graphName,
                nodeId,
                prop,
                filename,
                file,
            })
        ) {
            return store.setFile(graphName, nodeId, prop, filename, file);
        }
    };
    const removeFile = (graphName, nodeId, prop) => {
        if (
            validateError({
                dispatch,
                graphName,
                nodeId,
                prop,
            })
        ) {
            return store.removeFile(graphName, nodeId, prop);
        }
    };

    const push = async (graphName, toGraphName = 'main') => {
        if (
            validateError({
                api,
                dispatch,
                select,
                graphName,
            })
        ) {
            try {
                const res = await store.push(graphName, toGraphName);
                return res;
            } catch (error) {
                return onError && onError(error);
            }
        }
    };
    const pull = async (view, toGraphName = 'main') => {
        if (
            validateError({
                api,
                dispatch,
                view,
            })
        ) {
            try {
                const res = await store.pull(view, toGraphName);
                return res;
            } catch (error) {
                return onError && onError(error);
            }
        }
    };

    const selectView = (stack, view, state) => {
        if (
            validateError({
                stack,
                view,
            })
        ) {
            return store.selectView(stack, view, state);
        }
    };
    const getView = (stack, view) => {
        if (
            validateError({
                select,
                stack,
                view,
            })
        ) {
            return store.getView(stack, view);
        }
    };

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
