import { type EdgesView, type View, type EdgeView, type NodeView } from '@gothub-team/got-core';

type NodeBag<TSubView extends NodeView | EdgeView> = {
    nodeId: string;
} & ExtractViewEdges<TSubView>;

type ExtractViewEdges<
    TNodeView extends NodeView | EdgeView,
    TEdgesView = TNodeView['edges'],
> = TEdgesView extends EdgesView
    ? {
          [K in keyof TEdgesView]: {
              [id: string]: NodeBag<TEdgesView[K]>;
          };
      }
    : NonNullable<unknown>;

export type ViewResult<TView extends View> = {
    [K in keyof TView]: NodeBag<TView[K]>;
};
