import { configureCreateGraph } from '../createGraph';
import { createStore } from '@gothub-team/got-store';

describe('createGraph', () => {
    const store = createStore({
        dispatch: () => {},
        select: () => {},
        onWarn: () => {},
    });

    const createGraph = configureCreateGraph(store);

    test('should not throw error if stack is strings', async () => {
        const create = () => createGraph('main', 'edit');
        expect(create).not.toThrow();
    });

    test('should throw error if stack is empty', async () => {
        const create = () => createGraph();
        expect(create).toThrow();
    });
    test('should throw error if stack is an object', async () => {
        const create = () => createGraph({});
        expect(create).toThrow();
    });
    test('should throw error if stack contains an object', async () => {
        const create = () => createGraph('main', {}, 'edit');
        expect(create).toThrow();
    });
    test('should throw error if stack is a spreaded object', async () => {
        const create = () => createGraph(...{});
        expect(create).toThrow();
    });
    test('should throw error if stack is a number', async () => {
        const create = () => createGraph(1);
        expect(create).toThrow();
    });
    test('should throw error if stack contains a number', async () => {
        const create = () => createGraph('main', 1, 'edit');
        expect(create).toThrow();
    });
});
