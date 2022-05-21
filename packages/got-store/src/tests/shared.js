import * as R from 'ramda';
import { createStore, gotReducer } from '../index.js';

export const createTestStore = (initialState = {}, api = undefined) => {
    let state = R.clone(initialState);

    const getState = () => state;

    const select = selector => selector(state);

    const dispatch = jest.fn(action => {
        try {
            state = gotReducer(state, action);
        } catch (error) {
            console.error(error);
        }
    });

    const onError = jest.fn();
    const onWarn = jest.fn();

    const _api = api
        ? {
            push: jest.fn(api.push),
            pull: jest.fn(api.pull),
            upload: jest.fn(api.upload),
        }
        : undefined;

    const store = createStore({
        api: _api,
        dispatch,
        select,
        onError,
        onWarn,
    });

    return {
        initialState,
        getState,
        select,
        dispatch,
        onError,
        onWarn,
        store,
        api: _api,
    };
};
