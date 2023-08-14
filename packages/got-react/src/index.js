import { createApi } from '@gothub-team/got-api';
import { createStore, gotReducer } from '@gothub-team/got-store';
import { getLocalStorageSessionStore } from './util.js';
import { configureCreateGraph } from './createGraph.js';
import { configureUseGraph } from './useGraph.js';
import { atom as createAtom } from '@gothub-team/got-atom';

export { gotReducer } from '@gothub-team/got-store';
export { setFnEquals } from './useGraph.js';

export const createGotAtom = () => {
    const gotAtom = createAtom({});

    const dispatch = (action) => {
        gotAtom.set(gotReducer(gotAtom.get(), action));
    };

    return {
        ...gotAtom,
        dispatch,
        getState: gotAtom.get,
    };
};

export const createHooks = ({ atom, store }) => {
    const createGraph = configureCreateGraph(store);
    const useGraph = configureUseGraph({ atom, store, createGraph });

    return {
        createGraph,
        useGraph,
    };
};

export const setup = ({
    host, // string
    reduxStore, // Redux Store
    onError = console.error,
    onWarn = console.warn,
    adminMode = false,
    sessionExpireTime,
}) => {
    const api = createApi({
        host,
        adminMode,
        sessionStore: getLocalStorageSessionStore(`got-auth_${host}`),
        sessionExpireTime,
    });
    const atom = createGotAtom();

    const store = createStore({
        api,
        dispatch: atom.dispatch,
        select: (selector) => selector(reduxStore.getState()),
        onError,
        onWarn,
    });

    const { useGraph, createGraph } = createHooks({
        atom,
        store,
    });

    return {
        createGraph,
        useGraph,
        store,
        api,
    };
};
