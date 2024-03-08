# got

This library is built on react hooks and react-redux. It manages several aspects of the graphbased database solution
got, including authentication, the graph database actions, as well as the attached file hosting system.

## Documentation

-   [API](https://api.gothub.io/api)
-   [Views and data output](./docs/guide-view.md)
-   [Stacks and editing](./docs/guide-stack.md)
-   [Edge Metadata](./docs/guide-metadata.md)
-   [Rights](./docs/guide-rights.md)
-   [Files](./docs/guide-files.md)
-   [React Hooks](./docs/guide-hooks.md)

# Getting Started

## Installation

```
bun add @gothub-team/got-react redux react-redux
```

```
pnpm add @gothub-team/got-react redux react-redux
```

```
yarn add @gothub-team/got-react redux react-redux
```

```
npm install @gothub-team/got-react redux react-redux
```

## Redux Store

To setup a react-redux store we simply need to create a store from our `gotReducer`.

```js
import { combineReducers, legacy_createStore } from 'redux';
import { gotReducer } from '@gothub-team/got-react';

const rootReducer = combineReducers({
    got: gotReducer,
});
export const reduxStore = legacy_createStore(rootReducer);
```

We then need to wrap our app in redux's `Provider` component.

```js
import { Provider } from 'react-redux';

export const App = () => (
    <Provider store={reduxStore}>
        <Content />
    </Provider>
);
```

## Setup

To setup our got environment, we simply need to configure the setup function with a host for our API to connect to, the
redux store and the name of got's state in said store.

```js
import { setup } from '@gothub-team/got-react';

const host = 'https://api.gothub.io'; // or endpoint of different got provider
export const { api, store, useGraph } = setup({
    host,
    reduxStore,
    baseState: 'got',
});
```

This will give us the three main got components.

-   The `api` which implements all interactions with the got provider like push, pull, auth or upload actions.
-   The `store` which implements all interactions with the database.
-   `useGraph` which configures hooks to efficiently use got with react as well as most `store` functions with a given
    stack.

Alternatively all of these can be configured seperately using

-   `createApi` from '@gothub-team/got-api'
-   `createStore` from '@gothub-team/got-store'
-   `createHooks` from '@gothub-team/got-react'

## Or just Copy and Paste

If you want to go the path of least resistance, you can just copy all the setup steps into your App.js file at once:

```js
import { combineReducers, legacy_createStore } from 'redux';
import { Provider } from 'react-redux';
import { setup, gotReducer } from '@gothub-team/got-react';
import { useEffect } from 'react';

const rootReducer = combineReducers({
    got: gotReducer,
});
export const reduxStore = legacy_createStore(rootReducer);

const host = 'https://api.gothub.io'; // or endpoint of different got provider
export const { api, store, useGraph } = setup({
    host,
    reduxStore,
    baseState: 'got',
});

export const App = () => (
    <Provider store={reduxStore}>
        <Content />
    </Provider>
);

export default App;

const Content = () => {
    return (
        <div>
            <h1>Welcome to got</h1>
        </div>
    );
};
```
