import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { useCallback, useMemo, useRef } from 'react';
import equal from 'fast-deep-equal';
import { useEqualRef } from './util.js';

let fnEquals = equal;
export const setFnEquals = (fn) => {
    fnEquals = fn;
};

const useViewEquality = (next, prev) => (next.requireEqCheck ? fnEquals(next.result, prev.result) : true);

export const configureUseGraph =
    ({ store, useSelector, baseState = R.identity, createGraph }) =>
    (...stack) => {
        const currentGraphName = R.nth(-1, stack);

        const graphFns = useMemo(() => createGraph(...stack), [...stack]);

        const useVar = (name) => {
            const ref = useSelector(R.compose(store.selectVar(...stack)(name), baseState), equal);
            const setRef = (value) => store.setVar(currentGraphName)(name, value);

            return [ref, setRef];
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
                (_state) => {
                    const state = baseState(_state);
                    const stateId = R.propOr(0, 'stateId', state);

                    const selectViewUpdated = !equal(selectViewRef.current, selectView);
                    if (selectViewUpdated) selectViewRef.current = selectView;
                    const fnTransformUpdated = !equal(fnTransformRef.current, fnTransform);
                    if (fnTransformUpdated) fnTransformRef.current = fnTransform;

                    if (!selectViewUpdated && !fnTransformUpdated && stateId === stateIdRef.current) {
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

                    return {
                        requireEqCheck: true,
                        result: fnTransformResultRef.current,
                    };
                },
                [selectView, fnTransform],
            );

            const { result } = useSelector(selector, useViewEquality);

            return result;
        };
        const useNode = (nodeId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(fnTransform, store.selectNode(...stack)(nodeId), baseState),
                    RA.stubUndefined,
                ),
                [stack, nodeId, fnTransform],
            );

            return useSelector(selector, equal);
        };
        const useMetadata = (edgeTypes, fromId, toId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(edgeTypes && fromId && toId),
                    R.compose(fnTransform, store.selectMetadata(...stack)(edgeTypes)(fromId)(toId), baseState),
                    RA.stubUndefined,
                ),
                [stack, fromId, toId, fnTransform],
            );

            return useSelector(selector, equal);
        };
        const useEdge = (edgeTypes, fromId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(edgeTypes && fromId),
                    R.compose(fnTransform, store.selectEdge(...stack)(edgeTypes)(fromId), baseState),
                    RA.stubUndefined,
                ),
                [stack, edgeTypes, fromId, fnTransform],
            );

            return useSelector(selector, equal);
        };
        const useRights = (nodeId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(fnTransform, store.selectRights(...stack)(nodeId), baseState),
                    RA.stubUndefined,
                ),
                [stack, nodeId, fnTransform],
            );

            return useSelector(selector, equal);
        };
        const useFiles = (nodeId, fnTransform = R.identity) => {
            const selector = useCallback(
                R.ifElse(
                    R.always(nodeId),
                    R.compose(fnTransform, store.selectFiles(...stack)(nodeId), baseState),
                    RA.stubUndefined,
                ),
                [stack, nodeId, fnTransform],
            );

            const files = useSelector(selector, equal);

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
