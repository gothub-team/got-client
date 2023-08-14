import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { useCallback, useRef } from 'react';
import equal from 'fast-deep-equal';
import { useEqualRef } from './util.js';
import { useAtomAsync } from '@gothub-team/got-atom';

let fnEquals = equal;
export const setFnEquals = (fn) => {
    fnEquals = fn;
};

const useViewEquality = (prev, next) => {
    if (!prev) return false;
    if (!next.requireEqCheck) return true;
    return fnEquals(next.result, prev.result);
};

export const configureUseGraph =
    ({ atom, store, createGraph }) =>
    (...stack) => {
        const currentGraphName = R.nth(-1, stack);

        const graphFns = useCallback(createGraph(...stack), [...stack]);

        const useVar = (name) => {
            const selector = useCallback(store.selectVar(...stack)(name), [stack, name]);
            const value = useAtomAsync(atom, selector, fnEquals);
            const setValue = (value) => store.setVar(currentGraphName)(name, value);

            return [value, setValue];
        };
        const useView = (view, fnTransform = R.identity) => {
            const _stack = useEqualRef(stack);
            const _view = useEqualRef(view);

            const stateIdRef = useRef();

            const selectViewRef = useRef();
            const selectViewResultRef = useRef();

            const fnTransformRef = useRef();
            const fnTransformResultRef = useRef();

            // creating new function here instead of using currying to make function calls testable
            const selectView = useCallback((state) => store.selectView(..._stack)(_view)(state), [_stack, _view]);

            const selector = useCallback(
                (state) => {
                    const stateId = R.propOr(0, 'stateId', state);

                    const selectViewUpdated = !equal(selectViewRef.current, selectView);
                    if (selectViewUpdated) selectViewRef.current = selectView;
                    const fnTransformUpdated = !equal(fnTransformRef.current, fnTransform);
                    if (fnTransformUpdated) fnTransformRef.current = fnTransform;

                    if (!selectViewUpdated && !fnTransformUpdated && stateId === stateIdRef.current) {
                        console.log('requireEqCheck: false');
                        return {
                            requireEqCheck: false,
                            result: fnTransformResultRef.current,
                        };
                    }

                    if (selectViewUpdated || stateId !== stateIdRef.current) {
                        stateIdRef.current = stateId;
                        selectViewResultRef.current = selectView(state);
                    }

                    const fnTransformResult = fnTransform(selectViewResultRef.current);
                    fnTransformResultRef.current = fnTransformResult;

                    console.log('requireEqCheck: true');

                    return {
                        requireEqCheck: true,
                        result: fnTransformResultRef.current,
                    };
                },
                [selectView, fnTransform],
            );

            const { result } = useAtomAsync(atom, selector, useViewEquality);

            return result;
        };
        const useNode = (nodeId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(fnTransform, store.selectNode(...stack)(nodeId)),
                    RA.stubUndefined,
                ),
                [stack, nodeId, fnTransform],
            );

            return useAtomAsync(atom, selector, fnEquals);
        };
        const useMetadata = (edgeTypes, fromId, toId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(edgeTypes && fromId && toId),
                    R.compose(fnTransform, store.selectMetadata(...stack)(edgeTypes)(fromId)(toId)),
                    RA.stubUndefined,
                ),
                [stack, fromId, toId, fnTransform],
            );

            return useAtomAsync(atom, selector, fnEquals);
        };
        const useEdge = (edgeTypes, fromId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(edgeTypes && fromId),
                    R.compose(fnTransform, store.selectEdge(...stack)(edgeTypes)(fromId)),
                    RA.stubUndefined,
                ),
                [stack, edgeTypes, fromId, fnTransform],
            );

            return useAtomAsync(atom, selector, fnEquals);
        };
        const useRights = (nodeId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(fnTransform, store.selectRights(...stack)(nodeId)),
                    RA.stubUndefined,
                ),
                [stack, nodeId, fnTransform],
            );

            return useAtomAsync(atom, selector, fnEquals);
        };
        const useFiles = (nodeId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(fnTransform, store.selectFiles(...stack)(nodeId)),
                    RA.stubUndefined,
                ),
                [stack, nodeId, fnTransform],
            );

            const files = useAtomAsync(atom, selector, fnEquals);

            return files;
        };

        return {
            ...graphFns,
            useVar,
            useView,
            useNode,
            useMetadata,
            useEdge,
            useRights,
            useFiles,
        };
    };
