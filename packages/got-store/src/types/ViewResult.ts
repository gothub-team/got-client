import {
    type EdgesView,
    type View,
    type EdgeView,
    type NodeView,
    type NodeInclude,
    type EdgeInclude,
    type Node,
    type Metadata,
    type NodeRightsView,
    type NodeFilesView,
} from '@gothub-team/got-core';

type AliasKey<TView extends View | EdgesView, K extends keyof TView> = TView[K]['as'] extends string
    ? TView[K]['as']
    : K;

type NodeBag<TSubView extends NodeView | EdgeView> = {
    nodeId: string;
} & ExtractIncludeNode<TSubView> &
    ExtractIncludeMetadata<TSubView> &
    ExtractIncludeRights<TSubView> &
    ExtractIncludeFiles<TSubView> &
    ExtractViewEdges<TSubView>;

type ExtractViewEdges<
    TNodeView extends NodeView | EdgeView,
    TEdgesView = TNodeView['edges'],
> = TEdgesView extends EdgesView
    ? {
          [K in keyof TEdgesView as AliasKey<TEdgesView, K>]: {
              [id: string]: NodeBag<TEdgesView[K]>;
          };
      }
    : NonNullable<unknown>;

type ExtractIncludeNode<
    TNodeView extends NodeView | EdgeView,
    TInclude = TNodeView['include'],
> = TInclude extends EdgeInclude
    ? TInclude['node'] extends true
        ? {
              node: Node;
          }
        : NonNullable<unknown>
    : NonNullable<unknown>;

type ExtractIncludeMetadata<
    TNodeView extends NodeView | EdgeView,
    TInclude = TNodeView['include'],
> = TInclude extends EdgeInclude
    ? TInclude['metadata'] extends true
        ? {
              metadata: Metadata;
          }
        : NonNullable<unknown>
    : NonNullable<unknown>;

type ExtractIncludeRights<
    TNodeView extends NodeView | EdgeView,
    TInclude = TNodeView['include'],
> = TInclude extends EdgeInclude
    ? TInclude['rights'] extends true
        ? {
              rights: NodeRightsView;
          }
        : NonNullable<unknown>
    : NonNullable<unknown>;

type ExtractIncludeFiles<
    TNodeView extends NodeView | EdgeView,
    TInclude = TNodeView['include'],
> = TInclude extends EdgeInclude
    ? TInclude['files'] extends true
        ? {
              files: NodeFilesView;
          }
        : NonNullable<unknown>
    : NonNullable<unknown>;

export type ViewResult<TView extends View> = {
    [K in keyof TView as AliasKey<TView, K>]: NodeBag<TView[K]>;
};
