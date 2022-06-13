import * as R from 'ramda';
import { useRef } from 'react';

/** React hook to safeguard inputs from triggering effects or memos by checking for deep equality */
export const useEqualRef = input => {
    const ref = useRef();
    if (!R.equals(input, ref.current)) {
        ref.current = input;
    }

    return ref.current;
};

/** React hook to  check for deep equality of instances between calls */
export const useRefUpdated = input => {
    const ref = useRef();
    const isEqual = R.equals(input, ref.current);
    ref.current = input;

    return isEqual;
};
