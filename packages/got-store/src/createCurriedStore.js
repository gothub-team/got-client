export const createCurriedStore = store => {
    const merge = (fromGraphName, toGraphName) => store.merge(fromGraphName, toGraphName);
    const mergeGraph = (fromGraph, toGraphName) => store.mergeGraph(fromGraph, toGraphName);
    const mergeOverwriteGraph = (fromGraph, toGraphName) => store.mergeOverwriteGraph(fromGraph, toGraphName);
    const clear = graphName => store.clear(graphName);
    const clearAll = () => store.clearAll();

    const selectVar = (...stack) => name => state => store.selectVar(stack, name, state);
    const getVar = (...stack) => name => store.getVar(stack, name);
    const setVar = graphName => (name, value) => store.setVar(graphName, name, value);

    const selectNode = (...stack) => nodeId => state => store.selectNode(stack, nodeId, state);
    const getNode = (...stack) => nodeId => store.getNode(stack, nodeId);
    const setNode = graphName => node => store.setNode(graphName, node);

    const selectMetadata = (...stack) => edgeTypes => fromId => toId => state => store.selectMetadata(stack, edgeTypes, fromId, toId, state);
    const getMetadata = (...stack) => edgeTypes => fromId => toId => store.getMetadata(stack, edgeTypes, fromId, toId);

    const selectEdge = (...stack) => edgeTypes => fromId => state => store.selectEdge(stack, edgeTypes, fromId, state);
    const getEdge = (...stack) => edgeTypes => fromId => store.getEdge(stack, edgeTypes, fromId);
    const selectReverseEdge = (...stack) => edgeTypes => toId => state => store.selectReverseEdge(stack, edgeTypes, toId, state);
    const getReverseEdge = (...stack) => edgeTypes => toId => store.getReverseEdge(stack, edgeTypes, toId);
    const add = graphName => edgeTypes => fromId => (toNode, metadata) => store.add(graphName, edgeTypes, fromId, toNode, metadata);
    const remove = graphName => edgeTypes => fromId => toNode => store.remove(graphName, edgeTypes, fromId, toNode);
    const assoc = graphName => edgeTypes => fromId => (toNode, metadata) => store.assoc(graphName, edgeTypes, fromId, toNode, metadata);
    const dissoc = graphName => edgeTypes => fromId => toNode => store.dissoc(graphName, edgeTypes, fromId, toNode);

    const selectRights = (...stack) => nodeId => state => store.selectRights(stack, nodeId, state);
    const getRights = (...stack) => nodeId => store.getRights(stack, nodeId);
    const setRights = graphName => nodeId => (email, rights) => store.setRights(graphName, nodeId, email, rights);
    const setRoleRights = graphName => nodeId => (role, rights) => store.setRoleRights(graphName, nodeId, role, rights);
    const inheritRights = graphName => nodeId => fromId => store.inheritRights(graphName, nodeId, fromId);

    const selectFiles = (...stack) => nodeId => state => store.selectFiles(stack, nodeId, state);
    const getFiles = (...stack) => nodeId => store.getFiles(stack, nodeId);
    const setFile = graphName => nodeId => (prop, filename, file) => store.setFile(graphName, nodeId, prop, filename, file);
    const removeFile = graphName => nodeId => prop => store.removeFile(graphName, nodeId, prop);

    const push = async (graphName, toGraphName) => store.push(graphName, toGraphName);
    const pull = async (view, toGraphName) => store.pull(view, toGraphName);
    const selectView = (...stack) => view => state => store.selectView(stack, view, state);

    const getView = (...stack) => view => store.getView(stack, view);

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
