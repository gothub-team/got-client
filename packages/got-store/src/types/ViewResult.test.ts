/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Expect } from 'type-testing';
import { type ViewResult } from './ViewResult';

export type Equal<A, B> = A extends B ? (B extends A ? true : false) : false;

const baseViewResultType = () => {
    type TestResult = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    edges: {
                        'root/member': {
                            edges: {
                                'member/appointment': {};
                            };
                        };
                    };
                };
            }>,
            {
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
            }
        >
    >;
};

const aliases = () => {
    type Level0 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    as: 'root';
                };
            }>,
            {
                root: {
                    nodeId: string;
                };
            }
        >
    >;
    type Level1 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    as: 'root';
                    edges: {
                        'root/member': {
                            as: 'members';
                        };
                    };
                };
            }>,
            {
                root: {
                    nodeId: string;
                    members: {
                        [id: string]: {
                            nodeId: string;
                        };
                    };
                };
            }
        >
    >;
    type Level2 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    as: 'root';
                    edges: {
                        'root/member': {
                            as: 'members';
                            edges: {
                                'member/appointment': {
                                    as: 'appointments';
                                };
                            };
                        };
                    };
                };
            }>,
            {
                root: {
                    nodeId: string;
                    members: {
                        [id: string]: {
                            nodeId: string;
                            appointments: {
                                [id: string]: {
                                    nodeId: string;
                                };
                            };
                        };
                    };
                };
            }
        >
    >;
};

const notIncludeNode = () => {
    type IncludeLevel0 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    include: {
                        node: true;
                    };
                };
            }>,
            {
                rootBabbeli: {
                    nodeId: string;
                    node: Node;
                };
            }
        >
    >;

    type IncludeLevel1 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    edges: {
                        'root/member': {
                            include: {
                                node: true;
                            };
                        };
                    };
                };
            }>,
            {
                rootBabbeli: {
                    nodeId: string;
                    'root/member': {
                        [id: string]: {
                            nodeId: string;
                            node: Node;
                        };
                    };
                };
            }
        >
    >;

    type NotInclude1 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {};
            }>,
            {
                rootBabbeli: {
                    nodeId: string;
                };
            }
        >
    >;

    type NotInclude2 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    include: {};
                };
            }>,
            {
                rootBabbeli: {
                    nodeId: string;
                };
            }
        >
    >;

    type NotInclude3 = Expect<
        Equal<
            ViewResult<{
                rootBabbeli: {
                    include: {
                        node: false;
                    };
                };
            }>,
            {
                rootBabbeli: {
                    nodeId: string;
                };
            }
        >
    >;
};
