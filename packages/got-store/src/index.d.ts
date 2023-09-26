import {
    type State,
    type SetEdgeFn,
    type InheritRightsFn,
    type SetRightsFn,
    type View,
    type SetNodeFn,
    type SetVarFn,
    type Graph,
    type PushResult,
    type PushBody,
    type EdgeMetadataView,
    type NodeEdgesView,
    type GetEdgeFn,
    type GetRightsFn,
    type NodeRightsView,
    type GetNodeFn,
    type GetVarFn,
    type Node,
    type GetFilesFn,
    type NodeFilesView,
    type SetFileFn,
    type RemoveFileFn,
    type GetReverseEdgeFn,
    type GetMetadataFn,
    type SetRoleRightsFn,
} from '@gothub-team/got-core';
import { type Subscriber } from '@gothub-team/got-util';
import { type GotAction } from './got-action';
export declare interface GotStore {
    /**
     * Merges a given source graph into a given target graph. The target graph will
     * be created if not existing.
     *
     * @param fromGraphName The graph to merge from
     * @param toGraphName The graph to merge to
     */
    merge: (fromGraphName: string, toGraphName: string) => void;
    /**
     * Merges a given graph into a given target graph. The target graph will
     * be created if not existing.
     *
     * @param fromGraph The graph to merge
     * @param toGraphName The graph to merge to
     */
    mergeGraph: (fromGraph: Graph, toGraphName: string) => void;
    /**
     * Merges a given graph into a given target graph. The target graph will
     * be created if not existing.
     *
     * All data in the given graph will overwrite data in the target graph.
     *
     * Overwrite behaviour:
     * Object and False will always overwrite the existing value
     * True will only overwrite if the existing value is False or Undefined.
     * Graph objects marked with undefined will have their paths removed.
     *
     * Only use this with complete datasets (e.g. ones aquired through pulling from the API)
     *
     * @param fromGraph The graph to merge
     * @param toGraphName The graph to merge to
     */
    mergeOverwriteGraph: (fromGraph: Graph, toGraphName: string) => void;
    /**
     * Clears the specified graph and all variables and data stored along with it.
     *
     * @param graphName The graph to be cleared.
     */
    clear: (graphName: string) => () => void;
    /**
     * Clears the entire got store.
     */
    clearAll: () => void;

    /**
     * Returns the value of a given variable based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    selectVar: (...stack: string[]) => GetVarFn<StateSelector<any>>;
    /**
     * Returns the value of a given variable based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    getVar: (...stack: string[]) => GetVarFn<any>;
    /**
     * Updates or creates the given variable in the specified graph.
     *
     * @param graphName The graph which the variable should be set in.
     */
    setVar: (graphName: string) => SetVarFn;

    /**
     * Returns the node for a given node ID based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    selectNode: (...stack: string[]) => GetNodeFn<StateSelector<Node>>;
    /**
     * Returns the node for a given node ID based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    getNode: (...stack: string[]) => GetNodeFn<Node>;
    /**
     * Updates or creates the given node in the specified graph.
     *
     * @param graphName The graph which the node should be set in.
     */
    setNode: (graphName: string) => SetNodeFn;

    /**
     * Returns a selector for the metadata of a given relation between a from and to node
     * based on the specified graph stack with graphs higher in the stack overriding graphs
     * lower in the stack.
     */
    selectMetadata: (...stack: string[]) => GetMetadataFn<StateSelector<EdgeMetadataView | boolean>>;
    /**
     * Returns the metadata of a given relation between a from and to node
     * based on the specified graph stack with graphs higher in the stack overriding graphs
     * lower in the stack.
     */
    getMetadata: (...stack: string[]) => GetMetadataFn<EdgeMetadataView | boolean>;

