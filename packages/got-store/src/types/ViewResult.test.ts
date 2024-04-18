/* eslint-disable @typescript-eslint/no-unused-vars */
import { type View } from '@gothub-team/got-core';
import { type TrueCases, type Expect } from 'type-testing';
import { type ViewResult } from './ViewResult';

type Extends<A, B> = A extends B ? true : false;
type Equal<A, B> = A extends B ? (B extends A ? true : false) : false;

const baseViewResultType = () => {
    const view = {
        rootBabbeli: {
            edges: {
                'root/member': {
                    edges: {
                        'member/appointment': {},
                    },
                },
            },
        },
    } satisfies View;

    type TestViewResult = {
        rootBabbeli: {
            nodeId: string;
            'root/member': {
                [id: string]: {
                    nodeId: string;
                    'member/appointment': {
                        [id: string]: {
                            nodeId: string;
                        };
                    };
                };
            };
        };
    };

    type TestResult = Expect<Equal<ViewResult<typeof view>, TestViewResult>>;
};

const includeNodeLevel0 = () => {
    const view = {
        rootBabbeli: {
            include: {
                node: true,
            },
        },
    } satisfies View;

    type TestViewResult = {
        rootBabbeli: {
            nodeId: string;
            node: Node;
        };
    };

    type TestResult = Expect<Equal<ViewResult<typeof view>, TestViewResult>>;
};

const includeNodeLevel1 = () => {
    const view = {
        rootBabbeli: {
            edges: {
                'root/member': {
                    include: {
                        node: true,
                    },
                },
            },
        },
    } satisfies View;

    type TestViewResult = {
        rootBabbeli: {
            nodeId: string;
            'root/member': {
                [id: string]: {
                    nodeId: string;
                    node: Node;
                };
            };
        };
    };

    type TestResult = Expect<Equal<ViewResult<typeof view>, TestViewResult>>;
};
