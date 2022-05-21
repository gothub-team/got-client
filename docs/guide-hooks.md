# Hooks
## Setup
got-react adds a few hooks to simplify usage of got in react components.
We can configure those like this

```js
export const { useGraph } = createHooks({ store });
```

We can then use `useGraph` to configure all store functions with the current stack of our component.
This will also return the `useView` and `useVar` hooks.

```js
const { pull, useView, update, assoc, push } = useGraph(...stack);
```


## useView

`useView` is our main interface to got data. It uses the stores functions to select views from our current state
with the `useSelector` hook of react-redux. This way the hook will cause a rerender of this component if the selected data has changes, and only then, saving a lot of render time.

```js
const viewResult = useView(view);
```

`useView` can also accept a selector function as a second parameter which will be applied to the view result before equality to the previous result is checked.
Like this we can for example just select the Ids of the todo element children while not causing a rerender even if the loaded node data would be changed.

```js
const selectElementIds = (res) => Object.keys(res.todoList.todoElements);
const todoElementIds = useView(view, selectElementIds);
```

## useVar

`useVar` is used to easily manage variables that need to be available across multiple components without causing huge rerenders across bigger parent components.
It will return an array of the value and a setter function for the specified variable and will only cause a rerender of the component if the value of the variable has changed.

```js
const todoListId = useVar('selectedTodoListId');
```

## Optimizing lists with react hooks

Lists can often be the source of long render times.
If we for example select the entire view for a todo list with `useView` in the List component, everytime data of individual todo elements changes, the whole list will rerender.
To avoid this we can select a view with just the todo elements and no data. We can then pass our current stack and the element Id to the List Element Component 
and let it decide if it needs to rerender if it's todo element's data has changed.

```js
const TodoList = ({ stack, todoListId }) => {
    const { useView } = useGraph(...stack);

    const view = {
        [todoListId]: {
            as: 'todoList',
            edges: {
                'todo-list/todo-element': {
                    as: 'todoElements',
                },
            },
        },
    };

    const viewRes = useView(view);

    const elementBags = Object.values(viewRes.todoList.todoElements);

    return (
        <>
            {elementBags.map(
                elementBag => (
                    <TodoElement
                        stack={stack}
                        todoElementId={elementBag.nodeId}
                    />
                ),
            )}
        </>
    );
};
```

We could even pass a selector to useView that further processes the view result into just the elementIds like above.

The only scenario where the entire list would now rerender would be if we add or remove (or, if we sort, change the order of) elements in the list.
To avoid this we can wrap all List Element Components in `React.memo`. This will have child components not rerender if their passed props are the same.
You can also give `React.memo` an equality function to compare the props.

```js
export const TodoElement = React.memo(_TodoElement, fnEqual);
```

We just need to avoid passing functions to the List Element Components, since those can either not be compared if they are constructed from arrow functions on every rerender,
or we need to use reacts `useCallback` hook to make sure we always pass along the same function instance.