    /**
     * Returns the edges for a given edge type based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    selectEdge: (...stack: string[]) => GetEdgeFn<StateSelector<NodeEdgesView>>;
    /**
     * Returns the edges for a given edge type based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    getEdge: (...stack: string[]) => GetEdgeFn<NodeEdgesView>;
    /**
     * Returns a selector for the edges for a given edge type based on the reverse edges index in the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    selectReverseEdge: (...stack: string[]) => GetReverseEdgeFn<StateSelector<NodeEdgesView>>;
    /**
     * Returns the edges for a given edge type based on the reverse edges index in the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    getReverseEdge: (...stack: string[]) => GetReverseEdgeFn<NodeEdgesView>;
    /**
     * Creates a node along the given edge specified by the edge function in the specified
     * graph.
     *
     * @param graphName The graph which the edge and node should be added in.
     */
    add: (graphName: string) => SetEdgeFn;
    /**
     * Deletes a node in the specified graph along the given edge specified by the edge
     * function. Also deletes the edge pointing to the given node.
     *
     * @param graphName The graph which the edge and node should be deleted in.
     */
    remove: (graphName: string) => SetEdgeFn;
    /**
     * Creates the edge specified by the edge function between the `fromId` and
     * the given node in the specified graph.
     *
     * @param graphName The graph which the edge should be added in.
     */
    assoc: (graphName: string) => SetEdgeFn;
    /**
     * Deletes the edge specified by the edge function between the `fromId` and
     * the given node in the specified graph.
     *
     * @param graphName The graph which the edge should be deleted in.
     */
    dissoc: (graphName: string) => SetEdgeFn;

    /**
     * Returns the rights for a given node based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    selectRights: (...stack: string[]) => GetRightsFn<StateSelector<NodeRightsView>>;
    /**
     * Returns the rights for a given node based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    getRights: (...stack: string[]) => GetRightsFn<NodeRightsView>;
    /**
     * Sets the given right types for the given node and the given user email in the
     * specified local graph. `true` will grant the right type, `false` will revoke
     * the right type whereas `undefined` will perform no action for that right type.
     *
     * @param graphName The graph which the rights should be set in.
     */
    setRights: (graphName: string) => SetRightsFn;
    /**
     * Sets the given right types for the given node and the given role in the
     * specified local graph. `true` will grant the right type, `false` will revoke
     * the right type whereas `undefined` will perform no action for that right type.
     * 
     * @param graphName The graph which the rights should be set in.
     */
    setRoleRights: (graphName: string) => SetRoleRightsFn;
    /**
     * Inherits all rights from one node to another in the specified local graph. 
     * When added to the local graph no operation is performed. Only on push the
     * Operation is executed hidden on remote. The current user might lose rights
     * on the node in case he does not have any rights on the `fromId` node.
     *
     * @param graphName The graph which the inherit action should be added in.
     */
    inheritRights: (graphName: string) => InheritRightsFn;

    /**
     * Returns urls and content types of all files attached to a given node based
     * on the specified graph stack with graphs higher in the stack overriding
     * graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    selectFiles: (...stack: string[]) => GetFilesFn<StateSelector<NodeFilesView>>;
    /**
     * Returns urls and content types of all files attached to a given node based
     * on the specified graph stack with graphs higher in the stack overriding
     * graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    getFiles: (...stack: string[]) => GetFilesFn<NodeFilesView>;
    /**
     * Attaches a file to a node under a given propName to be uploaded after push.
     *
     * @param graphName The graph which the file should be attached in.
     */
    setFile: (graphName: string) => SetFileFn;
    /**
     * Removes a file from a node under a given propName to be removed during push.
     *
     * @param graphName The graph which the file should be removed in.
     */
    removeFile: (graphName: string) => RemoveFileFn;

    /**
     * Pushes the specified graph to remote and merges it to `main` to reflect the
     * remote changes locally. The specified graph is cleared after the merge is
     * successful. Only elements of the graph are merged that are returned
     * with a `200` status code. Failing items are stored in a seperate error graph
     * associated with the specified graph.
     *
     * @throws When the whole push operation fails no merge is executed and every
     * error is forwarded to the caller.
     */
    push: (graphName: string, toGraphName?: string) => Promise<PushObservables>;
    /**
     * Pulls the given view and merges it into `main` graph to reflect the current
     * remote state of the view locally. Nodes, edges or rights in `main` covered
     * by the view but not returned by the API are deleted from `main`.
     *
     * @throws When the pull operation fails no merge is executed and error is
     * forwarded to the caller.
     */
    pull: (view: View) => Promise<void>;

    /**
     * Returns the view tree for a given view based
     * on the specified graph stack with graphs higher in the stack overriding
     * graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    selectView: (...stack: string[]) => (view: View) => StateSelector<ViewNodeTree>;
    /**
     * Returns the view tree for a given view based
     * on the specified graph stack with graphs higher in the stack overriding
     * graphs lower in the stack.
     *
     * @param stack The graph stack to retrieve from.
     */
    getView: (...stack: string[]) => (view: View) => ViewNodeTree;
}

/**
 * A hashmap of all nodes the parent edge is pointing to.
 */
export declare type ViewEdgeTree = {
    [nodeId: string]: ViewNodeTree;
};

