import * as R from 'ramda';

export const configureCreateGraph =
    (store) =>
    (...stack) => {
        const currentGraphName = R.nth(-1, stack);
        const nextBelowGraphName = R.nth(-2, stack);
        const bottomGraphName = R.head(stack);

        const getVar = store.getVar(...stack);
        const setVar = store.setVar(currentGraphName);

        const push = () => store.push(currentGraphName, bottomGraphName);
        const pull = (view) => store.pull(view, bottomGraphName);
        const getView = store.getView(...stack);
        const merge = (toGraphName) => {
            if (toGraphName) {
                store.merge(currentGraphName, toGraphName);
            } else {
                store.merge(currentGraphName, nextBelowGraphName);
            }
        };
        const mergeGraph = (fromGraph, toGraphName) => {
            if (toGraphName) {
                store.mergeGraph(fromGraph, toGraphName);
            } else {
                store.mergeGraph(fromGraph, currentGraphName);
            }
        };
        const clear = () => store.clear(currentGraphName);
        const node = store.getNode(...stack);
        const update = store.setNode(currentGraphName);
        const edge = store.getEdge(...stack);
        const metadata = store.getMetadata(...stack);
        const add = store.add(currentGraphName);
        const remove = store.remove(currentGraphName);
        const assoc = store.assoc(currentGraphName);
        const dissoc = store.dissoc(currentGraphName);
        const rights = store.getRights(...stack);
        const setRights = store.setRights(currentGraphName);
        const setRoleRights = store.setRoleRights(currentGraphName);
        const inheritRights = store.inheritRights(currentGraphName);
        const files = store.getFiles(...stack);
        const setFile = store.setFile(currentGraphName);
        const removeFile = store.removeFile(currentGraphName);

        return {
            getVar,
            setVar,
            push,
            pull,
            getView,
            merge,
            mergeGraph,
            clear,
            node,
            update,
            edge,
            metadata,
            add,
            remove,
            assoc,
            dissoc,
            rights,
            setRights,
            setRoleRights,
            inheritRights,
            files,
            setFile,
            removeFile,
        };
    };
