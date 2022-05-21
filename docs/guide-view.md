# Views
Views are the query language of got. They are used to both pull data from the API as well as select data from the local store. Views can contain any number of root node Ids to start querying from. 

## Nodes
For any element to be queried in views, we need to specify which data to load in the `include` property. For nodes we can include `node`, `rights` and `files`. By default no data is included.

```js 
const view = {
    'todoList1': {
        include: {
            node: true,
        }
    }
}
```

If loading this view from our store with `getView` we get the following output. All data for a node is aggregated in what we call a `bag`. The nodeId is included in bags by default so that we still have a reference to the node in case no other data was loaded.

```js 
const viewResult = store.getView(view);
const viewResult = {
    todoList1: {
        nodeId: 'todoList1',
        node: { id: 'todoList1', title: 'Household'},
    }
}
```

## Aliases
We can also give nodes an alias using the `as` prop. This will not have an effect if the view is used to request data using `pull`, but will use the given alias as key for the bag to make the view result more intuitive to navigate.

```js 
const view = {
    'todoList1': {
        as: 'todoList',
        include: {
            node: true,
        }
    }
}

const viewResult = store.getView(view);
const viewResult = {
    todoList: {
        nodeId: 'todoList1',
        node: { id: 'todoList1', title: 'Household'},
    }
}
```

## Rights
If we configure rights to be loaded by setting `rights: true` in `include`, a view result could look like this.

```js 
const viewResult = {
    todoList: {
        nodeId: 'todoList1',
        rights: {
            user: {
                'user1@mail.me': {
                    admin: true,
                    read: true,
                    write: true,
                },
                'user2@mail.me': {
                    read: true,
                },
            }
        }
    }
}
```

## Files
If we configure files to be loaded by setting `files: true` in `include`, a view result could look like this.

```js 
const viewResult = {
    todoList: {
        nodeId: 'todoList1',
        files: {
            logo: {
                url: 'media.gothub.io/todoList1-logo.png',
            },
            exportedPDF: {
                url: 'media.gothub.io/todoList1-exported.pdf',
            },
        }
    }
}
```

## Edges
We can also set up edges to be queried from each node. The key for the view of that edge serves as from/to types of that edge. Additionally to all the node specific data we can also include `eges` and `metadata` here. When using a view with `pull`, we need to make sure at least `edges` is included, as otherwise the backend will only return the nodes, not the edges between the root node and them.


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
                    node: true,
                }
            }
        }
    }
}
```

If `metadata` is included, we will also load any metdata that is set on those edges. Metadata can be used to include any relation specific data, for example to give nodes a certain order in this relation.

In the view result, edges will be included in the root nodes bag under their edge types or the given alias.

```js 
const viewResult = {
    todoList: {
        nodeId: 'todoList1',
        todoElements: {
            'element1Id': {
                nodeId: 'element1Id',
                metadata: { order: 0 },
                node: { id: 'element1Id', task: 'do the dishes' },
            },
            'element2Id': {
                nodeId: 'element2Id',
                metadata: { order: 1 },
                node: { id: 'element2Id', task: 'grocery shopping' },
            },
        }
    }
}
```

Since views for edges can themselves include edges, views can in theory go infinitely deep, however we recommend to keep depth at a minimum for performance reasons.