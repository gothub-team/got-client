export declare interface Node {
    id: string;
    [key: string]: any;
}

export declare type OK = {
    statusCode: 200;
};
export declare type FORBIDDEN = {
    statusCode: 403;
    name: 'NoWriteRightError' | 'NoAdminRightError';
};
export declare type GraphElementResult = OK | FORBIDDEN;
export declare type UploadElementResult =
    | {
          statusCode: 200;
          uploadUrls: Array<string>;
          uploadId?: string;
      }
    | FORBIDDEN;

export declare type PushBody = Omit<
    GraphLayer<Node | boolean, EdgeMetadataView | boolean, never, boolean, string, UploadNodeFileView>,
    'index'
>;
export declare type PushResult = Omit<
    GraphLayer<
        GraphElementResult,
        GraphElementResult,
        never,
        GraphElementResult,
        GraphElementResult,
        UploadElementResult
    >,
    'index'
>;

export declare interface GraphError<TElement> extends FORBIDDEN {
    element: TElement;
}

export declare type ErrorGraph = GraphLayer<
    GraphError<Node | boolean>,
    GraphError<EdgeMetadataView | boolean>,
    GraphError<boolean>,
    GraphError<boolean>,
    GraphError<string>,
    GraphError<UploadNodeFileView>
>;

export declare type Graph = GraphLayer<
    Node | boolean,
    EdgeMetadataView | boolean,
    boolean,
    boolean,
    string,
    NodeFileView
>;

export declare interface GraphLayer<TNode, TEdge, TReverseEdge, TRight, TInheritRights, TFile> {
    nodes?: {
        [nodeId: string]: TNode;
    };
    edges?: {
        [fromType: string]: {
            [fromId: string]: {
                [toType: string]: {
                    [toId: string]: TEdge;
                };
            };
        };
    };
    index?: {
        reverseEdges?: {
            [toType: string]: {
                [toId: string]: {
                    [fromType: string]: {
                        [fromId: string]: TReverseEdge;
                    };
                };
            };
        };
    };
    rights?: {
        [nodeId: string]: {
            user?: {
                [email: string]: {
                    read: TRight;
                    write: TRight;
                    admin: TRight;
                };
            };
            inherit?: {
                from: TInheritRights;
            };
        };
    };
    files?: {
        [nodeId: string]: {
            [prop: string]: TFile;
        };
    };
}

export declare interface GraphState {
    graph: Graph;
    errors: ErrorGraph;
    vars: {
        [name: string]: any;
    };
    files: {
        [nodeId: string]: {
            [name: string]: {
                status: string;
                file: Blob;
            };
        };
    };
}

export declare interface State {
    [graphName: 'main' | string]: GraphState;
}

export declare type View = Record<string, NodeView>;
export declare type EdgesView = Record<string, EdgeView>;

export declare type NodeInclude = {
    /**
     * Whether or not the body of the root node should be included.
     */
    node?: boolean;
    /**
     * Whether or not all rights of the parent node should be included. Only
     * returns rights if the currrent user has admin rights on the parent node.
     */
    rights?: boolean;
    /**
     * Whether or not all files attached to the parent node should be included.
     */
    files?: boolean;
};

export declare interface NodeView {
    /**
     * Defines an optional alias for the node view
     */
    as?: string;
    /**
     * Defines an optional role to pull the view as.
     * Any '$NODEID' in the role name will be replaced by the nodeId.
     */
    role?: string;
    /**
     * Options defining which elements of the parent node should be included in the
     * result view tree.
     */
    include?: NodeInclude;
    /**
     * Hashmap of edge types that are pointing from the parent node.
     */
    edges?: EdgesView;
}

export declare type EdgeInclude = {
    /**
     * Whether or not the body of the node the parent edge is pointing to should be included.
     */
    node?: boolean;
    /**
     * Whether or not the parent edge to should be included.
     */
    edges?: boolean;
    /**
     * Whether or not metadata of the parent edge should be included.
     */
    metadata?: boolean;
    /**
     * Whether or not all rights of the node the parent edge is pointing
     * to should be included. Only returns rights if the currrent user has admin
     * rights on the node.
     */
    rights?: boolean;
    /**
     * Whether or not all files attached to the node the parent edge is pointing
     * to should be included.
     */
    files?: boolean;
};
export declare interface EdgeView {
    /**
     * Defines an optional alias for the edge view
     */
    as?: string;
    /**
     * Defines an optional role to pull the view as.
     * Any '$NODEID' in the role name will be replaced by the toIds of the edge.
     */
    role?: string;
    /**
     * Defines if the edge should be read out in reverse.
     */
    reverse?: boolean;
    /**
     * Options defining which elements of the node the parent edge is pointing to
     * should be included in the result view tree.
     */
    include?: EdgeInclude;
    /**
     * Hashmap of edge types that are pointing from all nodes the parent edge is
     * pointing to.
     */
    edges?: EdgesView;
}

