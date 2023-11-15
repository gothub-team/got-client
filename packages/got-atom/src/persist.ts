import { type Atom } from './types';

const getLocalStore = <T>(key: string) => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item) as T;
        }
    } catch (err) {
        console.error(err);
    }
    return null;
};

declare type Options<TAtom, TStorage> = {
    /**
     * Converts the atom's value to a value that can be stored in localStorage.
     */
    outbound?: (x: TAtom) => TStorage;
    /**
     * Converts a value stored in localStorage to the atom's value.
     * @param stored The value stored in localStorage.
     * @param current The current value of the atom.
     */
    inbound?: (stored: TStorage, current: TAtom) => TAtom;
};

/**
 * Persists an atom's value to localStorage.
 * @typeParam TAtom The type of the value that the atom holds.
 * @typeParam TStorage The type of the value that is stored in localStorage.
 * @param atom The atom to be persisted.
 * @param persistKey The key to be used in localStorage.
 * @param options The options to be used.
 */
export const persistAtom = <TAtom, TStorage>(
    atom: Atom<TAtom>,
    persistKey: string,
    {
        outbound = (x) => x as unknown as TStorage,
        inbound = (x) => x as unknown as TAtom,
    }: Options<TAtom, TStorage> = {},
) => {
    const localState = getLocalStore<TStorage>(persistKey);
    localState !== null && atom.set(inbound(localState, atom.get()));
    atom.subscribe({
        next: (value) => {
            localStorage.setItem(persistKey, JSON.stringify(outbound(value)));
        },
    });
};
