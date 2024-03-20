import * as R from 'ramda';
import { createApi } from '@gothub-team/got-api';
import { createStore, gotReducer } from '@gothub-team/got-store';
import { getLocalStorageSessionStore } from './util.js';
import { configureCreateGraph } from './createGraph.js';
import { configureUseGraph } from './useGraph.js';

export { gotReducer } from '@gothub-team/got-store';
export { setFnEquals } from './useGraph.js';

export const createHooks = ({ store, baseState = R.identity }) => {
    const createGraph = configureCreateGraph(store);
    const useGraph = configureUseGraph({ store, baseState, createGraph });

    return {
        createGraph,
        useGraph,
    };
};

export const setup = ({
    host, // string
    reduxStore, // Redux Store
    atom,
    baseState, // string
    onError = console.error,
    onWarn = console.warn,
    adminMode = false,
    sessionExpireTime,
}) => {
    if (!reduxStore && !atom) {
        onError('You must provide either a Redux store or an Atom');
        return;
    }
    const api = createApi({
        host,
        adminMode,
        sessionStore: getLocalStorageSessionStore(`got-auth_${host}`),
        sessionExpireTime,
    });
    const dispatch = atom ? action => atom.set(gotReducer(atom.get(), action)) : reduxStore.dispatch;
    const getState = atom ? atom.get : reduxStore.getState;
    const store = createStore({
        api,
        dispatch,
        select: (selector) =>
            baseState ? selector(R.propOr({}, baseState, getState())) : selector(getState()),
        onError,
        onWarn,
    });
    const { createGraph, useGraph } = createHooks({
        store,
        baseState: baseState ? R.prop(baseState) : R.identity,
    });
    return {
        createGraph,
        useGraph,
        store,
        api,
    };
};
