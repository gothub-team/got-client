/* eslint-disable @typescript-eslint/no-unused-vars */
import { type View } from '@gothub-team/got-core';
import { type TrueCases, type Expect } from 'type-testing';
import { type ViewResult } from './ViewResult';

type Extends<A, B> = A extends B ? true : false;

export const view = {
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

type BaseViewAssembly = TrueCases<
    [Extends<ViewResult<typeof view>, TestViewResult>, Extends<TestViewResult, ViewResult<typeof view>>]
>;
