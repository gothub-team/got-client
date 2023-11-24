# The simplest global state solution

## Installation

```bash
npm install @gothub-team/got-atom
```

```bash
yarn add @gothub-team/got-atom
```

```bash
pnpm add @gothub-team/got-atom
```

```bash
bun add @gothub-team/got-atom
```

## Just a global value

```js
import { atom } from '@gothub-team/got-atom';

// Create a new atom with an initial value of false
const myAtom = atom(false);
```

## Get and set state

```js
const toggle1 = () => {
    // Get the current value of myAtom
    const state = myAtom.get();
    // Set the new value of myAtom to the opposite of its current value
    myAtom.set(!state);
};

const toggle2 = () => {
    // Set the new value of myAtom to the opposite of its current value using a function
    myAtom.set((state) => !state);
};
```

## Use in Components

```js
import { useAtom } from '@gothub-team/got-atom';

const MyComponent = () => {
    // Subscribe to the value of myAtom and re-render when it changes
    const state = useAtom(myAtom);

    return (
        <Toggle
            value={state}
            onClick={() => {
                myAtom.set((prevVal) => !prevVal);
            }}
        />
    );
};
```

## Use with transformation

```js
import { useAtom } from '@gothub-team/got-atom';

// Function to transform the value of myAtom to a string
const getText = (value) => (value ? 'Enabled' : 'Disabled');

const MyComponent = () => {
    // Subscribe to a transformed value of myAtom
    const text = useAtom(myAtom, getText);

    return <div>{text}</div>;
};
```

## Listen to state changes via observable

```js
const observable = {
    next: (value) => {
        console.log(value);
    },
};

myAtom.subscribe(observable);
myAtom.unsubscribe(observable);
```

## Local atoms, memo compatible

```js
import { useCreateAtom } from '@gothub-team/got-atom';

const MyComponent = () => {
    // Create a new atom with an initial value of false whenever MyComponent is mounted
    // Since the reference of the atom never changes, we can pass it down to memoized components.
    const myAtom = useCreateAtom(false);

    return <MemoComponent myAtom={myAtom} />;
};
```

## Big states, small values, less rerenders

With transforms in useAtom as well as using transformers to set, you can use a small subset of your state in your
component without rerendering when irrelevant parts of the state change.

```js
const settingsAtom = atom({
    darkmode: true,
    language: 'en',
});

const DarkmodeToggle = () => {
    // Subscribe to a specific piece of the settingsAtom state
    const darkmode = useAtom(settingsAtom, (state) => state.darkmode);

    return (
        <Toggle
            value={darkmode}
            onClick={() => {
                settingsAtom.set((state) => {...settings, darkmode: !darkmode});
            }}
        />
    );
};
```

## Persistent states

The `persistAtom` function provides a mechanism to persist an atom's value in the browser's localStorage. When the
provided key points to a value in the local store, `persistAtom` will set the atom's value with it. Subsequently, it
subscribes to the atom's changes and updates the local store on every change.

For scenarios where you don't want to save the entire atom state or want to transform the state before saving, you can
use the `outbound` and `inbound` transform functions.

-   `outbound`: Transforms the atom state before it's saved to the local store.
-   `inbound`: Used when reading from the local store to potentially transform the saved state back to the atom's
    expected shape.

```js
const settingsAtom = atom({
    darkmode: true,
    language: 'en',
});

// basic usage
persistAtom(settingsAtom, 'settings');

// with transform functions
persistAtom(settingsAtom, 'language', {
    // only save the language
    outbound: (state) => state.language,
    // merge saved language with current state
    inbound: (localState, state) => ({ ...state, language: localState }),
});
```