/**
 * Declares a function type that returns the value of a given variable from the
 * current graph or the graphs stacked below.
 */
export declare type GetVarFn<TReturn> = (
    /**
     * The name of the variable to be returned.
     */
    name: string,
) => TReturn;
/**
 * Declares a function type that updates or creates a given variable in the current
 * graph.
 */
export declare type SetVarFn = (
    /**
     * The name of the variable to be set.
     */
    name: string,
    /**
     * The value to be set.
     */
    value: any,
) => void;

/**
 * Declares a function type that returns a node by the given ID from the current
 * graph or the graphs stacked below.
 *
 * @returns The requested node body.
 */
export declare type GetNodeFn<TReturn> = (
    /**
     * The node ID to be returned.
     */
    nodeId: string,
) => TReturn;
/**
 * Declares a function type that updates or creates the given node in the current
 * graph.
 */
export declare type SetNodeFn = (
    /**
     * The node patch to be updated or created.
     */
    node: Node,
) => void;

export declare type GetMetadataFn<TReturn> = (
    /**
     * `fromType` and `toType` of the given edge seperated with `/`
     * @example 'book/chapter'
     */
    edgeTypes: string,
) => (
    /**
     * The node ID which the edge is pointing from.
     */
    fromId: string,
) => (
    /**
     * The node ID which the edge is pointing to.
     */
    toId: string,
) => TReturn;

/**
 * Declares a curried function type that operates on a given edge with a given node.
 * Parameters can be applied partially to operate on preconfigured edge types and a
 * preconfigured from ID.
 */
export declare type GetEdgeFn<TReturn> = (
    /**
     * `fromType` and `toType` of the given edge seperated with `/`
     * @example 'book/chapter'
     */
    edgeTypes: string,
) => (
    /**
     * The node ID which the edge is pointing from.
     */
    fromId: string,
) => TReturn;

/**
 * Declares a curried function type that operates on a given reverse edge index with a given nodeId.
 * Parameters can be applied partially to operate on preconfigured edge types and a
 * preconfigured to ID.
 */
export declare type GetReverseEdgeFn<TReturn> = (
    /**
     * `fromType` and `toType` of the given edge seperated with `/`
     * @example 'book/chapter'
     */
    edgeTypes: string,
) => (
    /**
     * The node ID which the edge is pointing to.
     */
    toId: string,
) => TReturn;

/**
 * Declares a curried function type that operates on a given edge with a given node.
 * Parameters can be applied partially to operate on preconfigured edge types and a
 * preconfigured from ID.
 */
export declare type SetEdgeFn = (
    /**
     * `fromType` and `toType` of the given edge seperated with `/`
     * @example 'book/chapter'
     */
    edgeTypes: string,
) => (
    /**
     * The node ID which the edge is pointing from.
     */
    fromId: string,
) => (
    /**
     * The node which the edge is pointing to.
     */
    toNode: Node,

    /**
     * The metadata to be set on the given edge.
     */
    metadata?: EdgeMetadataView,
) => void;

/**
 * Declares a function type that returns a rights view for the given node ID.
 */
export declare type GetRightsFn<TReturn> = (
    /**
     * The node ID to return the rights view for.
     */
    nodeId: string,
) => TReturn;

/**
 * Delares a curried function type that grants or revokes rights for a given user
 * on a given node.
 */
export declare type SetRightsFn = (
    /**
     * The node ID which the rights operation should be executed on.
     */
    nodeId: string,
) => (
    /**
     * The users email which rights should be granted or revoked for.
     */
    email: string,
    /**
     * The right types which should be granted or revoked. `true` will grant the
     * right type, `false` will revoke the right type whereas `undefined` will
     * perform no action for that right type.
     */
    rights: RightTypes,
) => void;

/**
 * Delares a curried function type that grants or revokes rights for a given role
 * on a given node.
 */
export declare type SetRoleRightsFn = (
    /**
     * The node ID which the rights operation should be executed on.
     */
    nodeId: string,
) => (
    /**
     * The role which rights should be granted or revoked for.
     */
    role: string,
    /**
     * The right types which should be granted or revoked. `true` will grant the
     * right type, `false` will revoke the right type whereas `undefined` will
     * perform no action for that right type.
     */
    rights: RightTypes,
) => void;

