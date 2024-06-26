import * as R from 'ramda';
import { createApi } from '@gothub-team/got-api';
import { createStore, gotReducer } from '@gothub-team/got-store';
import { getLocalStorageSessionStore } from './util.js';
import { configureCreateGraph } from './createGraph.js';
import { configureUseGraph } from './useGraph.js';

export { gotReducer } from '@gothub-team/got-store';
export { setFnEquals } from './useGraph.js';
export { createLocalGraph } from './createLocalGraph.js';

export const createHooks = ({ store, useSelector, baseState = R.identity }) => {
    const createGraph = configureCreateGraph(store);
    const useGraph = configureUseGraph({ store, useSelector, baseState, createGraph });

    return {
        createGraph,
        useGraph,
    };
};

export const setup = ({
    host, // string
    reduxStore, // Redux Store
    atom,
    useSelector,
    baseState, // string
    onError = console.error,
    onWarn = console.warn,
    adminMode = false,
    sessionExpireTime,
    sessionStore,
}) => {
    if (!reduxStore && !atom) {
        onError('You must provide either a Redux store or an Atom');
        return;
    }
    if (!useSelector) {
        onError('You must provide a useSelector function');
        return;
    }
    const api = createApi({
        host,
        adminMode,
        sessionStore: sessionStore || getLocalStorageSessionStore(`got-auth_${host}`),
        sessionExpireTime,
    });
    const dispatch = atom ? (action) => atom.set(gotReducer(atom.get(), action)) : reduxStore.dispatch;
    const getState = atom ? atom.get : reduxStore.getState;
    const store = createStore({
        api,
        dispatch,
        select: baseState
            ? (selector) => selector(R.propOr({}, baseState, getState()))
            : (selector) => selector(getState()),
        onError,
        onWarn,
    });
    const { createGraph, useGraph } = createHooks({
        store,
        useSelector,
        baseState: baseState ? R.prop(baseState) : R.identity,
    });
    return {
        createGraph,
        useGraph,
        store,
        api,
    };
};
