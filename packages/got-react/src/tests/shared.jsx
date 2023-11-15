/* eslint-disable no-unused-vars */
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from '@gothub-team/got-store';
import { combineReducers, createStore as createReduxStore } from 'redux';
import * as R from 'ramda';
import '@testing-library/jest-dom';
import { generateNewRandom } from '@gothub-team/got-util';
import { gotReducer, createHooks } from '../index.js';

export const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(ms), ms));

export const testReducer = (state = 0, action) => {
    if (action.type === 'TEST_ACTION') {
        return generateNewRandom(state);
    }

    return state;
};

export const getMockSetup = () => {
    const rootReducer = combineReducers({
        got: gotReducer,
        test: testReducer,
    });
    const reduxStore = createReduxStore(rootReducer);

    const store = createStore({
        dispatch: reduxStore.dispatch,
        select: (selector) => selector(R.propOr({}, 'got', reduxStore.getState())),
        onWarn: () => {},
    });

    const mockStore = R.map((fn) => jest.fn(fn), store);

    const { useGraph } = createHooks({
        baseState: R.propOr({}, 'got'),
        store: mockStore,
    });

    return {
        reduxStore,
        store,
        mockStore,
        useGraph,
    };
};

export const createTestComponent = (_Component) => {
    const renderPayloads = [];

    const onRender = (payload) => {
        renderPayloads.push(payload);
    };

    const mockSetup = getMockSetup();
    const { reduxStore, useGraph, store } = mockSetup;

    const Component = React.memo(_Component);

    const TestComponent = ({ ...props }) => (
        <Provider store={reduxStore}>
            <Component useGraph={useGraph} onRender={onRender} gotStore={store} {...props} />
        </Provider>
    );

    return {
        TestComponent,
        ...mockSetup,
        renderPayloads,
    };
};

export const basicStack = ['main', 'edit'];
export const basicGraph = {
    nodes: {
        node1: { id: 'node1', prop: 'value1' },
        node2: { id: 'node2', prop: 'value2' },
    },
    edges: {
        from: {
            node1: {
                to: {
                    node2: { metadataVal: 'metVal1' },
                },
            },
        },
    },
};

export const basicView = {
    node1: {
        include: {
            node: true,
        },
        edges: {
            'from/to': {
                include: {
                    node: true,
                    edges: true,
                    metadata: true,
                },
            },
        },
    },
};
