/* eslint-disable import/no-extraneous-dependencies */
import * as R from 'ramda';
import * as uuid from 'uuid';
import { createStore, gotReducer } from '../index.js';

export const createTestStore = (initialState = {}, api = undefined) => {
    let state = R.clone(initialState);

    const getState = () => state;

    const select = selector => selector(state);

    const dispatch = jest.fn(action => {
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

export const generateRandomString = (length = 5) => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);

export const generateRandomTestData = (numParents, numChildrenPerParent) => {
    const {
        store: { add },
        getState,
    } = createTestStore({ });

    // generate debug data
    for (let i = 0; i < numParents; i += 1) {
        const parentId = uuid.v4();
        const parent = {
            id: parentId, createdDate: new Date().toISOString(), str: `${generateRandomString()}/${generateRandomString()}`, arr: [generateRandomString(), generateRandomString()],
        };
        add('main')('root/parent')('root')(parent);
        for (let j = 0; j < numChildrenPerParent; j += 1) {
            const childId = uuid.v4();
            const child = {
                id: childId, createdDate: new Date().toISOString(), bool: true, num: Math.random(),
            };
            add('main')('parent/child')(parentId)(child);
        }
    }
    return getState();
};

export const randomTestDataView = {
    'root': {
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
                    },
                },
            },
        },
    },
};
