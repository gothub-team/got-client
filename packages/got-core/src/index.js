/* eslint-disable default-param-last */
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import {
    getPath,
    mergeDeepLeft,
    mergeLeft,
    reduceObj,
    useResult,
    getPathOr,
    assocPathMutate,
    forEachObjDepth,
    dissocPathMutate,
    mergeGraphObjRight,
    mergeDeepRight,
} from '@gothub-team/got-util';

export const isEdgeTypesString = R.compose(
    ([fromType, toType]) => RA.lengthGt(0, fromType) && RA.lengthGt(0, toType),
    R.split('/'),
);

export const isNodesPath = R.pipe(R.head, R.equals('nodes'));
export const isNodePath = R.allPass([isNodesPath, RA.lengthEq(2)]);
export const isEdgesPath = R.pipe(R.head, R.equals('edges'));
export const isMetadataPath = R.allPass([isEdgesPath, RA.lengthEq(5)]);
export const isRightsPath = R.pipe(R.head, R.equals('rights'));
export const isRightPath = R.allPass([isRightsPath, RA.lengthEq(2)]);
export const isFilesPath = R.pipe(R.head, R.equals('files'));
export const isNodeFilesPath = R.allPass([isFilesPath, RA.lengthEq(2)]);
export const isIndexPath = R.pipe(R.head, R.equals('index'));
export const isReverseEdgesPath = R.pipe(R.nth(1), R.equals('reverseEdges'));
export const isReverseEdgesIndexPath = R.allPass([RA.lengthEq(6), isIndexPath, isReverseEdgesPath]);

const mergeObjRight = (depth, fnMerge) => (left, right) => {
    if (!right) return left;

    const [getResult, , overResult] = useResult(left ?? {});
    forEachObjDepth(
        right,
        (valRight, path) => {
            // console.log(valRight, path);
            if (typeof valRight === 'undefined') {
                overResult(assocPathMutate(path, undefined));
            } else {
                const valLeft = getPath(path, left);
                const merged = fnMerge(valRight, valLeft);
                overResult(assocPathMutate(path, merged));
            }
        },
        depth,
    );

    return getResult();
};

const mergeNodesRight = mergeObjRight(1, mergeLeft);
const mergeEdgesRight = mergeObjRight(4, mergeLeft);
const mergeRightsRight = mergeObjRight(1, mergeDeepLeft);
const mergeFilesRight = mergeObjRight(1, mergeLeft);
const mergeIndexRight = mergeObjRight(1, mergeDeepLeft);

export const mergeGraphsRight = R.curry((left, right) => {
    if (!right) return left;
    if (!left) return right;

    const [getResult, setResult] = useResult(left);

    const nodes = mergeNodesRight(left?.nodes, right?.nodes);
    nodes && setResult(R.assocPath(['nodes'], nodes));

    const edges = mergeEdgesRight(left?.edges, right?.edges);
    edges && setResult(R.assocPath(['edges'], edges));

    const rights = mergeRightsRight(left?.rights, right?.rights);
    rights && setResult(R.assocPath(['rights'], rights));

    const files = mergeFilesRight(left?.files, right?.files);
    files && setResult(R.assocPath(['files'], files));

    const index = mergeIndexRight(left?.index, right?.index);
    index && setResult(R.assocPath(['index'], index));

    return getResult();
});
export const mergeGraphsLeft = R.flip(mergeGraphsRight);

const overwriteObjRight = (depth) => (left, right) => {
    if (!right) return left;

    const [getResult, , overResult] = useResult(left ?? {});
    forEachObjDepth(
        right,
        (valRight, path) => {
            if (typeof valRight === 'undefined') {
                overResult(dissocPathMutate(path));
                return;
            }

            if (valRight === false || typeof valRight === 'object') {
                overResult(assocPathMutate(path, valRight));
                return;
            }

            const valLeft = getPath(path, left);
            if (!(valRight === true && typeof valLeft === 'object')) {
                overResult(assocPathMutate(path, valRight));
                return;
            }

            overResult(assocPathMutate(path, valLeft));
        },
        depth,
    );

    return getResult();
};

const overwriteNodesRight = overwriteObjRight(1);
const overwriteEdgesRight = overwriteObjRight(4);
const overwriteRightsRight = overwriteObjRight(1);
const overwriteFilesRight = overwriteObjRight(1);
const overwriteIndexRight = overwriteObjRight(5);

