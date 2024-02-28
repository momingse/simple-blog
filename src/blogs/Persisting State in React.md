# Persisting State in React

---

date: 28/02/2024
topics: react hook javascript

---

## Introduction

In page reloads or when the user navigates away from the page, the state of the application is lost. This is a common problem in web applications. In this article, we will discuss how to persist the state of a React application.

consider the following example:

```js
import React, { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

## 1. Local Storage

Local storage is a simple way to persist the state of a React application. It is a key-value pair storage that is available in the browser. The data stored in local storage is available even after the browser is closed.

```js
import React, { useState, useEffect } from "react";

const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const persistedState = localStorage.getItem(key);
    return persistedState ? JSON.parse(persistedState) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

function App() {
  const [count, setCount] = usePersistedState("count", 0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

Advantages:

- Simple to use
- Data is available even after the browser is closed

Disadvantages:

- Data is available to all the tabs in the browser
- Data is not available in the server-side rendering
- Data is not available in the incognito mode
- Data may be storage limited

## 2. URL Parameters

URL parameters are another way to persist the state of a React application. The URL parameters are part of the URL and are available in the browser history.

```js
import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

const usePersistedState = (key, defaultValue) => {
  const query = new URLSearchParams(useLocation().search);
  const history = useHistory();
  const [state, setState] = useState(() => {
    const persistedState = query.get(key);
    return persistedState ? JSON.parse(persistedState) : defaultValue;
  });

  useEffect(() => {
    query.set(key, JSON.stringify(state));
    history.push({ search: query.toString() });
  }, [key, state, query, history]);

  return [state, setState];
};

function App() {
  const history = useHistory();
  const [count, setCount] = usePersistedState("count", 0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

Advantages:

- Data is available in the browser history
- Data is available in the server-side rendering

Disadvantages:

- The URL may become long and complex
