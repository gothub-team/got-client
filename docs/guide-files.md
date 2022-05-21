# Files

Got can also manage hosting files remotely by attaching files to nodes under a given propname.

## Reading
### getFiles
We can look up the files of a node with the stores `getFiles` function. This will return an object with all file props of this node, which, among other data, contains the signed URL to the file.

```js
const files = store.getFiles(...stack)('todoList1');

const files = { 
    logo: {
        url: 'media.gothub.io/todoList1-logo.png',
    },
    exportedPDF: {
        url: 'media.gothub.io/todoList1-exported.pdf',
    },
};
```

## Writing
When we want to attach a file to a node, we can do so with the stores `setFile` function. We need to supply it with the `propName`, the `filename` for the file to be saved as, and the `file` as a Buffer or Blob.

This will save the buffer of the file in a seperate state alongside the graph data, as well as add vital information of the file in the graph for the backend to create upload URLs from on push.

```js
store.setFile('editor-graph')('todoList1')('logo', 'todoList1-logo.png', file);
```

Upload handlers will be automatically created from those upload URLs by the stores `push` function, and are returned in an object under `uploads`. This handler can be observed by subscribing to it first, and then starting the uploads. The observable will emit redux action objects to the subscribers, which can be either dispatched to update our state or otherwised handled. `start` also returns a promise if we want to just await the uploads.

```js
const subscriber = {
    next: dispatch,
    complete: () => console.log("uploads started"),
    error: (err) => console.error(err),
};

const { uploads } = await store.push();
uploads.subscribe(subscriber);
await uploads.start();
```