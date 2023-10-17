import { createTestStore } from './shared.js';

describe('view after actions', () => {
    test('should select the correct view tree after remove', async () => {
        /* #region Test Bed Creation */
        const from1Id = 'from1';
        const node1Id = 'node1';
        const node2Id = 'node2';
        const node3Id = 'node3';
        const edgeTypes = 'from/to';
        const aliasNode = 'todoList';
        const aliasEdge = 'todos';
        const view = {
            [from1Id]: {
                as: aliasNode,
                edges: {
                    [edgeTypes]: {
                        as: aliasEdge,
                    },
                },
            },
        };
        const graph = {
            nodes: {
                [from1Id]: { id: from1Id, value: 'value' },
                [node1Id]: { id: node1Id, value: 'value' },
                [node2Id]: { id: node2Id, value: 'value' },
                [node3Id]: { id: node3Id, value: 'value' },
            },
            edges: {
                from: {
                    [from1Id]: {
                        to: {
                            [node1Id]: true,
                            [node2Id]: true,
                            [node3Id]: true,
                        },
                    },
                },
            },
        };

        const {
            store: { selectView, remove },
            select,
            onError,
        } = createTestStore({
            main: { graph },
        });
        /* #endregion */

        /* #region Execution and Validation */
        remove('edit')(edgeTypes)(from1Id)({ id: node3Id });

        const viewTree = select(selectView('main', 'edit')(view));

        expect(onError).not.toBeCalled();
        // todoList
        expect(viewTree).toHaveProperty([aliasNode]);
        // todoList edges
        expect(viewTree).toHaveProperty([aliasNode, aliasEdge]);
        // todos nodes
        expect(viewTree).toHaveProperty([aliasNode, aliasEdge, node1Id]);
        expect(viewTree).toHaveProperty([aliasNode, aliasEdge, node2Id]);
        expect(viewTree).not.toHaveProperty([aliasNode, aliasEdge, node3Id]);
        /* #endregion */
    });
});
