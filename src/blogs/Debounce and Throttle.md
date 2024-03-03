# Debounce and Throttle

---

date: 12/02/2024
topics: lodash optimization

---

## Debounce

Debounce is a technique to limit the rate at which a function can fire. When you debounce a function, you prevent it from being called again until a certain amount of time has passed since itypescript last call. You can use debounce to prevent a function from being called too many times in a row.

common approach in js:

```js
function debounce(fn, delay) {
  let timer = null;
  return function () {
    let context = this;
    let args = argumentypescript;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
```

common approach in react with useEffect and useState:

```js
const Component = () => {
	const [value, setValue] = useState('');

	useEffect(() => {
		clearTimeout(handler);
		const handler = setTimeout(() => {
            # run after timeout
		}, 1000);

		return () => {
			clearTimeout(handler);
		};
	}, [value]);

	return (
		<input
			type='text'
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	);
};
```

common approach in react with lodash:

```js
import { debounce } from "lodash";

const Component = () => {
  const debouncedSave = debounce((nextValue) => console.log(nextValue), 1000);

  return <input type="text" value={value} onChange={debouncedSave} />;
};
```

## Throttle

Throttling is a technique in which, no matter how many times the user fires the event, the attached function will be executed only once in a given time interval.

common approach in js:

```js
function throttle(fn, delay) {
  let delayFlag = false;

  return function () {
    if (delayFlag) {
      return;
    }

    delayFlag = true;
    fn();
    setTimeout(() => {
      delayFlag = false;
    }, delay);
  };
}
```

common approach in react with useEffect and useState:

```js
const Component = () => {
    const [flag, setFlag] = useState(false)

    const submit = () => {
        if (flag) return;
        setFlag(true)
        # run submit fn
        setTimeout(() => {
            setFlag(false)
        }, 1000)
    }

    return (
        <button onClick={submit}>
    )
}
```

common approach in react with lodash:

```js
import { throttle } from "lodash";

const Component = () => {
  const throttledSave = throttle((nextValue) => console.log(nextValue), 1000);

  return <input type="text" value={value} onChange={throttledSave} />;
};
```
