# Edge Metadata
## Reading
### getMetadata
We can look up the metadata of an edge with the stores `getMetadata` function. If the edge exists and no metadata is set, this function will just return `true`.

```js 
const metadata = store.getMetadata(...stack)('todo-list/todo-element')('todoList1')('element1Id');

const metadata = { order: 0 };
```

### Views
If we include `metadata` in the edge views, the edge metadata will be loaded from the backend when used with pull or included under `metadata` in each node bag of the edge.

```js 
const view = {
    'todoList1': {
        as: 'todoList',
        edges: {
            'todo-list/todo-element': {
                as: 'todoElements',
                include: {
                    edges: true,
                    metadata: true,
                }
            }
        }
    }
}

const viewResult = {
    todoList: {
        nodeId: 'todoList1',
        todoElements: {
            'element1Id': {
                nodeId: 'element1Id',
                metadata: { order: 0 },
            },
            'element2Id': {
                nodeId: 'element2Id',
                metadata: { order: 1 },
            },
        }
    }
}
```

## Writing
When we are adding or associng a node, we can input a metadata object as the second parameter.
This metadata object does not have to include the entire metadata for this edge, but can merely be a patch as well. 
The supplied patch will be applied to any existing metadata on edit, graph merge or push.

If no metadata is input, existing metadata will not be modified or the edge will be created.

```js 
const node = { id: 'element1Id', task: 'do the dishes' };
const metadata = { order: 0 };

store.add('editor-graph')('todo-list/todo-element')('todoList1')(node, metadata);
store.assoc('editor-graph')('todo-list/todo-element')('todoList1')(node, metadata);
```

## Sorting using metadata
A good use for metadata is to set an order for children of a relation without having to modify the nodes data.
We can do this by setting an index or created date as the `order` prop of the metadata and then sorting the bags returned by a view.

```js 
const todoElements = {
    'element1Id': {
        nodeId: 'element1Id',
        metadata: { order: 0 },
    },
    'element2Id': {
        nodeId: 'element2Id',
        metadata: { order: 1 },
    },
};

const sortedTodoElements = Object.values(todoElements).sort((a, b) => a.order > b.order);
```