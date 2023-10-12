import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { convergeOverPaths, mergeLeft, overPath, generateNewRandom } from '@gothub-team/got-util';
import { mergeOverwriteGraphsLeft, mergeGraphsLeft } from '@gothub-team/got-core';

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
export const GOT_ACTION_SET_ROLE_RIGHTS = 'GOT/SET_ROLE_RIGHTS';
export const GOT_ACTION_INHERIT_RIGHTS = 'GOT/INHERIT_RIGHTS';
export const GOT_ACTION_SET_FILE = 'GOT/SET_FILE';
export const GOT_ACTION_REMOVE_FILE = 'GOT/REMOVE_FILE';
export const GOT_ACTION_UPLOAD_PROGRESS = 'GOT/UPLOAD_PROGRESS';
export const GOT_ACTION_UPLOAD_COMPLETE = 'GOT/UPLOAD_COMPLETE';
export const GOT_ACTION_UPLOAD_ERROR = 'GOT/UPLOAD_ERROR';

export const gotReducer = (state = {}, action) => {
    const reducer = reducers[action.type];
    if (reducer) {
        return R.compose(reducer(action.payload), R.over(R.lensProp('stateId'), generateNewRandom))(state);
    }

    return state;
};

const reducers = {
    [GOT_ACTION_MERGE]: ({ falseGraph, fromGraph, fromGraphName, toGraphName }) =>
        R.pipe(
            R.when(
                R.always(RA.isNotNilOrEmpty(fromGraphName)),
                convergeOverPaths(
                    [toGraphName, 'graph'],
                    [
                        [fromGraphName, 'graph'],
                        [toGraphName, 'graph'],
                    ],
                    mergeGraphsLeft,
                ),
            ),
            R.when(R.always(RA.isObj(falseGraph)), overPath([toGraphName, 'graph'], mergeGraphsLeft(falseGraph))),
            R.when(R.always(RA.isObj(fromGraph)), overPath([toGraphName, 'graph'], mergeGraphsLeft(fromGraph))),
        ),
    [GOT_ACTION_MERGE_ERROR]: ({ fromGraph, toGraphName }) =>
        R.when(R.always(RA.isObj(fromGraph)), overPath([toGraphName, 'errors'], mergeGraphsLeft(fromGraph))),
    [GOT_ACTION_MERGE_OVERWRITE]: ({ fromGraph, toGraphName }) =>
        R.when(R.always(RA.isObj(fromGraph)), overPath([toGraphName, 'graph'], mergeOverwriteGraphsLeft(fromGraph))),
    [GOT_ACTION_CLEAR]: ({ graphName }) => R.dissoc(graphName),
    [GOT_ACTION_CLEAR_ALL]: () => R.always({}),
    [GOT_ACTION_SET_VAR]: ({ graphName, name, value }) => R.assocPath([graphName, 'vars', name], value),

    [GOT_ACTION_SET_NODE]: ({ graphName, node }) => overPath([graphName, 'graph', 'nodes', node.id], mergeLeft(node)),

    [GOT_ACTION_ADD]: ({ graphName, fromType, toType, fromId, toNode, metadata = true }) =>
        R.compose(
            R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], true),
            overPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], mergeLeft(metadata)),
            overPath([graphName, 'graph', 'nodes', toNode.id], mergeLeft(toNode)),
        ),
    [GOT_ACTION_REMOVE]: ({ graphName, fromType, toType, fromId, toNode }) =>
        R.compose(
            R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], false),
            R.assocPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], false),
            R.assocPath([graphName, 'graph', 'nodes', toNode.id], false),
        ),
    [GOT_ACTION_ASSOC]: ({ graphName, fromType, toType, fromId, toNode, metadata = true }) =>
        R.compose(
            R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], true),
            overPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], mergeLeft(metadata)),
        ),
    [GOT_ACTION_DISSOC]: ({ graphName, fromType, toType, fromId, toNode }) =>
        R.compose(
            R.assocPath([graphName, 'graph', 'index', 'reverseEdges', toType, toNode.id, fromType, fromId], false),
            R.assocPath([graphName, 'graph', 'edges', fromType, fromId, toType, toNode.id], false),
        ),
    [GOT_ACTION_SET_RIGHTS]: ({ graphName, nodeId, email, rights }) =>
        overPath([graphName, 'graph', 'rights', nodeId, 'user', email], mergeLeft(rights)),
    [GOT_ACTION_SET_ROLE_RIGHTS]: ({ graphName, nodeId, role, rights }) =>
        overPath([graphName, 'graph', 'rights', nodeId, 'role', role], mergeLeft(rights)),
    [GOT_ACTION_INHERIT_RIGHTS]: ({ graphName, nodeId, fromId }) =>
        R.assocPath([graphName, 'graph', 'rights', nodeId, 'inherit', 'from'], fromId),
    [GOT_ACTION_SET_FILE]: ({ graphName, nodeId, prop, filename, file }) =>
        R.compose(
            R.assocPath([graphName, 'files', nodeId, prop], { file }),
            R.assocPath([graphName, 'graph', 'files', nodeId, prop], {
                filename,
                contentType: file.type,
                fileSize: file.size,
            }),
        ),
    [GOT_ACTION_REMOVE_FILE]: ({ graphName, nodeId, prop }) =>
        R.compose(
            R.dissocPath([graphName, 'files', nodeId, prop]),
            R.assocPath([graphName, 'graph', 'files', nodeId, prop], false),
        ),
    [GOT_ACTION_UPLOAD_PROGRESS]: ({ graphName, nodeId, prop, progress }) =>
        R.assocPath([graphName, 'files', nodeId, prop, 'progress'], progress),
    [GOT_ACTION_UPLOAD_COMPLETE]: ({ graphName, nodeId, prop }) =>
        R.assocPath([graphName, 'files', nodeId, prop, 'complete'], true),
    [GOT_ACTION_UPLOAD_ERROR]: ({ graphName, nodeId, prop, error }) =>
        R.assocPath([graphName, 'files', nodeId, prop, 'error'], error),
};
