import * as uuid from 'uuid';
import { assocPathMutate } from '@gothub-team/got-util';
import * as R from 'ramda';
import { createStore, gotReducer } from '../index.js';

test('dummy test', () => {
    expect(true).toBe(true);
});

export const createTestStore = (initialState = {}, api = undefined, clone = true) => {
    let state = clone ? R.clone(initialState) : initialState;

    const getState = () => state;

    const select = (selector) => selector(state);

    const dispatch = jest.fn((action) => {
        try {
            state = gotReducer(state, action);
        } catch (error) {
            console.error(error);
        }
    });

    const onError = jest.fn();
    const onWarn = jest.fn();

    const _api = api
        ? {
              push: jest.fn(api.push),
              pull: jest.fn(api.pull),
              upload: jest.fn(api.upload),
          }
        : undefined;

    const store = createStore({
        api: _api,
        dispatch,
        select,
        onError,
        onWarn,
    });

    return {
        initialState,
        getState,
        select,
        dispatch,
        onError,
        onWarn,
        store,
        api: _api,
    };
};

export const generateRandomString = (length = 5) =>
    Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, length);

export const generateRandomTestData = (numParents, numChildren, numChildrenChildren) => {
    const graph = {
        nodes: {
            root: { id: 'root' },
        },
        edges: {},
    };

    // generate debug data
    for (let i = 0; i < numParents; i += 1) {
        const parentId = uuid.v4();
        const parent = {
            id: parentId,
            createdDate: new Date().toISOString(),
            str: `${generateRandomString()}/${generateRandomString()}`,
            arr: [generateRandomString(), generateRandomString()],
        };
        assocPathMutate(['nodes', parentId], parent)(graph);
        assocPathMutate(['edges', 'root', 'root', 'parent', parentId], true)(graph);
        for (let j = 0; j < numChildren; j += 1) {
            const childId = uuid.v4();
            const child = {
                id: childId,
                createdDate: new Date().toISOString(),
                bool: true,
                num: Math.random(),
            };
            assocPathMutate(['nodes', childId], child)(graph);
            assocPathMutate(['edges', 'parent', parentId, 'child', childId], true)(graph);
            for (let k = 0; k < numChildrenChildren; k += 1) {
                const childChildId = uuid.v4();
                const childChild = {
                    id: childChildId,
                    createdDate: new Date().toISOString(),
                    bool: true,
                    num: Math.random(),
                };
                assocPathMutate(['nodes', childChildId], childChild)(graph);
                assocPathMutate(['edges', 'child', childId, 'childchild', childChildId], true)(graph);
            }
        }
    }
    return {
        stateId: 12345,
        main: { graph },
        //   temp: { graph }
    };
};

export const randomTestDataView = {
    root: {
        as: 'root',
        edges: {
            'root/parent': {
                as: 'parents',
                include: {
                    node: true,
                    edges: true,
                },
                edges: {
                    'parent/child': {
                        as: 'children',
                        include: {
                            node: true,
                            edges: true,
                        },
                        edges: {
                            'child/childchild': {
                                as: 'childchildren',
                                include: {
                                    node: true,
                                    edges: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
