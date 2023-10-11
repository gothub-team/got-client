import * as R from 'ramda';
import { useRef } from 'react';

export const getLocalStorageSessionStore = (sessionKey) => ({
    getSession: () => {
        try {
            return JSON.parse(window.localStorage.getItem(sessionKey));
        } catch (error) {
            console.error('Invalid Session');
            return null;
        }
    },
    setSession: (session) => {
        session && window.localStorage.setItem(sessionKey, JSON.stringify(session));
    },
    removeSession: () => {
        window.localStorage.removeItem(sessionKey);
    },
});

/** React hook to safeguard inputs from triggering effects or memos by checking for deep equality */
export const useEqualRef = (input) => {
    const ref = useRef();
    const isEqual = R.equals(input, ref.current);
    if (!isEqual) {
        ref.current = input;
    }

    return ref.current;
};
