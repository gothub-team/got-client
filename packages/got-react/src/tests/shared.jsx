/* eslint-disable no-unused-vars */
import React from 'react';
import { Provider, useSelector as useSelectorRedux } from 'react-redux';
import { createStore } from '@gothub-team/got-store';
import { combineReducers, createStore as createReduxStore } from 'redux';
import * as R from 'ramda';
import '@testing-library/jest-dom';
import { generateNewRandom } from '@gothub-team/got-util';
import { gotReducer, createHooks } from '../index.js';
import { atom, useAtom } from '@gothub-team/got-atom';

export const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(ms), ms));

export const testReducer = (state = 0, action) => {
    if (action.type === 'TEST_ACTION') {
        return generateNewRandom(state);
    }

    return state;
};

export const getMockSetupRedux = () => {
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
        useSelector: useSelectorRedux,
        store: mockStore,
    });

    return {
        reduxStore,
        store,
        mockStore,
        useGraph,
    };
};

export const createTestComponentRedux = (_Component) => {
    const renderPayloads = [];

    const onRender = (payload) => {
        renderPayloads.push(payload);
    };

    const mockSetup = getMockSetupRedux();
    const { reduxStore, useGraph, store, mockStore } = mockSetup;

    const Component = React.memo(_Component);

    const TestComponent = ({ ...props }) => (
        <Provider store={reduxStore}>
            <Component useSelector={useSelectorRedux} dispatch={reduxStore.dispatch} useGraph={useGraph} onRender={onRender} gotStore={store} {...props} />
        </Provider>
    );

    return {
        TestComponent,
        dispatch: reduxStore.dispatch,
        getState: reduxStore.getState,
        useGraph,
        store,
        mockStore,
        renderPayloads,
    };
};

export const getMockSetupAtom = () => {
    const storeAtom = atom({});

    const dispatch = (action) => storeAtom.set(gotReducer(storeAtom.get(), action));
    const store = createStore({
        dispatch,
        select: (selector) => selector(storeAtom.get()),
        onWarn: () => {},
    });

    const mockStore = R.map((fn) => jest.fn(fn), store);

    const useSelector = (fnSelect, fnEquals) => useAtom(storeAtom, fnSelect, fnEquals);
    const { useGraph } = createHooks({
        baseState: R.identity,
        useSelector,
        store: mockStore,
    });

    return {
        store,
        mockStore,
        useGraph,
        getState: storeAtom.get,
        dispatch,
        useSelector,
    };
};

export const createTestComponentAtom = (_Component) => {
    const renderPayloads = [];

    const onRender = (payload) => {
        renderPayloads.push(payload);
    };

    const mockSetup = getMockSetupAtom();
    const { dispatch, getState, useGraph, store, mockStore, useSelector } = mockSetup;

    const Component = React.memo(_Component);

    const TestComponent = ({ ...props }) => (
        <Component useSelector={useSelector} dispatch={dispatch} useGraph={useGraph} onRender={onRender} gotStore={store} {...props} />
    );

    return {
        TestComponent,
        dispatch,
        getState,
        useGraph,
        store,
        mockStore,
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
