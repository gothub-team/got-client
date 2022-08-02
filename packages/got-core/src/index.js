/* eslint-disable default-param-last */
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import {
    forEachCondObj,
    getPath,
    mergeDeepLeft,
    mergeLeft,
    overPath,
    reduceObj,
    useResult,
    getPathOr,
} from '@gothub-team/got-util';

export const isEdgeTypesString = R.compose(
    ([fromType, toType]) => RA.lengthGt(0, fromType) && RA.lengthGt(0, toType),
    R.split('/'),
);

export const isNodesPath = R.pipe(R.head, R.equals('nodes'));
export const isNodePath = R.allPass([
    isNodesPath,
    RA.lengthEq(2),
]);
export const isEdgesPath = R.pipe(R.head, R.equals('edges'));
export const isMetadataPath = R.allPass([
    isEdgesPath,
    RA.lengthEq(5),
]);
export const isRightsPath = R.pipe(R.head, R.equals('rights'));
export const isRightPath = R.allPass([
    isRightsPath,
    RA.lengthEq(2),
]);
export const isFilesPath = R.pipe(R.head, R.equals('files'));
export const isNodeFilesPath = R.allPass([
    isFilesPath,
    RA.lengthEq(2),
]);
export const isIndexPath = R.pipe(R.head, R.equals('index'));
export const isReverseEdgesPath = R.pipe(R.nth(1), R.equals('reverseEdges'));
export const isReverseEdgesIndexPath = R.allPass([
    RA.lengthEq(6),
    isIndexPath,
    isReverseEdgesPath,
]);

export const mergeGraphsRight = R.curry((left, right) => {
    const [getResult, setResult] = useResult(left);
    forEachCondObj([
        // isNodePath
        [(val, path) => isNodePath(path),
            (val, path) => setResult(overPath(path, R.ifElse(
                R.always(RA.isUndefined(val)),
                RA.stubUndefined,
                mergeLeft(val),
            )))],
        // isMetadataPath
        [(val, path) => isMetadataPath(path),
            (val, path) => setResult(overPath(path, R.ifElse(
                R.always(RA.isUndefined(val)),
                RA.stubUndefined,
                mergeLeft(val),
            )))],
        // isRightsPath
        [(val, path) => isRightsPath(path),
            (val, path) => setResult(overPath(path, R.ifElse(
                R.always(RA.isUndefined(val)),
                RA.stubUndefined,
                mergeDeepLeft(val),
            )))],
        // isFilesPath
        [(val, path) => isNodeFilesPath(path),
            (val, path) => setResult(overPath(path, R.ifElse(
                R.always(RA.isUndefined(val)),
                RA.stubUndefined,
                mergeLeft(val),
            )))],
        // isReverseEdgesIndexPath
        [(val, path) => isReverseEdgesIndexPath(path),
            (val, path) => setResult(overPath(path, R.ifElse(
                R.always(RA.isUndefined(val)),
                RA.stubUndefined,
                mergeLeft(val),
            )))],
    ])(right);
    return getResult();
});
export const mergeGraphsLeft = R.flip(mergeGraphsRight);

const overwriteRight = R.curry((left, right) => {
    const shouldOverwrite = right === false || R.is(Object, right) || !(right === true && R.is(Object, left));
    if (shouldOverwrite) {
        return right;
    }
    return left;
});

export const overwriteLeft = R.flip(overwriteRight);

