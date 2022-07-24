/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { act, render, waitFor } from '@testing-library/react';
import * as R from 'ramda';
import '@testing-library/jest-dom';
import {
    basicGraph,
    basicStack,
    basicView,
    createTestComponent,
    delay,
} from './shared.jsx';
import { setFnEquals } from '../index.js';

// TODO fix JSX detection
// TODO use workspace module, for now it causes hook errors for some reason

describe('verifying test setup', () => {
    test('should render only once when rendering a plain component', async () => {
        const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
            onRender();
            return (
                <div data-testid="exists" />
            );
        });

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        expect(getByTestId('exists')).toBeTruthy();

        await delay(100);
        expect(renderPayloads.length).toBe(1);
    });
    test('should rerender on related test redux updates', async () => {
        const { TestComponent, reduxStore, renderPayloads } = createTestComponent(({ onRender }) => {
            const value = useSelector(R.prop('test'));
            onRender(value);
            return (
                <div data-testid="exists" />
            );
        });

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
        const fnSelect = jest.fn(R.prop('invalid-prop'));

        const { TestComponent, reduxStore, renderPayloads } = createTestComponent(({ onRender }) => {
            const dispatch = useDispatch();
            const value = useSelector(fnSelect);
            onRender(dispatch);
            return (
                <div data-testid="exists" onClick={() => dispatch({ type: 'TEST_ACTION' })} />
            );
        });

        await delay(10);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        expect(renderPayloads.length).toBe(1);
        expect(fnSelect).toHaveBeenCalledTimes(3 + 1); // +1 since useSelector calls selector an additional time after component mount
    });
});

