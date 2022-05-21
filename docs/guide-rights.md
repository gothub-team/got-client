# Rights

Every got user has rights on nodes. Those can be read and write, as well as admin, which allows the user to modify the rights of that node. Rights are not additive, so write for example only grants write rights and will not also allow reading of the data. Admin however, while not granting rights to read or write would obviously give the user the rights to grant himself read or write rights.

## Reading
### getMetadata
We can look up the rights for a node with the stores `getRights` function. This will return the entire rights object for this node, containing the `user` object, which is a hashmap of all rights of users mapped to their user emails.

```js 
const rights = store.getRights(...stack)('todoList1');

const rights = { 
    user: {
        'user1@mail.me': {
            read: true,
            write: true,
            admin: true,
        },
        'user2@mail.me': {
            read: true,
        },
    }
};
```

### Views
If we include `rights` in the view, the right will be loaded from the packend when used with `pull` or included under `rights` in the specified node bag.

```js 
const view = {
    'todoList1': {
        as: 'todoList',
        include: {
            rights: true,
        }
    }
}

const viewResult = {
    todoList: {
        nodeId: 'todoList1',
        rights: {
            user: {
                'user1@mail.me': {
                    read: true,
                    write: true,
                    admin: true,
                },
                'user2@mail.me': {
                    read: true,
                },
            }
        }
    }
}
```

## Writing
### setRights
We can set right objects for a given user email by calling the stores `setRights` function. While this intakes a users rights object, this rights object can merely be a patch. This means we could grant `user2@mail.me` the write right by marking write with `true`, without the existing read right being touched. To remove rights we simply mark the right type with `false`.

Rights operations will only be successfully pushed to the backend if the pushing user has admin rights on the modified node.

```js 
const user = 'user2@mail.me';
const rights = {
    write: true,
};

store.setRights('editor-graph')('todoList1')(user, rights);
```

### inheritRights
While got tries to eliminate "backend magic" as much as possible, we can mark nodes to inherit rights from other nodes which will be applied on push.

Inheriting rights will mean that a node that we have created or at least have admin rights to will have all it's existing rights erased (including our own) and replaced by the rights of the node we are inheriting from. We do not need admin rights to the node we are inheriting from.

This is useful if we want to attach our edits or additions to a foreign data structure we have write rights to, or when adding to any bigger graph structure and simply wanting to persist existing rights to those additions without having to load rights from the backend and manually copying them.

```js 
// inherit rights from todoList1 to todoElement3
store.inheritRights('editor-graph')('todoElement3')('todoList1');
```