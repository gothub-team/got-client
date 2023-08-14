export type Fn<T> = (value: T) => T;
export type FnOrValue<T> = Fn<T> | T;
export type Subscriber<T> = {
    next: (value: T) => void;
};
export type Selector<T, R> = (value: T) => R;

/**
 * Atom is a state container that holds a single value of type T.
 * It can be subscribed to and updated with a new value.
 * @typeParam T The type of the value that the atom holds.
 * @public
 * @example
 * const atom = createAtom(0);
 * atom.subscribe({ next: (value) => console.log(value) });
 * atom.set(1);
 * atom.set((value) => value + 1);
 * atom.get(); // 2
 * atom.unsubscribe(subscriber);
 * @see {@link atom}
 */
export type Atom<T> = {
    value: { current: T };
    /**
     * @returns The current value of the atom.
     */
    get: () => T;
    /**
     * Updates the value of the atom.
     * @param valueOrFnValue The new value or a function that receives the current value and returns the new value.
     * @example
     * atom.set(1);
     * atom.set((value) => value + 1);
     * @see {@link Atom}
     * @see {@link useAtom}
     */
    set: (valueOrFnValue: FnOrValue<T>) => void;
    /**
     * Subscribes to the atom.
     * @param subscriber The subscriber to be notified when the atom's value changes.
     * @example
     * const subscriber = { next: (value) => console.log(value) };
     * atom.subscribe(subscriber);
     * atom.unsubscribe(subscriber);
     * @see {@link Atom}
     */
    subscribe: (subscriber: Subscriber<T>) => void;
    /**
     * Unsubscribes from the atom.
     * @param subscriber The subscriber to be unsubscribed.
     * @example
     * const subscriber = { next: (value) => console.log(value) };
     * atom.subscribe(subscriber);
     * atom.unsubscribe(subscriber);
     * @see {@link Atom}
     */
    unsubscribe: (subscriber: Subscriber<T>) => void;
};
