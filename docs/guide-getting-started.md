# Getting started with got

## Get the sample project
This is a guide to getting started using got. We will cover the setup, auth, creating and editing nodes and edges and connecting our app to a got API.
To follow along we strongly recommend you clone the sample project from our github, which provides an already set up react-app as well as a completed version of this guide.

``` git clone https://github.com/gothub-team/got-sample-project.git```

You'll need to use ``yarn install`` to install all dependencies and ``yarn start`` to run the project.
We won't be covering the basics of react-js and focus solely on the data management with got, so we will use the provided react component for input and display.

## Set up got
To start off we need to set up our got store. We'll use redux for our state management, so let's set up a redux store first.
We dont't really need the logger, but it will make it easier to see what's happening in the got state as we go.

```js
// ./src/SampleSetup/redux.js
import { gotReducer } from '@gothub-team/got-react';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import logger from 'redux-logger';

const rootReducer = combineReducers({
    got: gotReducer,
});

export const reduxStore = createStore(
    rootReducer,
    applyMiddleware(
        logger,
    ),
);
```

Now we can setup our got functions. For this we'll need:
- our redux store we just set up
- base state name, which corresponds to the "got" substate in our redux store
- an API endpoint (e.g. api.gothub.io)

```js
// ./src/SampleSetup/got.config.js
import { setup } from '@gothub-team/got-react';
import { reduxStore } from './redux';

export const {
    useGraph,
    store: gotStore,
    api: gotApi,
} = setup({
    host: 'https://api.gothub.io',
    reduxStore,
    baseState: 'got',
});
```

## Auth and login
Got is ready to go so let's build a small hook to track our logged in state. We'll simply update the loggedIn state everytime we login or logout and clear the got store, so that the next user will not see our loaded data.

```js
// ./src/SampleSetup/useAuth.js
import { useState } from 'react';
import { gotApi, gotStore } from './got.config';

export const useAuth = () => {
    const [loggedIn, setLoggedIn] = useState();

    const login = async ({ email, password }) => {
        try {
            await gotApi.login({ email, password });
            setLoggedIn(true);
        } catch (err) {
            setLoggedIn(false);
        }
    };

    const logout = async () => {
        setLoggedIn(false);
        gotApi.logout();
        gotStore.clearAll();
    };

    return [loggedIn, login, logout];
};
```

We can also add a refresh session function and call it in useEffect to automatically log the user in from the session stored in the local state.

```js
    const refreshSession = async () => {
        setLoggedIn(!!gotApi.getCurrentUser());
        try {
            await gotApi.refreshSession();
            setLoggedIn(true);
        } catch (err) {
            setLoggedIn(false);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);
};
```

Now we can use our hook in App.js with the provided LoginForm Component.

```js
// ./src/SampleSetup/App.js
import React from 'react';
import { LoginForm } from '../Components/LoginForm';
import { useAuth } from './useAuth';
export const App = () => {
    const [loggedIn, login, logout] = useAuth();

    if (!loggedIn) {
        return (
            <LoginForm login={login} />
        );
    }

    return (
        <div>
            You are logged in!
        </div>
    );
};
```

Great, now we can log in with our gothub.io user. Feel free to add a button to log out again if you feel like it.

## User nodes
We'll need some sort of root node ID for our graph that we can "persist" between application runs. In this project we will mirror the system of "user nodes" that gothub.io's graph interface uses and just create a hash of the users email using js-sha3.
This way we can also use gothub.io to view the data we're creating once we upload it to the backend.

```js
// ./src/SampleSetup/got.config.js
import { sha3_224 as sha } from 'js-sha3';

export const getUserId = () => {
    const { email } = gotApi.getCurrentUser();
    return sha(email);
};
```

## Creating and updating a node
Now let's create a component to manage our use node which will double as our todo list node here.
Let's configure some got functions with a given stack using useGraph (stacks will be explained further down). Then we can use the useView hook to select a view for our node. Then we can get the nodes name from the view result.

```js
// ./src/SampleSetup/TodoListScreen.js
import React from 'react';
import { useGraph } from './got.config';

export const TodoListScreen = ({ nodeId }) => {
    const {
        useView, update, clear, merge, push,
    } = useGraph('main', 'edit-title');

    const view = {
        [nodeId]: {
            include: {
                node: true,
            },
        },
    };

    const viewRes = useView(view);
    const todoList = viewRes[nodeId].node;
    const todoListName = todoList ? todoList.name : '';

    return null;
};
```

