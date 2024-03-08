# Problem Faced In React Development 1

---

date: 08/03/2024
topics: react javascript 

---

## Problem 1: Dynamic Video Source

I was working on a video preview component where it should update the source after a new video is uploaded. But even the url is updated, the video source is not updated. 

consider the following code, suppose the `videoUrl` is updated after a new video is uploaded, but the video source is not updated.

```tsx

import React, { useState } from "react";

const VideoPreview = ({videoUrl}) => {
  return (
    <video width="320" height="240" controls>
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
};
```

### Solution 1: Update by Key

Since React uses the key to identify the component, we can update the key of the video component to force it to re-render. When we use videoUrl as the key, the video component will re-render when the videoUrl is updated.

```tsx
import React, { useState } from "react";

const VideoPreview = ({videoUrl}) => {
  return (
    <video key={videoUrl} width="320" height="240" controls>
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
};
```

### Solution 2: Use useRef

There is a native way to update the video, which is use the `load()` method of the video element. We can use `useRef` to get the video element and call the `load()` method when the videoUrl is updated.

```tsx
import React, { useState, useRef, useEffect } from "react";

const VideoPreview = ({videoUrl}) => {
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

### References:
- [Can I use javascript to dynamically change a video's source?](https://stackoverflow.com/questions/3732562/can-i-use-javascript-to-dynamically-change-a-videos-source)
- [Updating source URL on HTML5 video with React](https://stackoverflow.com/questions/41303012/updating-source-url-on-html5-video-with-react)

