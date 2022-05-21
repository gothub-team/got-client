# got-store

This library provides functions to interact with local (in-memory) got graphs and sync them with remote got providers.

# Getting Started

## Installation
```
yarn add @gothub-team/got-store
```

```
npm install @gothub-team/got-store
```

## Setup

The got store is the implementation to manage all api and reducer interactions. 
We need to configure the store with our API as well as with any store structure that uses dispatch to process actions to mutate the store (e.g. a react-redux store).

All parameters for createStore are optional, however if any are not provided, a warning will be thrown and some functions might not be available.

``api`` enables api functions like ``pull`` and ``push``. \
``select`` enables getter functions like ``getView``.\
``dispatch`` enables setter functions like ``update``.\
Functions that return a selector like ``selectView`` are always available.

```js 
import { createStore } from '@gothub-team/got-store';
import { createApi } from '@gothub-team/got-api';

const host = 'https://api.gothub.io'; // or endpoint of different got provider
export const store = createStore({
    api: createApi({ host }),
    dispatch,
    select: selector => selector(getState()),
});
```

[read more](https://github.com/gothub-team/got)