To make it easier to select our todo node from the view result, we can use aliases for nodes in our view. This way they will apear under the given alias key in the view result.

```js
// ./src/SampleSetup/TodoListScreen.js
    const view = {
        [nodeId]: {
            as: 'todoList',
            include: {
                node: true,
            },
        },
    };

    const viewRes = useView(view);
    const todoList = viewRes.todoList.node;
};
```

If we also get the update function from useGraph, we display our todo lists name and update the node with a new name on change. 
Even though this would be all the data we have in our node right now, we don't actually need to input the entire node into the update function.
We can simply input a patch with the node's ID and all the properties we want to change.

```js
// ./src/SampleSetup/TodoListScreen.js
import React from 'react';
import { useGraph } from './got.config';
import { TodoListTitle } from '../Components/TodoListTitle';

export const TodoListScreen = ({ nodeId }) => {
    const {
        useView, update, clear, merge, push,
    } = useGraph('main', 'edit-title');

    const view = {
        [nodeId]: {
            as: 'todoList',
            include: {
                node: true,
            },
        },
    };

    const viewRes = useView(view);
    const todoList = viewRes.todoList.node;

    return (
        <div className="todo-list">
            <TodoListTitle
                value={todoList ? todoList.name : ''}
                onChange={name => {
                    const nodePatch = { id: nodeId, name };
                    update(nodePatch);
                }}
            />
        </div>
    );
};
```

## Stack layers
Now let's have a look at the stack system. If we open the console while we input a new name for the todo list, we can look at the "next state" after each redux action.
As we can see, the node patches will be put into the graph of the "edit-list" state, the last layer in our stack. When selecting, useView will merge all the data from the bottom most layer ("main") to the top most layer ("edit-list").
While the "main" layer represents a synced state with the backend, any other layer can be viewed as a "changeset" which can be either pushed/merged into main, or discarded using clear.

## Confirm or discard changes
So let's upgrade our title field a bit by calling "clear" onCancel and merge and clear onConfirm. If we now look at the redux state, we can see that the "edit-list" state will be removed and the changes are now merged into the "main" state onConfirm.

```js
// ./src/SampleSetup/TodoListScreen.js
import React from 'react';
import { useGraph } from './got.config';
import { TodoListTitle } from '../Components/TodoListTitle';

export const TodoListScreen = ({ nodeId }) => {
    const {
        useView, update, clear, merge,
    } = useGraph('main', 'edit-title');

    // ...

    return (
        <div className="todo-list">
            <TodoListTitle
                value={todoList ? todoList.name : ''}
                onChange={name => {
                    const nodePatch = { id: nodeId, name };
                    update(nodePatch);
                }}
                onCancel={() => { 
                    clear(); 
                }}
                onConfirm={() => {
                    merge(); 
                    clear();
                }}
            />
        </div>
    );
};
```

## Adding todo elements
Now let's move on to finally adding some todos to our list. For this we'll create a new TodoList component and give it the nodeId as prop.
Here we'll use the "edit-list" layer in useGraph. This way when we clear or merge, we dont touch to todo-lists layer for title changes.
We can simply use the provided InputForm component to handle input of a new todo text. 
onConfirm we create a new node with a new ID using uuid's v4 function and call add from useGraph with the todo-lists ID as parentId, "todo-list/todo" as edge types and our new todo node.
Then we can just call merge and clear to immediately confirm those changes and move them to the "main" layer.

```js
// ./src/SampleSetup/TodoListScreen.js
import React from 'react';
import { useGraph } from './got.config';
import { TodoListTitle } from '../Components/TodoListTitle';
import { TodoList } from './TodoList';

export const TodoListScreen = ({ nodeId }) => {
    // ...

    return (
        <div className="todo-list">
            <TodoListTitle 
            // ... 
            />
            <TodoList
                nodeId={nodeId}
            />
        </div>
    );
};
```

```js
// ./src/SampleSetup/TodoList.js
import React from 'react';
import { v4 } from 'uuid';
import { InputForm } from '../Components/InputForm';
import { useGraph } from './got.config';

export const TodoList = ({ nodeId }) => {
    const {
        add, merge, clear,
    } = useGraph('main', 'edit-list');

    return (
        <div className="todo-list">
            <InputForm
                onConfirm={name => {
                    const newTodo = { id: v4(), name };
                    add('todo-list/todo')(nodeId)(newTodo);
                    merge();
                    clear();
                }}
            />
        </div>
    );
};
```

