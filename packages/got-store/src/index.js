import { createCurriedStore } from './createCurriedStore.js';
import { createErrorHandledStore } from './createErrorHandledStore.js';
import { createRawStore } from './createRawStore.js';

export { gotReducer } from './reducer.js';
export const createStore = options => createCurriedStore(createErrorHandledStore(options, createRawStore(options)));