export const mergeOverwriteGraphsRight = R.curry((left, right) => {
    if (!right) return left;
    if (!left) return right;

    const [getResult, setResult] = useResult(left);

    const nodes = overwriteNodesRight(left?.nodes, right?.nodes);
    nodes && setResult(R.assocPath(['nodes'], nodes));

    const edges = overwriteEdgesRight(left?.edges, right?.edges);
    edges && setResult(R.assocPath(['edges'], edges));

    const rights = overwriteRightsRight(left?.rights, right?.rights);
    rights && setResult(R.assocPath(['rights'], rights));

    const files = overwriteFilesRight(left?.files, right?.files);
    files && setResult(R.assocPath(['files'], files));

    const index = overwriteIndexRight(left?.index, right?.index);
    index && setResult(R.assocPath(['index'], index));

    return getResult();
});
export const mergeOverwriteGraphsLeft = R.flip(mergeOverwriteGraphsRight);

export const includeNode = getPathOr(false, ['include', 'node']);
export const includeRights = getPathOr(false, ['include', 'rights']);
export const includeEdges = getPathOr(false, ['include', 'edges']);
export const includeMetadata = getPathOr(false, ['include', 'metadata']);
export const isReverse = R.propOr(false, 'reverse');
export const includeFiles = getPathOr(false, ['include', 'files']);

export const doViewGraph = R.curry(({ nodes: fnNodes, edges: fnEdges }, view, fnGetEdgeToIds) => {
    const _INNER_RECURSION = (
        queryObj,
        nodeId,
        edgePath, // undefined
        viewPath = [],
        metadata,
    ) => {
        const nodeAlias = edgePath ? nodeId : queryObj.as || nodeId;
        const nodeViewPath = R.concat(viewPath, [nodeAlias]);
        fnNodes && fnNodes(queryObj, nodeId, edgePath, nodeViewPath, metadata);
        R.mapObjIndexed((nestedQueryObj, edgeTypes) => {
            const edgeAlias = nestedQueryObj.as || edgeTypes;
            const edgeViewPath = R.concat(nodeViewPath, [edgeAlias]);
            fnEdges && fnEdges(nestedQueryObj, nodeId, edgeTypes, edgeViewPath);
            if (nestedQueryObj.reverse) {
                return R.compose(
                    ([fromType, toType]) =>
                        R.compose(
                            R.mapObjIndexed((toMetadata, fromId) =>
                                _INNER_RECURSION(
                                    nestedQueryObj,
                                    fromId,
                                    ['edges', fromType, fromId, toType, nodeId],
                                    edgeViewPath,
                                    toMetadata,
                                ),
                            ),
                            fnGetEdgeToIds,
                        )(fromType, nodeId, toType, { reverse: true }),
                    R.split('/'),
                )(edgeTypes);
            }
            return R.compose(
                ([fromType, toType]) =>
                    R.compose(
                        R.mapObjIndexed((toMetadata, toId) =>
                            _INNER_RECURSION(
                                nestedQueryObj,
                                toId,
                                ['edges', fromType, nodeId, toType, toId],
                                edgeViewPath,
                                toMetadata,
                            ),
                        ),
                        fnGetEdgeToIds,
                    )(fromType, nodeId, toType),
                R.split('/'),
            )(edgeTypes);
        })(R.propOr({}, 'edges', queryObj));
    };
    R.mapObjIndexed((queryObj, nodeId) => _INNER_RECURSION(queryObj, nodeId))(view);
});

export const pickMapGraph = R.curry((fnMap, view, graph) => {
    const [getResult, setResult] = useResult({});
    doViewGraph(
        {
            nodes: (queryObj, nodeId, edgePath) => {
                const nodePath = ['nodes', nodeId];
                const rightsPath = ['rights', nodeId];
                const filesPath = ['files', nodeId];
                const [, fromType, fromId, toType, toId] = edgePath || [];
                const reverseEdgePath = ['index', 'reverseEdges', toType, toId, fromType, fromId];

                const metadata = includeEdges(queryObj) && edgePath ? R.path(edgePath, graph) : undefined;
                const reverseEdge = isReverse(queryObj) && edgePath ? R.path(reverseEdgePath, graph) : undefined;
                const node = includeNode(queryObj) ? R.path(nodePath, graph) : undefined;
                const rights = includeRights(queryObj) ? R.path(rightsPath, graph) : undefined;
                const files = includeFiles(queryObj) ? R.path(filesPath, graph) : undefined;

                RA.isNotUndefined(metadata) && setResult(R.assocPath(edgePath, fnMap(metadata, edgePath)));
                RA.isNotUndefined(reverseEdge) &&
                    setResult(R.assocPath(reverseEdgePath, fnMap(reverseEdge, reverseEdgePath)));
                RA.isNotUndefined(node) && setResult(R.assocPath(nodePath, fnMap(node, nodePath)));
                RA.isNotUndefined(rights) && setResult(R.assocPath(rightsPath, fnMap(rights, rightsPath)));
                RA.isNotUndefined(files) && setResult(R.assocPath(filesPath, fnMap(files, filesPath)));
            },
        },
        view,
        selectEdgeToIds(graph),
    );
    return getResult();
});

export const filterGraph = pickMapGraph(R.identity);