/**
 * Delares a curried function type that inherits all rights from one node to another.
 */
export declare type InheritRightsFn = (
    /**
     * The node ID which should inherit rights from another node.
     */
    nodeId: string,
) => (
    /**
     * The node ID which rights should be inherited from.
     */
    fromId: string,
) => void;

/**
 * Declares a function type that returns a files view for the given node ID.
 */
export declare type GetFilesFn<TReturn> = (
    /**
     * The node ID to return the files view for.
     */
    nodeId: string,
) => TReturn;

/**
 * Declares a function type that attaches a file to a given node
 * under a given name to be uploaded on push
 */
export declare type SetFileFn = (
    /**
     * The node ID which the file should be attached to.
     */
    nodeId: string,
) => (
    /**
     * The prop name which the file should be attachted as.
     */
    prop: string,
    /**
     * The filename which the file should be attached as.
     */
    filename: string,
    /**
     * The file to be attached to the node. Must contain a valid `contentType`.
     */
    file: Blob,
) => void;

/**
 * Declares a function type that removes a file from a given node
 * under a given name to be deleted on push
 */
export declare type RemoveFileFn = (
    /**
     * The node ID which the file should be removed from.
     */
    nodeId: string,
) => (
    /**
     * The prop name which the file should be removed from.
     */
    prop: string,
) => void;

export declare type RightTypes = {
    /**
     * `true` will grant the read right, `false` will revoke the read right whereas
     * `undefined` will perform no action for the read right.
     */
    read?: boolean;
    /**
     * `true` will grant the write right, `false` will revoke the write right whereas
     * `undefined` will perform no action for the write right.
     */
    write?: boolean;
    /**
     * `true` will grant the read admin, `false` will revoke the read admin whereas
     * `undefined` will perform no action for the read admin.
     */
    admin?: boolean;
};
export declare type NodeEdgesView = {
    [toId: string]: EdgeMetadataView | boolean;
};
export declare type NodeRightsView = {
    user: {
        [email: string]: RightTypes;
    };
};
export declare type NodeFilesView = {
    [propName: string]: NodeFileView | boolean;
};

export declare type NodeFileView = DownloadNodeFileView | UploadNodeFileView;

export declare type DownloadNodeFileView = {
    url: string;
    etag: string;
    contentType: string;
    modifiedDate: string;
};

export declare type UploadNodeFileView = {
    filename: string;
    contentType: string;
    fileSize: number;
    partSize?: number;
};

export declare type EdgeMetadataView = {
    [key: string]: any;
};

/**
 * Checks if the given edgeTypes string is valid to be used with got functions.
 */
export declare const isEdgeTypesString: (edgeTypes: string) => boolean;

/**
 * Checks if the given path is pointing inside the nodes object of a graph.
 */
export declare const isNodesPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing to a node in a graph.
 */
export declare const isNodePath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing inside the edges object of a graph.
 */
export declare const isEdgesPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing to an edge metadata in a graph.
 */
export declare const isMetadataPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing inside the rights object of a graph.
 */
export declare const isRightsPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing inside the files object of a graph.
 */
export declare const isFilesPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing to a node file view of a graph.
 */
export declare const isNodeFilesPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing inside the index object of a graph.
 */
export declare const isIndexPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing inside the reverse edges index object of a graph.
 */
export declare const isReverseEdgesPath: (path: string[]) => boolean;

/**
 * Checks if the given path is pointing to the reverse edge index of a specific edge in a graph.
 */
export declare const isReverseEdgesIndexPath: (path: string[]) => boolean;

/**
 * Merges two graphs, data of the right graph will take priority over data of the left graph.
 * Nodes and edge metadata will be merged.
 * Rights will be deep merged.
 * false will overwrite existing data.
 * Object will overwrite true, true will not overwrite object.
 */
export declare const mergeGraphsRight: (left: Graph, right: Graph) => Graph;

/**
 * Merges two graphs, data of the left graph will take priority over data of the right graph.
 * Nodes and edge metadata will be merged.
 * Rights will be deep merged.
 * false will overwrite existing data.
 * Object will overwrite true, true will not overwrite object.
 */
export declare const mergeGraphsLeft: (left: Graph, right: Graph) => Graph;

/**
 * Merges two graphs, data of the right graph will overwrite data of the left graph.
 *
 * Overwrite behaviour:
 * Object and False will always overwrite the existing value
 * True will only overwrite if the existing value is False or Undefined.
 * Graph objects marked with undefined will have their paths removed.
 */
export declare const mergeOverwriteGraphsRight: (left: Graph, right: Graph) => Graph;

