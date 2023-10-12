/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { useEqualRef } from '../util.js';
import { createTestComponent, delay } from './shared.jsx';

describe('useEqualRef', () => {
    test('should return the same primitive value on every render and trigger memo only once when supplied with the identical primitive', async () => {
        const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(true);
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return <div data-testid="exists" onClick={() => setState(Math.random())} />;
        });

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
        const instance = { value: 'abc' };

        const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(instance);
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return <div data-testid="exists" onClick={() => setState(Math.random())} />;
        });

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
        const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef({ value: 'abc' });
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return <div data-testid="exists" onClick={() => setState(Math.random())} />;
        });

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
        const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef({ value: state });
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return <div data-testid="exists" onClick={() => setState(Math.random())} />;
        });

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
        const instance = () => ({ value: 'abc' });

        const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(instance);
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return <div data-testid="exists" onClick={() => setState(Math.random())} />;
        });

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
        const { TestComponent, renderPayloads } = createTestComponent(({ onRender }) => {
            const [state, setState] = useState();
            const value = useEqualRef(() => ({ value: 'abc' }));
            let memoCalled = false;
            const memo = useMemo(() => {
                memoCalled = true;
                return value;
            }, [value]);
            onRender({ value, memoCalled });
            return <div data-testid="exists" onClick={() => setState(Math.random())} />;
        });

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