export const mergeOverwriteGraphsRight = R.curry((left, right) => {
    const [getResult, setResult] = useResult(left);
    const overwriteResult = (val, path) => setResult(
        R.ifElse(
            R.always(RA.isUndefined(val)),
            R.dissocPath(path),
            overPath(path, overwriteLeft(val)),
        ),
    );
    forEachCondObj([
        // isNodePath
        [(val, path) => isNodePath(path),
            overwriteResult],
        // isMetadataPath
        [(val, path) => isMetadataPath(path),
            overwriteResult],
        // isRightPath
        [(val, path) => isRightPath(path),
            overwriteResult],
        // isFilesPath
        [(val, path) => isNodeFilesPath(path),
            overwriteResult],
        // isReverseEdgesIndexPath
        [(val, path) => isReverseEdgesIndexPath(path),
            overwriteResult],
    ])(right);
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
        R.mapObjIndexed(
            (nestedQueryObj, edgeTypes) => {
                const edgeAlias = nestedQueryObj.as || edgeTypes;
                const edgeViewPath = R.concat(nodeViewPath, [edgeAlias]);
                fnEdges && fnEdges(nestedQueryObj, nodeId, edgeTypes, edgeViewPath);
                if (nestedQueryObj.reverse) {
                    return R.compose(
                        ([fromType, toType]) => R.compose(
                            R.mapObjIndexed((toMetadata, fromId) => _INNER_RECURSION(
                                nestedQueryObj,
                                fromId,
                                ['edges', fromType, fromId, toType, nodeId],
                                edgeViewPath,
                                toMetadata,
                            )),
                            fnGetEdgeToIds,
                        )(fromType, nodeId, toType, { reverse: true }),
                        R.split('/'),
                    )(edgeTypes);
                }
                return R.compose(
                    ([fromType, toType]) => R.compose(
                        R.mapObjIndexed((toMetadata, toId) => _INNER_RECURSION(
                            nestedQueryObj,
                            toId,
                            ['edges', fromType, nodeId, toType, toId],
                            edgeViewPath,
                            toMetadata,
                        )),
                        fnGetEdgeToIds,
                    )(fromType, nodeId, toType),
                    R.split('/'),
                )(edgeTypes);
            },
        )(R.propOr({}, 'edges', queryObj));
    };
    R.mapObjIndexed((queryObj, nodeId) => _INNER_RECURSION(queryObj, nodeId))(view);
});

export const pickMapGraph = R.curry((fnMap, view, graph) => {
    const [getResult, setResult] = useResult({});
    doViewGraph({
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

            RA.isNotUndefined(metadata) && setResult(
                R.assocPath(edgePath, fnMap(metadata, edgePath)),
            );
            RA.isNotUndefined(reverseEdge) && setResult(
                R.assocPath(reverseEdgePath, fnMap(reverseEdge, reverseEdgePath)),
            );
            RA.isNotUndefined(node) && setResult(
                R.assocPath(nodePath, fnMap(node, nodePath)),
            );
            RA.isNotUndefined(rights) && setResult(
                R.assocPath(rightsPath, fnMap(rights, rightsPath)),
            );
            RA.isNotUndefined(files) && setResult(
                R.assocPath(filesPath, fnMap(files, filesPath)),
            );
        },
    }, view, selectEdgeToIds(graph));
    return getResult();
});

export const filterGraph = pickMapGraph(R.identity);

export const selectPathFromStack = R.curry((path, stack, fnMergeLeft, state) => {
    if (!path || !stack || !fnMergeLeft || !state) {
        console.log('returning undefined');
        return undefined;
    }

    let acc;
    stack.forEach(graphName => {
        const val = getPath([graphName, ...path], state);
        if (val !== undefined) {
            acc = fnMergeLeft(val)(acc);
        }
    });
    return acc;
});

export const selectEdgeToIds = graph => (fromType, nodeId, toType, { reverse } = {}) => reverse
    ? R.pathOr({}, ['index', 'reverseEdges', toType, nodeId, fromType], graph)
    : R.pathOr({}, ['edges', fromType, nodeId, toType], graph);

export const createSuccessAndErrorGraphs = (graph, apiResult) => reduceObj([
    [R.propEq('statusCode', 200),
        (val, path) => R.compose(
            R.when(
                R.always(R.head(path) === 'edges'),
                acc => {
                    const [, fromType, fromId, toType, toId] = path;
                    const reverseEdgesPath = ['index', 'reverseEdges', toType, toId, fromType, fromId];
                    return R.when(
                        R.always(R.hasPath(reverseEdgesPath, graph)),
                        R.assocPath(
                            reverseEdgesPath,
                            R.path(reverseEdgesPath, graph),
                        ),
                    )(acc);
                },
            ),
            R.assocPath(
                path,
                R.path(path, graph),
            ),
        )],
    [R.propEq('statusCode', 403),
        (val, path) => R.compose(
            R.when(
                R.always(R.head(path) === 'edges'),
                acc => {
                    const [, fromType, fromId, toType, toId] = path;
                    const reverseEdgesPath = ['index', 'reverseEdges', toType, toId, fromType, fromId];
                    return R.when(
                        R.always(R.hasPath(reverseEdgesPath, graph)),
                        R.assocPath(
                            reverseEdgesPath,
                            R.assoc('element', R.path(reverseEdgesPath, graph), val),
                        ),
                    )(acc);
                },
            ),
            R.assocPath(
                path,
                R.assoc('element', R.path(path, graph), val),
            ),
        )],
])(apiResult);
