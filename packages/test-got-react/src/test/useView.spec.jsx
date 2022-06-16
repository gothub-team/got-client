/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { act, render, waitFor } from '@testing-library/react';
import { gotReducer, createHooks } from '@gothub-team/got-react';
import { createStore } from '@gothub-team/got-store';
import { combineReducers, createStore as createReduxStore } from 'redux';
import * as R from 'ramda';
import '@testing-library/jest-dom';
import { generateNewRandom } from '@gothub-team/got-util';
import { delay } from './util.js';

// TODO fix JSX detection
// TODO use workspace module, for now it causes hook errors for some reason

const testReducer = (state = 0, action) => {
    if (action.type === 'TEST_ACTION') {
        return generateNewRandom(state);
    }

    return state;
};

const getMockSetup = () => {
    const rootReducer = combineReducers({
        got: gotReducer,
        test: testReducer,
    });
    const reduxStore = createReduxStore(
        rootReducer,
    );

    const store = createStore({
        dispatch: reduxStore.dispatch,
        select: selector => selector(R.propOr({}, 'got', reduxStore.getState())),
        onWarn: () => {},
    });

    const mockStore = R.map(fn => jest.fn(fn), store);

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

const createTestComponent = (_Component, subscriber) => {
    const {
        next = () => {},
        complete = () => {},
        error = () => {},
    } = subscriber;

    const onRender = payload => next({ type: 'render', payload });

    const mockSetup = getMockSetup();
    const { reduxStore, useGraph } = mockSetup;

    const Component = React.memo(_Component);

    const TestComponent = ({ ...props }) => (
        <Provider store={reduxStore}>
            <Component
                useGraph={useGraph}
                onRender={onRender}
                {...props}
            />
        </Provider>
    );

    return {
        TestComponent, ...mockSetup,
    };
};

const basicStack = ['main', 'edit'];
const basicGraph = {
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

const basicView = {
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

describe('verifying test setup', () => {
    test('should render only once when rendering a plain component', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            onRender();
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        expect(getByTestId('exists')).toBeTruthy();

        await delay(100);
        expect(renderPayloads.length).toBeLessThanOrEqual(1);
    });
    test('should rerender on related test redux updates', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, reduxStore } = createTestComponent(({ onRender }) => {
            const value = useSelector(R.prop('test'));
            onRender(value);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        const testState1 = reduxStore.getState().test;
        await act(() => reduxStore.dispatch({ type: 'TEST_ACTION' }));
        const testState2 = reduxStore.getState().test;
        await act(() => reduxStore.dispatch({ type: 'TEST_ACTION' }));
        const testState3 = reduxStore.getState().test;
        await delay(100);

        expect(testState1).not.toEqual(testState2);
        expect(testState2).not.toEqual(testState3);

        expect(renderPayloads.length).toBe(3);
    });
    test('should call selector on related test redux updates', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const fnSelect = jest.fn(R.prop('invalid-prop'));

        const { TestComponent, reduxStore } = createTestComponent(({ onRender }) => {
            const dispatch = useDispatch();
            const value = useSelector(fnSelect);
            onRender(dispatch);
            return (
                <div data-testid="exists" onClick={() => dispatch({ type: 'TEST_ACTION' })} />
            );
        }, subscriber);

        await delay(10);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        expect(renderPayloads.length).toBe(1);
        // TODO REVIEW this somehow renders 4 times instead of 3? 2 times right off the bat
        expect(fnSelect).toHaveBeenCalledTimes(4);
    });
});

describe('useView', () => {
    test('should render only once when no updates occur', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store } = createTestComponent(({ useGraph, onRender }) => {
            // const val = useEqualRef('value');
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        store.mergeGraph(basicGraph, 'main');

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        expect(getByTestId('exists')).toBeTruthy();

        await delay(100);
        expect(renderPayloads.length).toBeLessThanOrEqual(1);

        expect(renderPayloads[0]).toEqual(store.getView(...basicStack)(basicView));
    });
    test('should select the same data as the store when rendering only once', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store } = createTestComponent(({ useGraph, onRender }) => {
            // const val = useEqualRef('value');
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        store.mergeGraph(basicGraph, 'main');

        render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

        expect(renderPayloads[0]).toEqual(store.getView(...basicStack)(basicView));
    });
    test('should select the same data as the store when rendering multiple times', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store } = createTestComponent(({ useGraph, onRender }) => {
            const [state, setState] = useState();
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        store.mergeGraph(basicGraph, 'main');

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());
        expect(renderPayloads.length).toBe(3);

        const storeViewRes = store.getView(...basicStack)(basicView);

        expect(renderPayloads[0]).toEqual(storeViewRes);
        expect(renderPayloads[1]).toEqual(storeViewRes);
        expect(renderPayloads[2]).toEqual(storeViewRes);
    });
    test('should return the same object instance when rendering multiple times', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store } = createTestComponent(({ useGraph, onRender }) => {
            const [state, setState] = useState();
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        store.mergeGraph(basicGraph, 'main');

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());
        expect(renderPayloads.length).toBe(3);

        expect(renderPayloads[0] === renderPayloads[1]).toBeTruthy();
        expect(renderPayloads[0] === renderPayloads[2]).toBeTruthy();
    });
    test('should call selectView only once when rendering multiple times due to unrelated state hook updates', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store, mockStore } = createTestComponent(({ useGraph, onRender }) => {
            const [state, setState] = useState();
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        store.mergeGraph(basicGraph, 'main');

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());
        expect(renderPayloads.length).toBe(3);

        expect(mockStore.selectView).toHaveBeenCalledTimes(1);
    });
    test('should call selectView only once when rendering multiple times due to unrelated test redux updates', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, mockStore, reduxStore } = createTestComponent(({ useGraph, onRender }) => {
            const value = useSelector(R.prop('test'));
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender([value, viewRes]);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        const testState1 = reduxStore.getState().test;
        await act(() => reduxStore.dispatch({ type: 'TEST_ACTION' }));
        const testState2 = reduxStore.getState().test;
        await act(() => reduxStore.dispatch({ type: 'TEST_ACTION' }));
        const testState3 = reduxStore.getState().test;
        await delay(100);

        expect(testState1).toEqual(renderPayloads[0][0]);
        expect(testState1).not.toEqual(testState2);
        expect(testState2).toEqual(renderPayloads[1][0]);
        expect(testState2).not.toEqual(testState3);
        expect(testState3).toEqual(renderPayloads[2][0]);

        expect(renderPayloads.length).toBe(3);

        expect(mockStore.selectView).toHaveBeenCalledTimes(1);
    });
    test('should rerender when view relevant data changes', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store, mockStore, reduxStore } = createTestComponent(({ useGraph, onRender }) => {
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

        const testState1 = reduxStore.getState().got;
        await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
        const testState2 = reduxStore.getState().got;
        await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));
        const testState3 = reduxStore.getState().got;

        expect(testState1).not.toEqual(testState2);
        expect(testState2).not.toEqual(testState3);

        await delay(100);
        expect(renderPayloads.length).toBe(3);
    });
    test('should call selectView multiple times when view relevant data changes', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store, mockStore, reduxStore } = createTestComponent(({ useGraph, onRender }) => {
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
        await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

        await delay(100);

        expect(mockStore.selectView).toHaveBeenCalledTimes(3);
    });
    test('should not rerender when view irrelevant data changes', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store, mockStore, reduxStore } = createTestComponent(({ useGraph, onRender }) => {
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
        await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

        await delay(100);
        expect(renderPayloads.length).toBe(1);
    });
    test('should call selectView multiple times when view irrelevant data changes', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent, store, mockStore, reduxStore } = createTestComponent(({ useGraph, onRender }) => {
            const { useView } = useGraph(...basicStack);
            const viewRes = useView(basicView);
            onRender(viewRes);
            return (
                <div data-testid="exists" />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
        await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

        await delay(100);
        expect(mockStore.selectView).toHaveBeenCalledTimes(3);
    });
});