export declare type ViewNodeTree = {
    /**
     * The parent nodes ID.
     */
    id: string;
    /**
     * The parent node. Remains `undefined` if node is not included in
     * the parent node view.
     */
    node?: Node;
    /**
     * A hashmap of metadata that are associated to the edge pointing to the parent node.
     * Remains `undefined` if metadata are not included in the parent node view.
     */
    metadata?: EdgeMetadataView;
    /**
     * A hashmap of user emails holding the (read/write/admin) rights that are given to
     * the user for the parent node. Remains `undefined` if rights are not included in
     * the parent node view.
     */
    rights?: NodeRightsView;
    /**
     * A hashmap of property names holding signed urls to the files attached to the parent
     * node under the property names. Remains `undefined` if files are not included in the
     * root node view.
     */
    files?: NodeFilesView;
    /**
     * A hashmap of all edgeTypes (e.g. `book/chapter`) pointing from the parent
     * node in this view node tree.
     * TODO this is not an obj
     */
    edges?: {
        [edgeTypes: string]: ViewEdgeTree;
    };
};

export declare type ViewTree = {
    /**
     * The parent nodes ID.
     */
    id: string;
    /**
     * The parent node. Remains `undefined` if node is not included in
     * the parent node view.
     */
    node?: Node;
    /**
     * A hashmap of user emails holding the (read/write/admin) rights that are given to
     * the user for the parent root node. Remains `undefined` if rights are not included
     * in the parent root node view.
     */
    rights?: NodeRightsView;
    /**
     * A hashmap of property names holding signed urls to the files attached to the parent
     * root node under the property names. Remains `undefined` if files are not included
     * in the parent root node view.
     */
    files?: NodeFilesView;
    /**
     * A hashmap of all edgeTypes (e.g. `book/chapter`) pointing from the parent root
     * node in this view tree.
     * TODO this is not an obj
     */
    edges?: {
        [edgeTypesOrAlias: string]: ViewEdgeTree;
    };
};

export declare type SelectViewResult<TIndexNames extends string | number | symbol> = {
    /**
     * Holds all index functions by name as declared in the `useView` hook.
     */
    index: Record<TIndexNames, any>;
    /**
     * A hashmap of all root nodes declared in the `useView` hook holding a sub view tree.
     * TODO this is not an obj
     */
    edges?: {
        [nodeIdOrAlias: string]: ViewTree;
    };
};

export declare type PushObservables = {
    uploads: {
        /**
         * Subscribes an object to the upload events.
         * Uploads must be initiated by calling start().
         */
        subscribe: (subscriber: UploadsSubscriber) => void;
        /**
         * Starts the upload progress for all pushed files.
         * Progress and completion can be observed by subscribing before or after calling start().
         */
        start: () => void;
    };
};

export declare type UploadsSubscriber = Subscriber<GotAction>;

export declare type StateSelector<TResult> = (state: State) => TResult;

export declare interface GotApi {
    /**
     * This operation pushes the graph from the request body to remote.
     */
    push: (body: PushBody) => Promise<PushResult>;
    /**
     * This operation pulls a graph from remote based on a given view.
     */
    pull: (body: View) => Promise<Graph>;
    /**
     * This operation uploads a file blob using a given set of uploadUrls.
     * If the length of uploadUrls is greater than 1 does multipart upload.
     */
    upload: (uploadUrls: string[], file: Blob, options?: UploadOptions) => Promise<any>;
}

export declare interface UploadOptions {
    uploadId?: string;
}

export declare interface CreateStoreOptions {
    /**
     * Got API implementation which is responsible for remote push and pull.
     */
    api?: GotApi;
    /**
     * Dispatch handler to be used to forward actions to the connected store.
     */
    dispatch?: (action: GotAction) => void;
    /**
     * Selects from the current state of the connected store using a given
     * selector function.
     */
    select?: <T>(selector: StateSelector<T>) => T;
    /**
     * Error handler to be called by store in case of runtime errors.
     * Set to `null` to disable errors.
     *
     * @default console.error
     */
    onError?: ((error: Error) => void) | null;
    /**
     * Warning handler to be called by store in case of runtime warnings.
     * Set to `null` to disable warnings.
     *
     * @default console.warn
     */
    onWarn?: ((error: Error) => void) | null;
}

/**
 * General got state reducer which recieves the current state an an action and
 * returns the new state
 */
export declare const gotReducer: (state: State, action: GotAction) => State;

/**
 * Factory function for creating a got store that is configured for a certain
 * got API.
 */
export declare const createStore: (options: CreateStoreOptions) => GotStore;
