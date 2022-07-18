/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { useEqualRef, useRefUpdated } from '../util.js';
import { createTestComponent, delay } from './shared.jsx';

describe('useEqualRef', () => {
    test('should return the same primitive value on every render and trigger memo only once when supplied with the identical primitive', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(true);
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0].value === renderPayloads[1].value).toBeTruthy();
        expect(renderPayloads[1].value === renderPayloads[2].value).toBeTruthy();
        expect(renderPayloads[0]).toEqual({ value: true, memoCalled: true });
        expect(renderPayloads[1]).toEqual({ value: true, memoCalled: false });
        expect(renderPayloads[2]).toEqual({ value: true, memoCalled: false });
    });
    test('should return the same object instance on every render and trigger memo only once when supplied with the same instance', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const instance = { value: 'abc' };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(instance);
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0].value === renderPayloads[1].value).toBeTruthy();
        expect(renderPayloads[1].value === renderPayloads[2].value).toBeTruthy();
        expect(renderPayloads[0]).toEqual({ value: instance, memoCalled: true });
        expect(renderPayloads[1]).toEqual({ value: instance, memoCalled: false });
        expect(renderPayloads[2]).toEqual({ value: instance, memoCalled: false });
    });
    test('should return the same object instance on every render and trigger memo only once when supplied with an equal instance', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef({ value: 'abc' });
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0].value === renderPayloads[1].value).toBeTruthy();
        expect(renderPayloads[1].value === renderPayloads[2].value).toBeTruthy();
        expect(renderPayloads[0]).toEqual({ value: { value: 'abc' }, memoCalled: true });
        expect(renderPayloads[1]).toEqual({ value: { value: 'abc' }, memoCalled: false });
        expect(renderPayloads[2]).toEqual({ value: { value: 'abc' }, memoCalled: false });
    });
    test('should return a different object instance on every render and trigger memo when supplied with a different object', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef({ value: state });
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0].value === renderPayloads[1].value).toBeFalsy();
        expect(renderPayloads[1].value === renderPayloads[2].value).toBeFalsy();
        expect(renderPayloads[0].memoCalled).toBeTruthy();
        expect(renderPayloads[1].memoCalled).toBeTruthy();
        expect(renderPayloads[2].memoCalled).toBeTruthy();
    });
    test('should return the same function instance on every render and trigger memo only once when supplied with the same instance', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const instance = () => ({ value: 'abc' });

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(instance);
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0].value === renderPayloads[1].value).toBeTruthy();
        expect(renderPayloads[1].value === renderPayloads[2].value).toBeTruthy();
        expect(renderPayloads[0]).toEqual({ value: instance, memoCalled: true });
        expect(renderPayloads[1]).toEqual({ value: instance, memoCalled: false });
        expect(renderPayloads[2]).toEqual({ value: instance, memoCalled: false });
    });
    test('should return a different function instance on every render and trigger memo when supplied with an equal instance', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(() => ({ value: 'abc' }));
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0].value === renderPayloads[1].value).toBeFalsy();
        expect(renderPayloads[1].value === renderPayloads[2].value).toBeFalsy();
        expect(renderPayloads[0].memoCalled).toBeTruthy();
        expect(renderPayloads[1].memoCalled).toBeTruthy();
        expect(renderPayloads[2].memoCalled).toBeTruthy();
    });
});

describe('useRefUpdated', () => {
    test('should be true only on the first render when supplied with the identical primitive', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const hasUpdated = useRefUpdated(true);
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(false);
        expect(renderPayloads[2]).toBe(false);
    });
    test('should be true only on the first render when supplied with the same instance', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const objInstance = { value: 'abc' };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const hasUpdated = useRefUpdated(objInstance);
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(false);
        expect(renderPayloads[2]).toBe(false);
    });
    test('should be true only on the first render when supplied with an equal instance', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const hasUpdated = useRefUpdated({ value: 'abc' });
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(false);
        expect(renderPayloads[2]).toBe(false);
    });
    test('should be true only on the first render when supplied with the same function instance', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const fnInstance = () => ({ value: 'abc' });

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const hasUpdated = useRefUpdated(fnInstance);
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(false);
        expect(renderPayloads[2]).toBe(false);
    });
    test('should be true on every render when supplied with an equal but newly constructed function', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const hasUpdated = useRefUpdated(() => ({ value: 'abc' }));
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(true);
        expect(renderPayloads[2]).toBe(true);
    });
    test('should be true on every render when supplied with an different function', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const hasUpdated = useRefUpdated(() => ({ value: state }));
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(true);
        expect(renderPayloads[2]).toBe(true);
    });
    test('should be true only on the first render when supplied with a memoized function', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const fn = useMemo(() => () => ({ value: 'abc' }), []);
            const hasUpdated = useRefUpdated(fn);
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(false);
        expect(renderPayloads[2]).toBe(false);
    });
    test('should be true only on the first render when supplied with a memoized function with unchanged dependencies', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const stack = ['main', 'temp'];
        const identifier = 'abc';

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const fn = useMemo(() => () => ({ value: 'abc' }), [stack, identifier]);
            const hasUpdated = useRefUpdated(fn);
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(false);
        expect(renderPayloads[2]).toBe(false);
    });
    test('should be true only on the first render when supplied with a memoized function with changing dependencies', async () => {
        const renderPayloads = [];

        const subscriber = {
            next: event => {
                if (event.type === 'render') { renderPayloads.push(event.payload); }
            },
        };

        const stack = ['main', 'temp'];
        const identifier = 'abc';

        const { TestComponent } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const fn = useMemo(() => () => ({ value: 'abc' }), [stack, identifier, state]);
            const hasUpdated = useRefUpdated(fn);
            onRender(hasUpdated);
            return (
                <div data-testid="exists" onClick={() => setState(Math.random())} />
            );
        }, subscriber);

        const { getByTestId } = render(<TestComponent />);

        await waitFor(() => expect(renderPayloads.length).toBeGreaterThanOrEqual(1));
        const element = getByTestId('exists');

        await act(() => element.click());
        await act(() => element.click());

        await delay(100);

        expect(renderPayloads.length).toBe(3);
        expect(renderPayloads[0]).toBe(true);
        expect(renderPayloads[1]).toBe(true);
        expect(renderPayloads[2]).toBe(true);
    });
});

describe('useSelector', () => {

});
