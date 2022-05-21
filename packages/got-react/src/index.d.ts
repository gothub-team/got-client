import { GotApi } from '@gothub-team/got-api';
import {
    State,
    SetEdgeFn,
    InheritRightsFn,
    Node,
    SetRightsFn,
    GetNodeFn,
    SetNodeFn,
    SetFileFn,
    Graph,
    View,
    EdgeMetadataView,
    NodeRightsView,
    NodeFilesView,
    SetVarFn,
    GetVarFn,
    GetEdgeFn,
    NodeEdgesView,
    GetMetadataFn,
    GetRightsFn,
    GetFilesFn,
} from '@gothub-team/got-core';
import { 
    GotStore, 
    PushObservables,
    ViewNodeTree 
} from '@gothub-team/got-store';
import { GotAction } from '@gothub-team/got-store/src/got-action';

export { gotReducer } from '@gothub-team/got-store';

export declare interface UseGraphHookResult {
    /**
     * Defines a React hook which can be used to store and access a view variable
     * in the current graph. It acts as a `useState` hook which can be used by all
     * React components or hooks sharing the same graph. When the variable does not
     * exist in the current graph the getter will use the first occurrence of the
     * variable going down in the stack.
     * 
     * @param name The name of the variable as stored in the current graph.
     * 
     * @returns Returns an array of two items. The first is the reference to the
     * current value and the second is a setter function which takes a reducer
     * function which takes the current value and returns the new value.
     */
    useVar: <T>(name: string) => [T, (fnSet: (currentValue: T) => T) => void];
    /**
     * Defines a React hook which takes a view tree that provides a certain
     * perspective on the current graph and the graphs stacked below including the
     * remote graph. The view tree contains a hash of root nodes and a tree of edge
     * types below each node. The whole view CAN be pulled from remote to view all
     * data that fall under its rules but it can also be used to directly write into
     * the graph without knowing what data are already there.
     * 
     * @param view The view tree to be selected for read and write access on the
     * remote graph.
     * @param selector A selector that will be applied after the selection of the view tree.
     * This ensures that only the further processed data will be evaluated by useSelector to 
     * trigger a rerender of the component.
     * 
     * @returns Returns the concrete view containing all data that are currently
     * pulled into the local graph.
     */
    useView: (view: View, selector?: (obj: ViewNodeTree) => any) => ViewNodeTree | any;
    /**
     * Defines a React hook which selects a node from the current graph 
     * and the graphs stacked below including the remote graph using the given node ID.
     * 
     * @param nodeId The node ID to be selected on the remote graph.
     * @param selector A selector that will be applied after the selection of the node.
     * This ensures that only the further processed data will be evaluated by useSelector to 
     * trigger a rerender of the component.
     * 
     * @returns Returns the node containing all data that is currently
     * pulled into the local graph.
     */
    useNode: (nodeId: String, selector?: (obj: Node) => any) => Node | any;
    /**
     * Defines a React hook which selects metadata from the current graph 
     * and the graphs stacked below including the remote graph using the given edge types, from ID and to ID.
     * 
     * @param edgeTypes `fromType` and `toType` of the given edge seperated with `/`
     * @param fromId The node ID which the edge is pointing from.
     * @param toId The node ID which the edge is pointing to.
     * @param selector A selector that will be applied after the selection of the metadata.
     * This ensures that only the further processed data will be evaluated by useSelector to 
     * trigger a rerender of the component.
     * 
     * @returns Returns the metadata containing all data that is currently
     * pulled into the local graph.
     */
    useMetadata: (edgeTypes: String, fromId: String, toId: String, selector?: (obj: EdgeMetadataView) => any) => EdgeMetadataView | any;
    /**
     * Defines a React hook which selects an edge from the current graph 
     * and the graphs stacked below including the remote graph using the given edge types and from ID
     * 
     * @param edgeTypes `fromType` and `toType` of the given edge seperated with `/`
     * @param fromId The node ID which the edge is pointing from.
     * @param selector A selector that will be applied after the selection of the metadata.
     * This ensures that only the further processed data will be evaluated by useSelector to 
     * trigger a rerender of the component.
     * 
     * @returns Returns the metadata containing all data that is currently
     * pulled into the local graph.
     */
    useEdge: (edgeTypes: String, fromId: String, selector?: (obj: EdgeMetadataView) => any) => EdgeMetadataView | any;
    /**
     * Defines a React hook which selects a nodes rights from the current graph 
     * and the graphs stacked below including the remote graph using the given node ID.
     * 
     * @param nodeId The node ID to be selected on the remote graph.
     * @param selector A selector that will be applied after the selection of the rights.
     * This ensures that only the further processed data will be evaluated by useSelector to 
     * trigger a rerender of the component.
     * 
     * @returns Returns the nodes rights containing all data that is currently
     * pulled into the local graph.
     */
    useRights: (nodeId: String, selector?: (obj: NodeRightsView) => any) => NodeRightsView | any;
    /**
     * Defines a React hook which selects a nodes files from the current graph 
     * and the graphs stacked below including the remote graph using the given node ID.
     * 
     * @param nodeId The node ID to be selected on the remote graph.
     * @param selector A selector that will be applied after the selection of the rights.
     * This ensures that only the further processed data will be evaluated by useSelector to 
     * trigger a rerender of the component.
     * 
     * @returns Returns the nodes files containing all data that is currently
     * pulled into the local graph.
     */
    useFiles: (nodeId: String, selector?: (obj: NodeFilesView) => any) => NodeFilesView | any;
    /**
     * Returns the value of a given variable based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     */
    getVar: GetVarFn<any>;
    /**
     * Updates or creates the given variable in the specified graph.
     */
    setVar: SetVarFn;
    /**
     * Pushes the current graph to remote and merges it to `main` to reflect the
     * remote changes locally. The current graph is cleared after the merge is
     * successful. Only elements of the graph are merged that are returned
     * with a `200` status code. Failing items are stored in a seperate error graph
     * associated with the current graph.
     * 
     * @throws When the whole push operation fails no merge is executed and every
     * error is forwarded to the caller.
     */
    push: () => Promise<PushObservables>;
    /**
     * Pulls the given view and merges it into `main` graph to reflect the current
     * remote state of the view locally. Nodes, edges or rights in `main` covered
     * by the view but not returned by the API are deleted from `main`.
     * 
     * @throws When the pull operation fails no merge is executed and error is
     * forwarded to the caller.
     */
    pull: () => Promise<void>;
    /**
     * Returns the view tree for a given view based
     * on the specified graph stack with graphs higher in the stack overriding
     * graphs lower in the stack.
     * 
     */
    getView: (view: View) => ViewNodeTree;
    /**
     * If not provided with a `toGraphName` the current graph is merged down to the next
     * graph below in the stack. Otherwise the current graph is merged to `toGraphName`.
     * 
     * @param toGraphName Can be provided with any graph name which the current graph will
     * be merged to including `main` or even non existing graph names which would be
     * created adhoc during merge
     */
    merge: (toGraphName?: string) => void;
    /**
     * If not provided with a `toGraphName` the input graph is merged into the highest graph
     * in the stack. Otherwise the current graph is merged into `toGraphName`.
     * 
     * @param toGraphName Can be provided with any graph name which the input graph will
     * be merged to including `main` or even non existing graph names which would be
     * created adhoc during merge
     */
    mergeGraph: (fromGraph: Graph, toGraphName: string) => void;
    /**
     * Clears the current graph and all variables and data stored along with it.
     */
    clear: () => void;
    /**
     * Returns the node by the given ID from the current graph or the graphs stacked
     * below.
     */
    node: GetNodeFn<Node>;
    /**
     * Updates or creates the given node in the current graph.
     */
    update: SetNodeFn;
    /**
     * Returns the edges for a given edge type based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     */
    edge: GetEdgeFn<NodeEdgesView>;
    /**
     * Returns the metadata of a given relation between a from and to node
     * based on the specified graph stack with graphs higher in the stack overriding graphs
     * lower in the stack.
     */
    metadata: GetMetadataFn<EdgeMetadataView | boolean>;
    /**
     * Creates a node along the given edge specified by the edge function in the current
     * graph.
     */
    add: SetEdgeFn;
    /**
     * Deletes a node in the current graph along the given edge specified by the edge
     * function. Also deletes the edge pointing to the given node.
     */
    remove: SetEdgeFn;
    /**
     * Creates the edge specified by the edge function between the `fromId` and
     * the given node in the current graph.
     */
    assoc: SetEdgeFn;
    /**
     * Deletes the edge specified by the edge function between the `fromId` and
     * the given node in the current graph.
     */
    dissoc: SetEdgeFn;
    /**
     * Returns the rights for a given node based on the specified graph stack with
     * graphs higher in the stack overriding graphs lower in the stack.
     */
    rights: GetRightsFn<NodeRightsView>;
    /**
     * Sets the given right types for the given node and the given user email  in the
     * current graph. `true` will grant the right type, `false` will revoke the right
     * type whereas `undefined` will perform no action for that right type.
     */
    setRights: SetRightsFn,
    /**
     * Inherits all rights from one node to another. When added to the local graph
     * no operation is performed. Only on push the Operation is executed hidden
     * on remote. The current user might lose rights on the node in case he does not
     * have any rights on the `fromId` node.
     */
    inheritRights: InheritRightsFn,
    /**
     * Returns urls and content types of all files attached to a given node based
     * on the specified graph stack with graphs higher in the stack overriding
     * graphs lower in the stack.
     */
    files: GetFilesFn<NodeFilesView>;
    /**
     * Attaches a file to a node under a given propName in the current graph.
     */
    setFile: SetFileFn;
    /**
     * Removes a file from a node under a given propName in the current graph.
     */
    removeFile: SetFileFn;
}

