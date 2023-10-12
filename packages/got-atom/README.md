# The simplest global state solution

## Just a global value

```js
import { atom } from '@gothub-team/got-atom';

const myAtom = atom(false);
```

## Get and set state

```js
const toggle1 = () => {
    const state = myAtom.get();
    myAtom.set(!state);
};

const toggle2 = () => {
    myAtom.set((state) => !state);
};
```

## Use in Components

```js
import { useAtom } from '@gothub-team/got-atom';

const MyComponent = () => {
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

const getText = (value) => (value ? 'Enabled' : 'Disabled');

const MyComponent = () => {
    const text = useAtom(myAtom, getText);

    return <div>{text}</div>;
};
```

## Listen to state changes via observable

```js
myAtom.subscribe({
    next: (value) => {
        console.log(value);
    },
});
```

## Local atoms, memo compatible

```js
import { useCreateAtom } from '@gothub-team/got-atom';

const MyComponent = () => {
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