/**
 * Merges two graphs, data of the left graph will overwrite data of the right graph.
 *
 * Overwrite behaviour:
 * Object and False will always overwrite the existing value
 * True will only overwrite if the existing value is False or Undefined.
 * Graph objects marked with undefined will have their paths removed.
 */
export declare const mergeOverwriteGraphsLeft: (left: Graph, right: Graph) => Graph;

/**
 * Checks if the given query object has set the flag to include node
 */
export declare const includeNode: (queryObj: NodeView | EdgeView) => boolean;

/**
 * Checks if the given query object has set the flag to include rights
 */
export declare const includeRights: (queryObj: NodeView | EdgeView) => boolean;

/**
 * Checks if the given query object has set the flag to include edges
 */
export declare const includeEdges: (queryObj: NodeView | EdgeView) => boolean;

/**
 * Checks if the given query object has set the flag to include edge metadata
 */
export declare const includeMetadata: (queryObj: NodeView | EdgeView) => boolean;

/**
 * Checks if the given query object has set the flag to include files
 */
export declare const includeFiles: (queryObj: NodeView | EdgeView) => boolean;

/**
 * Checks if the given query object has set the flag to be read out in reverse
 */
export declare const isReverse: (queryObj: NodeView | EdgeView) => boolean;

export declare type doViewGraphNodesFn = (
    queryObj: NodeView | EdgeView,
    nodeId: string,
    edgePath: string,
    NodeViewPath: string[],
    metadata: EdgeMetadataView | boolean,
) => void;
export declare type doViewGraphEdgesFn = (
    nestedQueryObj: NodeView | EdgeView,
    nodeId: string,
    edgeTypes: string,
    edgeViewPath: string[],
) => void;

export declare type GetEdgeToIdsFn = (
    fromType: string,
    nodeId: string,
    toType: string,
    options: { reverse?: boolean },
) => {
    [toI: string]: EdgeMetadataView | boolean;
};

/**
 * Curried function to recursively traverse a graph with the help of the nodeIds found by the fnGetEdgeToIds following the given view.
 *
 * For every node covered by the given view, the nodes callback will be invoked with the relevant query object, the nodes ID,
 * the edgePath pointing to that node (if not a root node of the view), the path for the node in a resulting view path (with node/edge aliases)
 * and the metadata of the edge pointing towards this node (if not a root node of the view).
 *
 * For every edge covered by the given view, the edge callback will be invoked with the relevant query object, the fromId of the edge,
 * the edgeTypes and the resulting view path (with node/edge aliases).
 */
export declare const doViewGraph: (params: {
    nodes?: doViewGraphNodesFn;
    edges?: doViewGraphEdgesFn;
}) => (view: View) => (fnGetEdgeToIds: GetEdgeToIdsFn) => void;

/**
 * Curried function to map over a subgraph of a given graph defined by a given view.
 * fnMap will be applied to every object relevat to the given view, with the result being added to the graph to be returned.
 */
export declare const pickMapGraph: (
    fnMap: (object: any, path: string[]) => any,
) => (view: View) => (graph: Graph) => Graph;

/**
 * Curried function to Create a subgraph of a given graph defined by a given view.
 */
export declare const filterGraph: (view: View) => (graph: Graph) => Graph;

/**
 * Selects an Object at a given path in a given stack from the state.
 * Elements found at the given path in every layer of the stack will be merged with fnMergeLeft,
 * which merges element prioritizing data of the left input.
 */
export declare const selectPathFromStack: (
    path: string[],
    stack: string[],
    fnMergeLeft: (left: any, right: any) => any,
    state: State,
) => any;

/**
 * Selects a map of toIds and their edge metadata from a given graph.
 */
export declare const selectEdgeIds: (graph: Graph) => GetEdgeToIdsFn;

/**
 * Splits the given pushedGraph into a success and an error graph using the given apiResult.
 */
export declare const createSuccessAndErrorGraphs: (pushedGraph: Graph, apiResult: PushResult) => [Graph, ErrorGraph];

/**
 * Selects the nodes edges view in a given stack from the state.
 * Elements found at the given path in every layer of the stack will be merged prioritizing data higher up the stack.
 */
export declare const selectEdgeFromStack: (
    fromType: string,
    from: string,
    toType: string,
    stack: string[],
    state: State,
) => NodeEdgesView;

/**
 * Selects a node in a given stack from the state.
 * Elements found at the given path in every layer of the stack will be merged prioritizing data higher up the stack.
 */
export declare const selectNodeFromStack: (nodeId: string, stack: string[], state: State) => any;
