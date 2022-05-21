import { EdgeMetadataView, Graph, RightTypes } from '@gothub-team/got-core';

export declare type GotAction =
{
    type: 'GOT/MERGE',
    payload: {
        fromGraph: Graph,
        toGraphName: string,
    } |
    {
        fromGraphName: string,
        toGraphName: string,
    }
} |
{
    type: 'GOT/MERGE_ERROR',
    payload: {
        fromGraph: Graph,
        toGraphName: string,
    }
} |
{
    type: 'GOT/CLEAR',
    payload: {
        graphName: string,
    }
} |
{
    type: 'GOT/SET_VAR',
    payload: {
        graphName: string,
        name: string,
        value: any,
    }
} |
{
    type: 'GOT/SET_NODE',
    payload: {
        graphName: string,
        node: Node,
    }
} |
{
    type: 'GOT/ADD',
    payload: {
        graphName: string,
        fromType: string,
        toType: string,
        fromId: string,
        toNode: Node,
        metadata?: EdgeMetadataView | boolean,
    }
} |
{
    type: 'GOT/REMOVE',
    payload: {
        graphName: string,
        fromType: string,
        toType: string,
        fromId: string,
        toNode: Node,
    }
} |
{
    type: 'GOT/ASSOC',
    payload: {
        graphName: string,
        fromType: string,
        toType: string,
        fromId: string,
        toNode: Node,
        metadata?: EdgeMetadataView | boolean,
    }
} |
{
    type: 'GOT/DISSOC',
    payload: {
        graphName: string,
        fromType: string,
        toType: string,
        fromId: string,
        toNode: Node,
    }
} |
{
    type: 'GOT/SET_RIGHTS',
    payload: {
        graphName: string,
        nodeId: string,
        email: string,
        rights: RightTypes,
    }
} |
{
    type: 'GOT/INHERIT_RIGHTS',
    payload: {
        graphName: string,
        nodeId: string,
        fromId: string,
    }
} | {
    type: 'GOT/SET_FILE',
    payload: {
        graphName: string,
        nodeId: string,
        prop: string,
        filename: string,
        file: Blob,
        // TODO base this on buffer and include contentType and fileSize seperately
    }
} | {
    type: 'GOT/REMOVE_FILE',
    payload: {
        graphName: string,
        nodeId: string,
        prop: string,
    }
} | {
    type: 'GOT/UPLOAD_PROGRESS',
    payload: {
        graphName: string,
        nodeId: string,
        prop: string,
        progress: number,
    },
} | {
    type: 'GOT/UPLOAD_COMPLETE',
    payload: {
        graphName: string,
        nodeId: string,
        prop: string,
    },
} | {
    type: 'GOT/UPLOAD_ERROR',
    payload: {
        graphName: string,
        nodeId: string,
        prop: string,
        error: any,
    },
};