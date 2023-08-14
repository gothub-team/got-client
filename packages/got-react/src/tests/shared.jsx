/* eslint-disable no-unused-vars */
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from '@gothub-team/got-store';
import * as R from 'ramda';
import '@testing-library/jest-dom';
import { generateNewRandom } from '@gothub-team/got-util';
import { createHooks } from '../index.js';
import { createGotAtom } from '../index.js';

export const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(ms), ms));

export const testReducer = (state = 0, action) => {
    if (action.type === 'TEST_ACTION') {
        return generateNewRandom(state);
    }

    return state;
};

export const getMockSetup = () => {
    const atom = createGotAtom();

    const store = createStore({
        dispatch: atom.dispatch,
        select: (selector) => selector(atom.getState()),
        onWarn: () => {},
    });

    const mockStore = R.map((fn) => jest.fn(fn), store);

    const { useGraph } = createHooks({
        atom,
        store: mockStore,
    });

    return {
        atom,
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
    const { useGraph, store } = mockSetup;

    const Component = React.memo(_Component);

    const TestComponent = ({ ...props }) => (
        <Component useGraph={useGraph} onRender={onRender} gotStore={store} {...props} />
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