If we look at the redux state in the console again, we can see that in the graph of "edit", the new todo node as well as our new edge were added. 
Great! However we dont display the todos in our list yet, so let's do that.
The concept is the same as when getting data for the todo-list, so let's create a view for our edge, then select the data with useView. We can also immediately use an alias for the edge to make our life easier.

```js
// ./src/SampleSetup/TodoList.js
    const {
        useView, add, remove, merge, clear,
    } = useGraph('main', 'edit-list');

    const view = {
        [nodeId]: {
            as: 'todoList',
            edges: {
                'todo-list/todo': {
                    as: 'todos',
                    include: {
                        node: true,
                        edges: true,
                    },
                },
            },
        },
    };

    const viewRes = useView(view);
    console.log(viewRes);
```

If we log the view result, we can see that the edge object is located within the node bag of the todo list. It lists all node bags of the todo nodes using their node IDs as keys.
Since we can't use objects in react, let's just get the values. While we're at it we can even sort the items by the nodes name property.

Now we just map over the array and render a Todo component for each element and call the remove function in the components onDelete function to give us the abillity to delete each todo item.

Our finished TodoList component should now look like this.

```js
// ./src/SampleSetup/TodoList.js
import React from 'react';
import { v4 } from 'uuid';
import { InputForm } from '../Components/InputForm';
import { Todo } from '../Components/Todo';
import { useGraph } from './got.config';

export const TodoList = ({ nodeId }) => {
    const {
        useView, add, remove, merge, clear, push,
    } = useGraph('main', 'edit-list');

    const view = {
        [nodeId]: {
            as: 'todoList',
            edges: {
                'todo-list/todo': {
                    as: 'todos',
                    include: {
                        node: true,
                        edges: true,
                    },
                },
            },
        },
    };

    const viewRes = useView(view);
    const todos = Object.values(viewRes.todoList.todos || {}).sort((a, b) => a.node.name > b.node.name ? 1 : -1);

    return (
        <div className="todo-list">
            <InputForm
                onConfirm={name => {
                    const newTodo = { id: v4(), name };
                    add('todo-list/todo')(nodeId)(newTodo);
                    merge();
                    clear();
                }}
            />
            {todos.map(todo => (
                <Todo
                    key={todo.nodeId}
                    name={todo.node.name}
                    onDelete={() => {
                        remove('todo-list/todo')(nodeId)(todo.node);
                        merge();
                        clear();
                    }}
                />
            ))}
        </div>
    );
};
```

## Syncing data with the API
Alright now we can manage a users personal node as a todo-list, change it's name as well as add and remove todo elements. All that's left to do is sync our data with the API.

### Push
To upload data we can simply use the push function from useGraph. This will push the upper most layer of the stack to the API, merge the successfully pushed data into the "main" layer and clear the pushed layer.
So we simply just have to replace our "clear(); merge();" calls with "push();" in both the TodoListScreen and the TodoList components.

```js
// ./src/SampleSetup/TodoList.js
    onConfirm={name => {
        const newTodo = { id: v4(), name };
        add('todo-list/todo')(nodeId)(newTodo);
        // merge();
        // clear();
        push();
    }}
```

### Pull
Great, we can look at our network tab and redux state now and see that our data is being pushed to the API and ends up in the "main" state.
But if we reload our page, obviously all our data still gets lost, so let's load them with useEffect when the page loads. For this we simple have to call the pull function from useGraph with the view we also use to select our data.

```js
// ./src/SampleSetup/TodoListScreen.js
    // ...

    const {
        pull, useView, update, clear, push,
    } = useGraph('main', 'edit-title');

    const view = {
        [nodeId]: {
            as: 'todoList',
            include: {
                node: true,
            },
        },
    };

    useEffect(() => {
        pull(view);
    }, []);

    // ...
```

```js
// ./src/SampleSetup/TodoList.js
    // ...

    const {
        pull, useView, add, remove, push,
    } = useGraph('main', 'edit-list');

    const view = {
        [nodeId]: {
            as: 'todoList',
            edges: {
                'todo-list/todo': {
                    as: 'todos',
                    include: {
                        node: true,
                        edges: true,
                    },
                },
            },
        },
    };

    useEffect(() => {
        pull(view);
    }, []);

    // ...
```