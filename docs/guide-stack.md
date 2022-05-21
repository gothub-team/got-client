# Stack System
A central component of got is the stack system. We use this to manage multiple graphs and select data by layering these graphs on top of eachother.
This allows us to seperate changesets and only ever patch specific data. This dramatically increases backend efficiency and lowers the required traffic for pushing data.

Generally we always want to base our stack on a `main` graph. This is the graph that `pull` will merge the loaded data to by default and will thus be the graph that will handle all of our
"complete" datasets. We can simply use a stack consisting of only `main` as long as we just want to read data from the graph.

```js 
store.getView('main')(view);

const stack = ['main'];
store.getView(...stack)(view);
```

If we want to edit data, we should layer an editor graph on top of our current stack. This will create a changeset that we can then either discard or push to the backend.

Write functions actually just need to know about the graph we want to edit in, however to display the patched data, we will need the entire stack (e.g. for `getView`).
If you use hooks, useGraph will configure all edit functions for the top most layer in your graph.

```js 
const stack = ['main', 'todolist-editor'];

store.update('todolist-editor')({ id: 'todoListId1', title: 'Household' });

const { update } = useGraph(...stack);
update({ id: 'todoListId1', title: 'Household' });

store.getView(...stack)(view);
```