describe('useView', () => {
    describe('Return value', () => {
        test('should select the same data as the store when rendering only once', async () => {
            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                // const val = useEqualRef('value');
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

            expect(renderPayloads[0]).toEqual(store.getView(...basicStack)(basicView));
        });
        test('should select the same data as the store when rendering multiple times', async () => {
            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

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
        test('should select the same data as the store when dispatching action in useEffect', async () => {
            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, gotStore, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);

                useEffect(() => {
                    gotStore.setNode('main')({ id: 'node1', prop: 'secondValue' });
                }, []);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const storeViewRes1 = store.getView(...basicStack)(basicView);

            const { getByTestId } = render(<TestComponent />);

            await delay(100);

            const storeViewRes2 = store.getView(...basicStack)(basicView);

            expect(renderPayloads.length).toBe(2);
            expect(renderPayloads[0]).toEqual(storeViewRes1);
            expect(renderPayloads[1]).toEqual(storeViewRes2);
        });
        test('should return the same object instance when rendering multiple times', async () => {
            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

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
    });

    describe('Render behavior', () => {
        test('should render only once when no updates occur', async () => {
            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                // const val = useEqualRef('value');
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            expect(getByTestId('exists')).toBeTruthy();

            await delay(100);
            expect(renderPayloads.length).toBeLessThanOrEqual(1);

            expect(renderPayloads[0]).toEqual(store.getView(...basicStack)(basicView));
        });
        test('should rerender when view relevant data changes', async () => {
            const {
                TestComponent, store, mockStore, reduxStore, renderPayloads,
            } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

            const testState1 = reduxStore.getState().got;
            const testRes1 = store.getView(...basicStack)(basicView);

            await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
            const testState2 = reduxStore.getState().got;
            const testRes2 = store.getView(...basicStack)(basicView);

            await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));
            const testState3 = reduxStore.getState().got;
            const testRes3 = store.getView(...basicStack)(basicView);

            expect(testState1).not.toEqual(testState2);
            expect(testState2).not.toEqual(testState3);

            expect(renderPayloads[0]).toEqual(testRes1);
            expect(renderPayloads[1]).toEqual(testRes2);
            expect(renderPayloads[2]).toEqual(testRes3);

            await delay(100);
            expect(renderPayloads.length).toBe(3);
        });
        test('should rerender only once when view irrelevant data in stack changes', async () => {
            const {
                TestComponent, store, mockStore, reduxStore, renderPayloads,
            } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
            await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

            await delay(100);
            expect(renderPayloads.length).toBe(1);
        });
        test('should rerender only once when view relevant data in stack changes but downselector returns the same value', async () => {
            const mockSelector = jest.fn(R.always(true));

            const { TestComponent, store, reduxStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView, mockSelector);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

            const testState1 = reduxStore.getState().got;
            const testRes1 = store.getView(...basicStack)(basicView);

            await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
            const testState2 = reduxStore.getState().got;
            const testRes2 = store.getView(...basicStack)(basicView);

            await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));
            const testState3 = reduxStore.getState().got;
            const testRes3 = store.getView(...basicStack)(basicView);

            expect(testState1).not.toEqual(testState2);
            expect(testState2).not.toEqual(testState3);

            await delay(100);
            expect(renderPayloads.length).toBe(1);
        });
    });

    describe('selectView calls', () => {
        test('should call selectView only once when rendering multiple times due to unrelated state hook updates', async () => {
            const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());

            await delay(100);

            expect(renderPayloads.length).toBe(3);
            expect(mockStore.selectView).toHaveBeenCalledTimes(1);
        });
        test('should call selectView only once when rendering multiple times due to unrelated test redux updates', async () => {
            const { TestComponent, mockStore, reduxStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const value = useSelector(R.prop('test'));
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender([value, viewRes]);
                return (
                    <div data-testid="exists" />
                );
            });

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
        test('should call selectView only once when rendering multiple times with equal view instances', async () => {
            const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView({ ...basicView });
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());

            await delay(100);

            expect(renderPayloads.length).toBe(3);
            expect(mockStore.selectView).toHaveBeenCalledTimes(1);
        });
        test('should call selectView only once when rendering multiple times with equal stack instances', async () => {
            const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...[...basicStack]);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());

            await delay(100);

            expect(renderPayloads.length).toBe(3);
            expect(mockStore.selectView).toHaveBeenCalledTimes(1);
        });
        test('should call selectView multiple times when view relevant data changes', async () => {
            const {
                TestComponent, store, mockStore, reduxStore, renderPayloads,
            } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
            await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

            await delay(100);

            expect(mockStore.selectView).toHaveBeenCalledTimes(3);
        });
        test('should call selectView multiple times when view irrelevant data in stack changes', async () => {
            const {
                TestComponent, store, mockStore, reduxStore, renderPayloads,
            } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
            await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

            await delay(100);
            expect(mockStore.selectView).toHaveBeenCalledTimes(3);
        });
    });

    describe('downselector calls', () => {
        test('should call downselector only once when rendering multiple times due to unrelated state hook updates', async () => {
            const mockSelector = jest.fn(R.identity);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView, mockSelector);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());
            expect(renderPayloads.length).toBe(3);

            expect(mockSelector).toHaveBeenCalledTimes(1);
        });
        test('should call downselector only once when rendering multiple times due to unrelated test redux updates', async () => {
            const mockSelector = jest.fn(R.identity);

            const { TestComponent, reduxStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const value = useSelector(R.prop('test'));
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView, mockSelector);
                onRender([value, viewRes]);
                return (
                    <div data-testid="exists" />
                );
            });

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

            expect(mockSelector).toHaveBeenCalledTimes(1);
        });
        test('should call downselector multiple times when view relevant data changes', async () => {
            const mockSelector = jest.fn(R.identity);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView, mockSelector);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
            await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

            await delay(100);

            expect(mockSelector).toHaveBeenCalledTimes(3);
        });
        test('should call downselector multiple times when view irrelevant data in stack changes', async () => {
            const mockSelector = jest.fn(R.identity);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView, mockSelector);
                onRender(viewRes);
                return (
                    <div data-testid="exists" />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
            await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

            await delay(100);
            expect(mockSelector).toHaveBeenCalledTimes(3);
        });
        test('should call downselector multiple times but selectView only once if only downselector changes', async () => {
            const mockSelector = jest.fn(R.identity);

            const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView, data => mockSelector(data));
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());

            await delay(100);

            expect(renderPayloads.length).toBe(3);
            expect(mockStore.selectView).toHaveBeenCalledTimes(1);
            expect(mockSelector).toHaveBeenCalledTimes(3);
        });
    });

    describe('fnEquals calls', () => {
        test('should not call fnEquals when rendering multiple times due to unrelated state hook updates', async () => {
            const fnEquals = jest.fn(R.equals);
            setFnEquals(fnEquals);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());

            setFnEquals(R.equals);
            expect(renderPayloads.length).toBe(3);

            expect(fnEquals).toHaveBeenCalledTimes(0);
        });
        test('should not call fnEquals when rendering multiple times due to unrelated redux updates', async () => {
            const fnEquals = jest.fn(R.equals);
            setFnEquals(fnEquals);

            const { TestComponent, mockStore, reduxStore, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const value = useSelector(R.prop('test'));
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender([value, viewRes]);
                return (
                    <div data-testid="exists" />
                );
            });

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

            setFnEquals(R.equals);
            expect(renderPayloads.length).toBe(3);

            expect(fnEquals).toHaveBeenCalledTimes(0);
        });
        test('should call fnEquals every time when rendering multiple times due to view unrelated data changes', async () => {
            const fnEquals = jest.fn(R.equals);
            setFnEquals(fnEquals);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists"/>
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
            await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

            await delay(100);

            setFnEquals(R.equals);
            expect(renderPayloads.length).toBe(1);

            expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
        });
        test('should call fnEquals every time when rendering multiple times due to view related data changes', async () => {
            const fnEquals = jest.fn(R.equals);
            setFnEquals(fnEquals);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
            await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

            await delay(100);

            setFnEquals(R.equals);
            expect(renderPayloads.length).toBe(3);

            expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
        });
        test('should call fnEquals every time when rendering multiple times due to new view instances', async () => {
            const fnEquals = jest.fn(R.equals);
            setFnEquals(fnEquals);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState(Math.random());
                const { useView } = useGraph(...basicStack);
                const view = {
                    ...basicView,
                    [state]: {
                        include: {
                            node: true,
                        },
                    },
                };
                const viewRes = useView(view, data => data);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());

            setFnEquals(R.equals);
            expect(renderPayloads.length).toBe(3);

            expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
        });
        test('should call fnEquals every time when rendering multiple times due to new downselector instances', async () => {
            const fnEquals = jest.fn(R.equals);
            setFnEquals(fnEquals);

            const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                const [state, setState] = useState();
                const { useView } = useGraph(...basicStack);
                const viewRes = useView(basicView, data => data);
                onRender(viewRes);
                return (
                    <div data-testid="exists" onClick={() => setState(Math.random())} />
                );
            });

            store.mergeGraph(basicGraph, 'main');

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('exists');

            await act(() => element.click());
            await act(() => element.click());

            setFnEquals(R.equals);
            expect(renderPayloads.length).toBe(3);

            expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
        });
    });
});
