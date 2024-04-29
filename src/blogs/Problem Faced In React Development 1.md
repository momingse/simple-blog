# Problem Faced In React Development 1

---

date: 08/03/2024
topics: react javascript

---

## Problem 1: Dynamic Video Source

I was working on a video preview component where it should update the source after a new video is uploaded. But even the url is updated, the video source is not updated.

consider the following code, suppose the `videoUrl` is updated after a new video is uploaded, but the video source is not updated.

```js
import React, { useState } from "react";

const VideoPreview = ({ videoUrl }) => {
  return (
    <video width="320" height="240" controls>
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
};
```

### Solution 1: Update by Key

Since React uses the key to identify the component, we can update the key of the video component to force it to re-render. When we use videoUrl as the key, the video component will re-render when the videoUrl is updated.

```js
import React, { useState } from "react";

const VideoPreview = ({ videoUrl }) => {
  return (
    <video key={videoUrl} width="320" height="240" controls>
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
};
```

### Solution 2: Use useRef

There is a native way to update the video, which is use the `load()` method of the video element. We can use `useRef` to get the video element and call the `load()` method when the videoUrl is updated.

```js
import React, { useState, useRef, useEffect } from "react";

const VideoPreview = ({ videoUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current.load();
  }, [videoUrl]);

  return (
    <video ref={videoRef} width="320" height="240" controls>
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
};
```

### Remarks: Problem on Dynamic Video Source in SSR

For ssr, if the initial videoUrl is depended on the js code, like different video for window width, the video will not be rendered correctly. The video will be rendered with the initial videoUrl, and then re-rendered with the correct videoUrl. This is because the videoUrl is not available in the server side, initial video will appear for a short time before the correct video is rendered. Therefore we should prevent the video from rendering in the server side in this case.

## Problem 2: Measuring a DOM node

I was working on a component that needs to measure the size of a DOM node. I need to get the width and height of the DOM node after it is rendered. I wrote something like this.

```js
const MeasureNode = () => {
  const nodeRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (nodeRef.current) {
      setWidth(nodeRef.current.offsetWidth);
    }
  }, [nodeRef.current]);

  return (
    <div ref={nodeRef}>
      <p>Width: {width}</p>
    </div>
  );
};
```

### Solution: Use `useCallback`

Since the `nodeRef.current` will not trigger the effect when it is updated, we should use `useCallback` to get the width of the node when the node is updated.

```js
function MeasureExample() {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <h1 ref={measuredRef}>Hello, world</h1>
      <h2>The above header is {Math.round(height)}px tall</h2>
    </>
  );
}
```

## Problem 3: TypeError when using reduce

We often need to use reduce to generate new array or object. But most of the time the error: `Element implicitly has an 'any' type because expression of type '*' can't be used to index type '{}'.` appears. Here is the example code. 

```ts
const a = [1, 2, 3]

const obj = a.reduce((acc, value, index) => {
  acc[value] = value
  return acc
}, {})
```

At first I solution by adding `as` after `{}` but this is not a good solution since it is kind of ignoring the type checking. And here is other two solution after reading [Array.reduce 的类型你会写吗？](https://juejin.cn/post/7356055073586249779)

### Solution 1: Assign the type of the accumulator

unlike the initial approach, we assign the type of the `acc` to `Record<number, number>`. This will prevent the error from happening.

```ts
const obj = a.reduce((acc: Record<number, number>, value, index) => {
  acc[value] = value
  return acc
}, {})
```

### Solution 2: Use the generic type of reduce

This is a more readable way to solve the problem. We can use the generic type of reduce to assign the type of the accumulator.

```ts
const obj = a.reduce<Record<number, number>>((acc, value, index) => {
  acc[value] = value
  return acc
}, {})
```

## References:

- [Can I use javascript to dynamically change a video's source?](https://stackoverflow.com/questions/3732562/can-i-use-javascript-to-dynamically-change-a-videos-source)
- [Updating source URL on HTML5 video with React](https://stackoverflow.com/questions/41303012/updating-source-url-on-html5-video-with-react)
- [Hooks FAQ](https://legacy.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node)
- [Array.reduce 的类型你会写吗？](https://juejin.cn/post/7356055073586249779)