export const selectPathFromStack = (path, stack, fnMergeLeft, state) => {
    if (!path || !stack || !fnMergeLeft || !state) {
        return undefined;
    }

    let acc;
    // TODO: if we went from the back, we could stop when we found a "stopper" value like null or false (overwrite a previous deletion)
    for (let i = 0; i < stack.length; i += 1) {
        const graphName = stack[i];
        const val = getPath([graphName, ...path], state);
        if (val !== undefined) {
            acc = fnMergeLeft(val)(acc);
        }
    }
    return acc;
};

export const selectEdgeToIds =
    (graph) =>
    (fromType, nodeId, toType, { reverse } = {}) =>
        reverse
            ? R.pathOr({}, ['index', 'reverseEdges', toType, nodeId, fromType], graph)
            : R.pathOr({}, ['edges', fromType, nodeId, toType], graph);

export const createSuccessAndErrorGraphs = (graph, apiResult) =>
    reduceObj([
        [
            R.propEq(200, 'statusCode'),
            (val, path) =>
                R.compose(
                    R.when(R.always(R.head(path) === 'edges'), (acc) => {
                        const [, fromType, fromId, toType, toId] = path;
                        const reverseEdgesPath = ['index', 'reverseEdges', toType, toId, fromType, fromId];
                        return R.when(
                            R.always(R.hasPath(reverseEdgesPath, graph)),
                            R.assocPath(reverseEdgesPath, R.path(reverseEdgesPath, graph)),
                        )(acc);
                    }),
                    R.assocPath(path, R.path(path, graph)),
                ),
        ],
        [
            R.propEq(403, 'statusCode'),
            (val, path) =>
                R.compose(
                    R.when(R.always(R.head(path) === 'edges'), (acc) => {
                        const [, fromType, fromId, toType, toId] = path;
                        const reverseEdgesPath = ['index', 'reverseEdges', toType, toId, fromType, fromId];
                        return R.when(
                            R.always(R.hasPath(reverseEdgesPath, graph)),
                            R.assocPath(reverseEdgesPath, R.assoc('element', R.path(reverseEdgesPath, graph), val)),
                        )(acc);
                    }),
                    R.assocPath(path, R.assoc('element', R.path(path, graph), val)),
                ),
        ],
    ])(apiResult);

const getAnyStack = (fnSelect) => (state, stack) => {
    let acc = [];
    for (let i = 0; i < stack.length; i += 1) {
        const graphName = stack[i];
        const val = fnSelect(state, graphName);
        val && acc.push(val);
    }
    return acc;
};

export const getNodeStack = getAnyStack((state, graphName) => state[graphName]?.graph?.nodes);
export const getEdgeStack = getAnyStack((state, graphName) => state[graphName]?.graph?.edges);
export const getReverseEdgeStack = getAnyStack((state, graphName) => state[graphName]?.graph?.index?.reverseEdges);
export const getRightStack = getAnyStack((state, graphName) => state[graphName]?.graph?.rights);
export const getFileStack = getAnyStack((state, graphName) => state[graphName]?.graph?.files);

export const nodeFromNodeStack = (nodeStack, nodeId) => {
    let acc;
    for (let i = 0; i < nodeStack.length; i += 1) {
        const node = nodeStack[i][nodeId];
        acc = mergeGraphObjRight(acc, node);
    }
    return acc;
};

export const edgeFromEdgeStack = (edgeStack, fromType, fromId, toType) => {
    if (edgeStack.length === 0) return {};

    let acc = {};
    for (let i = 0; i < edgeStack.length; i += 1) {
        const edge = edgeStack[i][fromType]?.[fromId]?.[toType];
        if (edge != null) {
            const toIds = Object.keys(edge);
            for (let j = 0; j < toIds.length; j += 1) {
                const toId = toIds[j];
                const metadata = edge[toId];
                if (metadata) {
                    acc[toId] = mergeGraphObjRight(acc[toId], metadata);
                } else if (metadata === false || metadata === null) {
                    delete acc[toId];
                }
            }
        }
    }
    return acc;
};

export const metadataFromEdgeStack = (edgeStack, fromType, fromId, toType, toId) => {
    let acc;
    for (let i = 0; i < edgeStack.length; i += 1) {
        const node = edgeStack[i][fromType]?.[fromId]?.[toType]?.[toId];
        acc = mergeGraphObjRight(acc, node);
    }
    return acc;
};

export const rightFromRightStack = (rightStack, nodeId) => {
    let acc;
    for (let i = 0; i < rightStack.length; i += 1) {
        const node = rightStack[i][nodeId];
        acc = mergeDeepRight(acc, node);
    }
    return acc;
};

export const filesFromFileStack = (fileStack, nodeId) => {
    let acc;
    for (let i = 0; i < fileStack.length; i += 1) {
        const node = fileStack[i][nodeId];
        acc = mergeGraphObjRight(acc, node);
    }
    return acc;
};