export declare interface CreateHooksOptions {
    /**
     * Got store implementation which is responsible for local state management and
     * remote push and pull.
     */
    store: GotStore;
    /**
     * Function to select the got state from the current redux state.
     * Per default it is assumed that the redux state is the got state.
     */
    baseState: (reduxState: any) => State,
}

export declare interface CreateResult {
    /**
     * React hook `useGraph` that represents a local graph that can be used to
     * execute data mutations in memory.
     * 
     * It is possible to stack graphs virtually on top of each other. The bottom
     * most graph is always `main` which represents the remote graph served by
     * the host.
     * 
     * Data and variables selected by this hook are always merged along the stack
     * with graphs higher in the stack overriding graphs lower in the stack.
     * 
     * Data mutations are always executed on the top most graph which is also
     * referred to as the `current` graph. The current graph represents the diff
     * compared to both the remote graph and the local `main` graph. With that
     * in mind it is obvious that the current graph can be pushed to remote.
     * 
     * After a successful push the graph is automatically merged into `main`.
     * Graphs in the middle of the stack are not affected from the push action and
     * need to be pushed seperately.
     * 
     * @param stack An array of graph names that are virtually stacked on top of
     * each other from left to right. The last entry represents the current graph.
     * Implicitly all graphs stack on top of `main` graph.
     */
    useGraph: (...stack: string[]) => UseGraphHookResult;
}

export declare interface ReduxStore {
    /**
     * Dispatches an action to the redux store.
     */
    dispatch: (action: GotAction) => void;
    /**
     * Returns the current state of the redux store.
     */
    getState: () => any;
}

export declare interface SetupOptions {
    /**
     * Host of got provider API to connect to. (e.g. https://api.gothub.io)
     */
    host: string;
    /**
     * Redux store handling all got data.
     */
    reduxStore: ReduxStore;
    /**
     * Name of the got state in the current redux state.
     * Per default it is assumed that the got state is named `got`.
     */
    baseState: string;
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
    /**
     * Whether or not to call the API in admin mode.
     */
    adminMode?: boolean;
}

/**
 * Factory function for creating a complete got environment for web apps.
 */
export declare const setup: (options: SetupOptions) => CreateResult & {
    /**
     * Got store which is responsible for local state management and
     * remote push and pull.
     */
    store: GotStore;
    /**
     * Got API which is responsible for session management and all requests to the
     * got provider.
     */
    api: GotApi;
}

/**
 * Factory function for creating React hooks that are configured for a certain
 * got store.
 */
export declare const createHooks: (options: CreateHooksOptions) => CreateResult;