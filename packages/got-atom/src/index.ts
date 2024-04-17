import { useEffect, useMemo, useReducer, useRef } from 'react';
import equals from 'fast-deep-equal';
import { type FnOrValue, type Atom, type Subscriber, type Selector, type Fn } from './types';

export { type Atom } from './types';
export { persistAtom } from './persist';

/**
 * Creates an atom with an initial value.
 * @typeParam T The type of the value that the atom holds.
 * @param initialValue The initial value of the atom.
 * @example
 * const atom = createAtom(0);
 * atom.subscribe({ next: (value) => console.log(value) });
 * atom.set(1);
 * atom.set((value) => value + 1);
 * atom.get(); // 2
 * atom.unsubscribe(subscriber);
 * @see {@link Atom}
 * @see {@link useAtom}
 */
export const atom = <T>(initialValue: T): Atom<T> => {
    const value = { current: initialValue };
    const subscribers: Subscriber<T>[] = [];
    return {
        value,
        get: () => value.current,
        set: (valueOrFnValue: FnOrValue<T>) => {
            value.current =
                typeof valueOrFnValue === 'function' ? (valueOrFnValue as Fn<T>)(value.current) : valueOrFnValue;
            subscribers.forEach(
                (subscriber) => typeof subscriber.next === 'function' && subscriber.next(value.current),
            );
        },
        subscribe: (subscriber: Subscriber<T>) => subscribers.push(subscriber),
        unsubscribe: (subscriber: Subscriber<T>) => subscribers.splice(subscribers.indexOf(subscriber), 1),
    };
};

/**
 * Creates an atom with an initial value on component mount.
 * @typeParam T The type of the value that the atom holds.
 * @param initialValue The initial value of the atom.
 */
export const useCreateAtom = <T>(initialValue: T) => useMemo(() => atom<T>(initialValue), []);

/**
 * Hook to subscribe to an atom. Will update when the atom's value changes.
 * Intakes a selector function to select a value from the atom's state to be checked for equality and returned.
 * @typeParam T The type of the value that the atom holds.
 * @typeParam R The type of the value that the hook returns.
 * @param atom The atom to be subscribed to.
 * @param selector A function that receives the atom's value and returns a value of type R.
 */
export const useAtom = <T, R = T>(
    { value, subscribe, unsubscribe }: Atom<T>,
    selector: Selector<T, R> = (s) => s as unknown as R,
    fnEquals: (a: R | undefined, b: R | undefined) => boolean = equals as unknown as (
        a: R | undefined,
        b: R | undefined,
    ) => boolean,
) => {
    const localValue = useRef<R>();
    if (localValue.current === undefined) {
        localValue.current = selector(value.current);
    }

    const [, forceUpdate] = useReducer(() => ({}), {});

    const selectorRef = useRef<Selector<T, R>>(selector);
    if (selector !== selectorRef.current) {
        selectorRef.current = selector;
        const updatedValue = selector(value.current);
        // TODO: fix this eslint-disable
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!fnEquals(updatedValue, localValue.current)) {
            localValue.current = updatedValue;
        }
    }

    useEffect(() => {
        const subscriber = {
            next: (newValue: T) => {
                const updatedValue = selectorRef.current(newValue);
                // TODO: fix this eslint-disable
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                if (!fnEquals(updatedValue, localValue.current)) {
                    localValue.current = updatedValue;
                    forceUpdate();
                }
            },
        };
        subscribe(subscriber);
        return () => unsubscribe(subscriber);
    }, [subscribe, unsubscribe]);

    return localValue.current;
};

/**
 * Hook to subscribe to an atom. Will update when the atom's value changes.
 * Intakes a selector function to select a value from the atom's state to be checked for equality and returned.
 * This is a version of {@link useAtom} that will batch updates to the atom's value and update after using setTimeout.
 * @typeParam T The type of the value that the atom holds.
 * @typeParam R The type of the value that the hook returns.
 * @param atom The atom to be subscribed to.
 * @param selector A function that receives the atom's value and returns a value of type R.
 */
export const useAtomAsync = <T, R = T>(
    { value, subscribe, unsubscribe }: Atom<T>,
    selector: Selector<T, R> = (s) => s as unknown as R,
    fnEquals: (a: R | undefined, b: R | undefined) => boolean = equals as unknown as (
        a: R | undefined,
        b: R | undefined,
    ) => boolean,
) => {
    const localValue = useRef<R | undefined>();
    if (localValue.current === undefined) {
        localValue.current = selector(value.current);
    }
    const selectorRef = useRef<Selector<T, R>>(selector);

    const scheduledForUpdate = useRef(false);
    const [, forceRerender] = useReducer(() => ({}), {});

    const update = (rerender: boolean = true) => {
        scheduledForUpdate.current = false;
        const updatedValue = selectorRef.current(value.current);
        if (!fnEquals(localValue.current, updatedValue)) {
            localValue.current = updatedValue;
            rerender && forceRerender();
        }
    };

    if (selector !== selectorRef.current) {
        selectorRef.current = selector;
        update(false);
    }

    useEffect(() => {
        const subscriber = {
            next: () => {
                if (!scheduledForUpdate.current) {
                    scheduledForUpdate.current = true;
                    setTimeout(update, 0);
                }
            },
        };
        subscribe(subscriber);
        return () => unsubscribe(subscriber);
    }, [subscribe, unsubscribe]);

    return localValue.current;
};
