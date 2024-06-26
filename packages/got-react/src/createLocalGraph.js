import { configureCreateGraph } from './createGraph';
import { createStore, gotReducer } from '@gothub-team/got-store';

const createLocalState = (initialState = {}) => {
    let state = initialState;

    const getState = () => state;

    const select = (selector) => selector(state);

    const dispatch = (action) => {
        try {
            state = gotReducer(state, action);
        } catch (error) {
            console.error(error);
        }
    };

    const store = createStore({
        dispatch,
        select,
        onError: console.error,
        onWarn: () => {},
    });

    return {
        store,
        select,
        dispatch,
        getState,
    };
};

export const createLocalGraph = (initialState = {}) => {
    const { store, getState } = createLocalState(initialState);

    const createGraph = configureCreateGraph(store);
    const graphFns = createGraph('main', 'edit');

    const getGraph = (graphName = 'edit') => getState()?.[graphName]?.graph || {};
    return { ...graphFns, store, getState, getGraph };
};
