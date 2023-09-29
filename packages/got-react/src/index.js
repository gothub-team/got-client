import * as R from 'ramda';
import { createApi } from '@gothub-team/got-api';
import { createStore } from '@gothub-team/got-store';
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
    baseState, // string
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
    const store = createStore({
        api,
        dispatch: reduxStore.dispatch,
        select: selector => baseState
            ? selector(R.propOr({}, baseState, reduxStore.getState()))
            : selector(reduxStore.getState()),
        onError,
        onWarn,
    });
    const {
        useGraph,
    } = createHooks({
        store,
        baseState: baseState
            ? R.prop(baseState)
            : R.identity,
    });
    return {
        useGraph,
        store,
        api,
    };
};