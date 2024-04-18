import {
    type EdgesView,
    type View,
    type EdgeView,
    type NodeView,
    type NodeInclude,
    type EdgeInclude,
} from '@gothub-team/got-core';

type AliasKey<TView extends View | EdgesView, K extends keyof TView> = TView[K]['as'] extends string
    ? TView[K]['as']
    : K;

type NodeBag<TSubView extends NodeView | EdgeView> = {
    nodeId: string;
} & ExtractIncludeNode<TSubView> &
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

type ExtractIncludeNode<TNodeView extends NodeView | EdgeView, TInclude = TNodeView['include']> = TInclude extends
    | NodeInclude
    | EdgeInclude
    ? TInclude['node'] extends true
        ? {
              node: Node;
          }
        : NonNullable<unknown>
    : NonNullable<unknown>;

export type ViewResult<TView extends View> = {
    [K in keyof TView as AliasKey<TView, K>]: NodeBag<TView[K]>;
};
