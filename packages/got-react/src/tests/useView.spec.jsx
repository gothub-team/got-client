import React, { useState, useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import * as R from 'ramda';
import equals from 'fast-deep-equal';
import '@testing-library/jest-dom';
import {
    basicGraph,
    basicStack,
    basicView,
    createTestComponentRedux,
    createTestComponentAtom,
    delay,
} from './shared.jsx';
import { setFnEquals } from '../index.js';

// TODO fix JSX detection
// TODO use workspace module, for now it causes hook errors for some reason
const runTestsWith = (createTestComponent, atomOrRedux) => {
    describe(`${atomOrRedux  } verifying test setup`, () => {
        test('should render only once when rendering a plain component', async () => {
            const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
                onRender();
                return <div data-testid="element" />;
            });

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            expect(getByTestId('element')).toBeTruthy();

            await delay(100);
            expect(renderPayloads.length).toBe(1);
        });
        atomOrRedux === 'Redux' && test('should rerender on related test redux updates', async () => {
            const { TestComponent, dispatch, getState, renderPayloads } = createTestComponent(
                ({ onRender, useSelector }) => {
                    const value = useSelector(R.prop('test'));
                    onRender(value);
                    return <div data-testid="element" />;
                },
            );

            render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

            const testState1 = getState().test;
            console.log('testState1', getState());
            await act(() => dispatch({ type: 'TEST_ACTION' }));
            const testState2 = getState().test;
            console.log('testState2', getState());
            await act(() => dispatch({ type: 'TEST_ACTION' }));
            const testState3 = getState().test;
            await delay(100);

            expect(testState1).not.toEqual(testState2);
            expect(testState2).not.toEqual(testState3);

            expect(renderPayloads.length).toBe(3);
        });
        test('should call selector on related test redux updates', async () => {
            const fnSelect = jest.fn(R.prop('invalid-prop'));

            const { TestComponent, renderPayloads } = createTestComponent(({ onRender, dispatch, useSelector }) => {
                useSelector(fnSelect);
                onRender(dispatch);
                return <div data-testid="element" onClick={() => dispatch({ type: 'TEST_ACTION' })} />;
            });

            await delay(10);

            const { getByTestId } = render(<TestComponent />);

            await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
            const element = getByTestId('element');

            await act(() => element.click());
            await act(() => element.click());

            expect(renderPayloads.length).toBe(1);
            expect(fnSelect).toHaveBeenCalledTimes(3 + 1); // +1 since useSelector calls selector an additional time after component mount
        });
    });

    describe(`${atomOrRedux  } useView`, () => {
        describe('Return value', () => {
            test('should select the same data as the store when rendering only once', async () => {
                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    // const val = useEqualRef('value');
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" />;
                });

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

                expect(renderPayloads[0]).toEqual(store.getView(...basicStack)(basicView));
            });
            test('should select the same data as the store when rendering multiple times', async () => {
                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const [, setState] = useState();
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" onClick={() => setState(Math.random())} />;
                });

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());
                expect(renderPayloads.length).toBe(3);

                const storeViewRes = store.getView(...basicStack)(basicView);

                expect(renderPayloads[0]).toEqual(storeViewRes);
                expect(renderPayloads[1]).toEqual(storeViewRes);
                expect(renderPayloads[2]).toEqual(storeViewRes);
            });
            test('should select the same data as the store when dispatching action in useEffect', async () => {
                const { TestComponent, store, renderPayloads } = createTestComponent(
                    ({ useGraph, gotStore, onRender }) => {
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView);
                        onRender(viewRes);

                        useEffect(() => {
                            gotStore.setNode('main')({ id: 'node1', prop: 'secondValue' });
                        }, []);
                        return <div data-testid="element" />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                const storeViewRes1 = store.getView(...basicStack)(basicView);

                render(<TestComponent />);

                await delay(100);

                const storeViewRes2 = store.getView(...basicStack)(basicView);

                expect(renderPayloads.length).toBe(2);
                expect(renderPayloads[0]).toEqual(storeViewRes1);
                expect(renderPayloads[1]).toEqual(storeViewRes2);
            });
            test('should return the same object instance when rendering multiple times', async () => {
                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const [, setState] = useState();
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" onClick={() => setState(Math.random())} />;
                });

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());
                expect(renderPayloads.length).toBe(3);

                expect(renderPayloads[0]).toBe(renderPayloads[1]);
                expect(renderPayloads[0]).toBe(renderPayloads[2]);
            });
        });

        describe('Render behavior', () => {
            test('should render only once when no updates occur', async () => {
                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    // const val = useEqualRef('value');
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" />;
                });

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                expect(getByTestId('element')).toBeTruthy();

                await delay(100);
                expect(renderPayloads.length).toBe(1);
            });
            test('should rerender when view relevant data change', async () => {
                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" />;
                });

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

                await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

                await delay(100);
                expect(renderPayloads.length).toBe(3);
            });
            test('should render only once when view irrelevant data in stack change', async () => {
                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" />;
                });

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

                await delay(100);
                expect(renderPayloads.length).toBe(1);
            });
            test('should render only once when view relevant data in stack change but fnTransform returns the same value', async () => {
                const mockSelector = jest.fn(R.always(true));

                const { TestComponent, store, getState, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender }) => {
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView, mockSelector);
                        onRender(viewRes);
                        return <div data-testid="element" />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

                const testState1 = getState().got || getState();

                await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
                const testState2 = getState().got || getState();

                await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));
                const testState3 = getState().got || getState();

                expect(testState1).not.toEqual(testState2);
                expect(testState2).not.toEqual(testState3);

                await delay(100);
                expect(renderPayloads.length).toBe(1);
            });
        });

        describe('selectView calls', () => {
            test('should call selectView only once when rendering multiple times due to unrelated state hook updates', async () => {
                const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender }) => {
                        const [, setState] = useState();
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView);
                        onRender(viewRes);
                        return <div data-testid="element" onClick={() => setState(Math.random())} />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());

                await delay(100);

                expect(renderPayloads.length).toBe(3);
                expect(mockStore.selectView).toHaveBeenCalledTimes(1);
            });
            atomOrRedux === 'Redux' && test('should call selectView only once when rendering multiple times due to unrelated test redux updates', async () => {
                const { TestComponent, mockStore, dispatch, getState, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender, useSelector }) => {
                        const value = useSelector(R.prop('test'));
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView);
                        onRender([value, viewRes]);
                        return <div data-testid="element" />;
                    },
                );

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

                const testState1 = getState().test;
                await act(() => dispatch({ type: 'TEST_ACTION' }));
                const testState2 = getState().test;
                await act(() => dispatch({ type: 'TEST_ACTION' }));
                const testState3 = getState().test;
                await delay(100);

                expect(testState1).toEqual(renderPayloads[0][0]);
                expect(testState1).not.toEqual(testState2);
                expect(testState2).toEqual(renderPayloads[1][0]);
                expect(testState2).not.toEqual(testState3);
                expect(testState3).toEqual(renderPayloads[2][0]);

                expect(renderPayloads.length).toBe(3);

                expect(mockStore.selectView).toHaveBeenCalledTimes(1);
            });
            test('should call selectView only once when rendering multiple times with equal view objects', async () => {
                const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender }) => {
                        const [, setState] = useState();
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView({ ...basicView });
                        onRender(viewRes);
                        return <div data-testid="element" onClick={() => setState(Math.random())} />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());

                await delay(100);

                expect(renderPayloads.length).toBe(3);
                expect(mockStore.selectView).toHaveBeenCalledTimes(1);
            });
            test('should call selectView only once when rendering multiple times with equal stack arrays', async () => {
                const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender }) => {
                        const [, setState] = useState();
                        const { useView } = useGraph(...[...basicStack]);
                        const viewRes = useView(basicView);
                        onRender(viewRes);
                        return <div data-testid="element" onClick={() => setState(Math.random())} />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());

                await delay(100);

                expect(renderPayloads.length).toBe(3);
                expect(mockStore.selectView).toHaveBeenCalledTimes(1);
            });
            test('should call selectView multiple times when view relevant data change', async () => {
                const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender }) => {
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView);
                        onRender(viewRes);
                        return <div data-testid="element" />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

                await delay(100);

                expect(mockStore.selectView).toHaveBeenCalledTimes(3);
            });
            test('should call selectView multiple times when view irrelevant data in stack change', async () => {
                const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender }) => {
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView);
                        onRender(viewRes);
                        return <div data-testid="element" />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

                await delay(100);
                expect(mockStore.selectView).toHaveBeenCalledTimes(3);
            });
        });

        describe('fnTransform calls', () => {
            test('should call fnTransform only once when rendering multiple times due to unrelated state hook updates', async () => {
                const mockSelector = jest.fn(R.identity);

                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const [, setState] = useState();
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView, mockSelector);
                    onRender(viewRes);
                    return <div data-testid="element" onClick={() => setState(Math.random())} />;
                });

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());
                expect(renderPayloads.length).toBe(3);

                expect(mockSelector).toHaveBeenCalledTimes(1);
            });
            atomOrRedux === 'Redux' && test('should call fnTransform only once when rendering multiple times due to unrelated test redux updates', async () => {
                const mockSelector = jest.fn(R.identity);

                const { TestComponent, dispatch, getState, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender, useSelector }) => {
                        const value = useSelector(R.prop('test'));
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView, mockSelector);
                        onRender([value, viewRes]);
                        return <div data-testid="element" />;
                    },
                );

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

                const testState1 = getState().test;
                await act(() => dispatch({ type: 'TEST_ACTION' }));
                const testState2 = getState().test;
                await act(() => dispatch({ type: 'TEST_ACTION' }));
                const testState3 = getState().test;
                await delay(100);

                expect(testState1).toEqual(renderPayloads[0][0]);
                expect(testState1).not.toEqual(testState2);
                expect(testState2).toEqual(renderPayloads[1][0]);
                expect(testState2).not.toEqual(testState3);
                expect(testState3).toEqual(renderPayloads[2][0]);

                expect(renderPayloads.length).toBe(3);

                expect(mockSelector).toHaveBeenCalledTimes(1);
            });
            test('should call fnTransform multiple times when view relevant data change', async () => {
                const mockSelector = jest.fn(R.identity);

                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView, mockSelector);
                    onRender(viewRes);
                    return <div data-testid="element" />;
                });

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

                await delay(100);

                expect(mockSelector).toHaveBeenCalledTimes(3);
            });
            test('should call fnTransform multiple times when view irrelevant data in stack change', async () => {
                const mockSelector = jest.fn(R.identity);

                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView, mockSelector);
                    onRender(viewRes);
                    return <div data-testid="element" />;
                });

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

                await delay(100);
                expect(mockSelector).toHaveBeenCalledTimes(3);
            });
            test('should call fnTransform multiple times but selectView only once if only fnTransform changes', async () => {
                const mockSelector = jest.fn(R.identity);

                const { TestComponent, store, mockStore, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender }) => {
                        const [, setState] = useState();
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView, (data) => mockSelector(data));
                        onRender(viewRes);
                        return <div data-testid="element" onClick={() => setState(Math.random())} />;
                    },
                );

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

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
                const fnEquals = jest.fn(equals);
                setFnEquals(fnEquals);

                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const [, setState] = useState();
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" onClick={() => setState(Math.random())} />;
                });

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());

                setFnEquals(equals);
                expect(renderPayloads.length).toBe(3);

                expect(fnEquals).toHaveBeenCalledTimes(0);
            });
            atomOrRedux === 'Redux' && test('should not call fnEquals when rendering multiple times due to unrelated redux updates', async () => {
                const fnEquals = jest.fn(equals);
                setFnEquals(fnEquals);

                const { TestComponent, dispatch, getState, renderPayloads } = createTestComponent(
                    ({ useGraph, onRender, useSelector }) => {
                        const value = useSelector(R.prop('test'));
                        const { useView } = useGraph(...basicStack);
                        const viewRes = useView(basicView);
                        onRender([value, viewRes]);
                        return <div data-testid="element" />;
                    },
                );

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));

                const testState1 = getState().test;
                await act(() => dispatch({ type: 'TEST_ACTION' }));
                const testState2 = getState().test;
                await act(() => dispatch({ type: 'TEST_ACTION' }));
                const testState3 = getState().test;
                await delay(100);

                expect(testState1).toEqual(renderPayloads[0][0]);
                expect(testState1).not.toEqual(testState2);
                expect(testState2).toEqual(renderPayloads[1][0]);
                expect(testState2).not.toEqual(testState3);
                expect(testState3).toEqual(renderPayloads[2][0]);

                setFnEquals(equals);
                expect(renderPayloads.length).toBe(3);

                expect(fnEquals).toHaveBeenCalledTimes(0);
            });
            test('should call fnEquals every time when rendering multiple times due to view unrelated data change', async () => {
                const fnEquals = jest.fn(equals);
                setFnEquals(fnEquals);

                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" />;
                });

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                await act(() => store.setNode('main')({ id: 'node3', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node4', prop: 'thirdValue' }));

                await delay(100);

                setFnEquals(equals);
                expect(renderPayloads.length).toBe(1);

                expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
            });
            test('should call fnEquals every time when rendering multiple times due to view related data change', async () => {
                const fnEquals = jest.fn(equals);
                setFnEquals(fnEquals);

                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const [, setState] = useState();
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView);
                    onRender(viewRes);
                    return <div data-testid="element" onClick={() => setState(Math.random())} />;
                });

                store.mergeGraph(basicGraph, 'main');

                render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                await act(() => store.setNode('main')({ id: 'node1', prop: 'secondValue' }));
                await act(() => store.setNode('main')({ id: 'node1', prop: 'thirdValue' }));

                await delay(100);

                setFnEquals(equals);
                expect(renderPayloads.length).toBe(3);

                expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
            });
            test('should call fnEquals every time when rendering multiple times due to changed view objects', async () => {
                const fnEquals = jest.fn(equals);
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
                    const viewRes = useView(view, (data) => data);
                    onRender(viewRes);
                    return <div data-testid="element" onClick={() => setState(Math.random())} />;
                });

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());

                setFnEquals(equals);
                expect(renderPayloads.length).toBe(3);

                expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
            });
            test('should call fnEquals every time when rendering multiple times due to new fnTransform instances', async () => {
                const fnEquals = jest.fn(equals);
                setFnEquals(fnEquals);

                const { TestComponent, store, renderPayloads } = createTestComponent(({ useGraph, onRender }) => {
                    const [, setState] = useState();
                    const { useView } = useGraph(...basicStack);
                    const viewRes = useView(basicView, (data) => data);
                    onRender(viewRes);
                    return <div data-testid="element" onClick={() => setState(Math.random())} />;
                });

                store.mergeGraph(basicGraph, 'main');

                const { getByTestId } = render(<TestComponent />);

                await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
                const element = getByTestId('element');

                await act(() => element.click());
                await act(() => element.click());

                setFnEquals(equals);
                expect(renderPayloads.length).toBe(3);

                expect(fnEquals).toHaveBeenCalledTimes(3 - 1); // -1 since we dont compare anything on the first render
            });
        });
    });
};

runTestsWith(createTestComponentAtom, 'Atom');
runTestsWith(createTestComponentRedux, 'Redux');
