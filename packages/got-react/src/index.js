import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { useSelector } from 'react-redux';
import { createApi } from '@gothub-team/got-api';
import { createStore } from '@gothub-team/got-store';
import { useEffect, useMemo, useRef } from 'react';

export { gotReducer } from '@gothub-team/got-store';

const getLocalStorageSessionStore = sessionKey => ({
    getSession: () => {
        try {
            return JSON.parse(window.localStorage.getItem(sessionKey));
        } catch (error) {
            console.error('Invalid Session');
            return null;
        }
    },
    setSession: session => {
        session && window.localStorage.setItem(sessionKey, JSON.stringify(session));
    },
    removeSession: () => {
        window.localStorage.removeItem(sessionKey);
    },
});

export const setup = ({
    host, // string
    reduxStore, // Redux Store
    baseState, // string
    onError = console.error,
    onWarn = console.warn,
    adminMode = false,
}) => {
    const api = createApi({
        host,
        adminMode,
        sessionStore: getLocalStorageSessionStore(`got-auth_${host}`),
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

const useEqualRef = input => {
    const ref = useRef();

    useEffect(() => {
        if (!R.equals(input, ref.current)) {
            ref.current = input;
        }
    }, [input]);

    return ref.current;
};

export const createHooks = ({ store, baseState = R.identity }) => ({
    useGraph: (...stack) => {
        const currentGraphName = R.nth(-1, stack);
        const nextBelowGraphName = R.nth(-2, stack);
        const bottomGraphName = R.head(stack);

        const useVar = name => {
            const ref = useSelector(R.compose(
                store.selectVar(...stack)(name),
                baseState,
            ), R.equals);
            const setRef = value => store.setVar(currentGraphName)(name, value);

            return [ref, setRef];
        };
        const useView = (view, downSelector = R.identity) => {
            const _stack = useEqualRef(stack);
            const _view = useEqualRef(view);

            const _selectView = useMemo(() => store.selectView(...stack)(view), [_stack, _view]);

            const selector = useMemo(() => R.compose(
                downSelector,
                store.selectView(...stack)(view),
                baseState,
            ), [downSelector, _selectView, baseState]);

            const nodes = useSelector(selector, R.equals);

            return nodes;
        };
        const useNode = (nodeId, selector = R.identity) => {
            const node = useSelector(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(
                        selector,
                        store.selectNode(...stack)(nodeId),
                        baseState,
                    ),
                    RA.stubUndefined,
                ),
                R.equals,
            );

            return node;
        };
        const useMetadata = (edgeTypes, fromId, toId, selector = R.identity) => {
            const metadata = useSelector(
                R.ifElse(
                    R.always(edgeTypes && fromId && toId),
                    R.compose(
                        selector,
                        store.selectMetadata(...stack)(edgeTypes)(fromId)(toId),
                        baseState,
                    ),
                    RA.stubUndefined,
                ),
                R.equals,
            );

            return metadata;
        };
        const useEdge = (edgeTypes, fromId, selector = R.identity) => {
            const metadata = useSelector(
                R.ifElse(
                    R.always(edgeTypes && fromId),
                    R.compose(
                        selector,
                        store.selectEdge(...stack)(edgeTypes)(fromId),
                        baseState,
                    ),
                    RA.stubUndefined,
                ),
                R.equals,
            );

            return metadata;
        };
        const useRights = (nodeId, selector = R.identity) => {
            const rights = useSelector(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(
                        selector,
                        store.selectRights(...stack)(nodeId),
                        baseState,
                    ),
                    RA.stubUndefined,
                ),
                R.equals,
            );

            return rights;
        };
        const useFiles = (nodeId, selector = R.identity) => {
            const files = useSelector(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(
                        selector,
                        store.selectFiles(...stack)(nodeId),
                        baseState,
                    ),
                    RA.stubUndefined,
                ),
                R.equals,
            );

            return files;
        };

        const getVar = store.getVar(...stack);
        const setVar = store.setVar(currentGraphName);

        const push = () => store.push(currentGraphName, bottomGraphName);
        const pull = view => store.pull(view, bottomGraphName);
        const getView = store.getView(...stack);
        const merge = toGraphName => {
            if (toGraphName) {
                store.merge(currentGraphName, toGraphName);
            } else {
                store.merge(currentGraphName, nextBelowGraphName);
            }
        };
        const mergeGraph = (fromGraph, toGraphName) => {
            if (toGraphName) {
                store.mergeGraph(fromGraph, toGraphName);
            } else {
                store.mergeGraph(fromGraph, currentGraphName);
            }
        };
        const clear = () => store.clear(currentGraphName);
        const node = store.getNode(...stack);
        const update = store.setNode(currentGraphName);
        const edge = store.getEdge(...stack);
        const metadata = store.getMetadata(...stack);
        const add = store.add(currentGraphName);
        const remove = store.remove(currentGraphName);
        const assoc = store.assoc(currentGraphName);
        const dissoc = store.dissoc(currentGraphName);
        const rights = store.getRights(...stack);
        const setRights = store.setRights(currentGraphName);
        const inheritRights = store.inheritRights(currentGraphName);
        const files = store.getFiles(...stack);
        const setFile = store.setFile(currentGraphName);
        const removeFile = store.removeFile(currentGraphName);

        return {
            useVar,
            useView,
            useNode,
            useMetadata,
            useEdge,
            useRights,
            useFiles,
            getVar,
            setVar,
            push,
            pull,
            getView,
            merge,
            mergeGraph,
            clear,
            node,
            update,
            edge,
            metadata,
            add,
            remove,
            assoc,
            dissoc,
            rights,
            setRights,
            inheritRights,
            files,
            setFile,
            removeFile,
        };
    },
});
