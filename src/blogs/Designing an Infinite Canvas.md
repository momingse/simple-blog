# Designing an Infinite Canvas

---

date: 19/10/2025
topics: javascript canvas

---

## Background

An infinite canvas allows scrolling infinitely in both horizontal and vertical directions. Applications like Miro, Figma, and Excalidraw utilize this concept to build their interfaces. To implement an "infinite canvas," we don't actually render an infinite space. Instead, we transform a finite viewport. The key to implementing an infinite canvas is understanding how to apply transformations to this viewport.

## Core Abstractions: The Virtual Coordinate Space

The core abstraction for an infinite canvas is the virtual coordinate space. There are two primary transformations: panning and zooming. Panning changes the coordinates, while zooming adjusts both the scale and coordinates. We represent these transformations using `virtualX` and `virtualY` for the panning offset and `scaleX` and `scaleY` for the zoom level.

![img](../../public/blog/Designing%20an%20Infinite%20Canvas/image-1.svg)

## Panning & Dragging: Transforming the Viewport

To implement panning, we add event listeners to handle mouse movement. One way to determine where to pan is by capturing the mouse movement and updating `virtualX` and `virtualY` to shift the canvas immediately.

For example, if the mouse moves from `(x1, y1)` to `(x2, y2)` in a single tick, we pan the canvas by `x2 - x1` and `y2 - y1`. This can be achieved using a `pan(x, y)` function. From the `MouseEvent`, we can obtain this information using `e.movementX` and `e.movementY`.

```js
let isPanning = false;

const handleDragStart = () => {
  isPanning = true;
};

const handleDragEnd = () => {
  isPanning = false;
};

const handleDrag = (e) => {
  if (!isPanning) return;

  // Pan all elements in the canvas by e.movementX and e.movementY
  // This updates virtualX and virtualY
  canvas.pan(e.movementX, e.movementY);
};

window.addEventListener("mousedown", handleDragStart);
window.addEventListener("mousemove", handleDrag);
window.addEventListener("mouseup", handleDragEnd);
```

If you are using React, consider disabling `StrictMode` during development, as it may create duplicate event listeners, causing the virtual coordinates to update twice.

## Zooming Around the Center

To implement zooming, we control the `scale` value in the virtual coordinate space. For example, clicking a zoom button could increase the `scale` by 0.1, where 1 is the initial value. We avoid multiplication for incremental changes to prevent floating-point precision errors, such as the classic `0.1 + 0.2 = 0.30000000004` issue in JavaScript.

## Applying Transformation to the Canvas

To transform elements on the canvas, we follow two steps:

1. Update the virtual coordinates.
2. Render all elements according to the updated virtual coordinates.

### Panning

For panning, we update the virtual coordinates by calculating the change in x and y (`e.movementX` and `e.movementY`), dividing by the current scale, and adding the result to the virtual coordinates.

```js
virtualX += dx / scaleX;
virtualY += dy / scaleY;
```

### Zooming

For zooming, we update the scale by adding the zoom delta. Since the canvas origin `(0, 0)` is at the top-left corner, we adjust the virtual coordinates to keep the zoom centered on the screen. We calculate the zoom delta for both axes and adjust `virtualX` and `virtualY` by half the delta to center the zoom.

```js
const newScaleX = scaleX + zoomDelta;
const newScaleY = scaleY + zoomDelta;
const zoomDeltaX = canvasWidth / newScaleX - canvasWidth / scaleX;
const zoomDeltaY = canvasHeight / newScaleY - canvasHeight / scaleY;
scaleX = newScaleX;
scaleY = newScaleY;
virtualX -= zoomDeltaX / 2;
virtualY -= zoomDeltaY / 2;
```

### Rendering

Assuming we have a list of elements to render, each with virtual coordinates, we need to convert these to real (screen) coordinates for rendering. Using `virtualX` and `virtualY` as offsets and `scaleX` and `scaleY` as scaling factors, we can use the following formula to compute the real coordinates.

```js
function virtualToReal(x, y) {
  return {
    x: (x - virtualX) * scaleX,
    y: (y - virtualY) * scaleY,
  };
}
```

## Chunked Scene Rendering

Rendering every element on the canvas for each transformation can be inefficient, especially with thousands of elements. To optimize, we can divide the "world space" into a grid of tiles and render only the tiles within the viewport. This is known as "chunked scene rendering."

![img](../../public/blog/Designing%20an%20Infinite%20Canvas/image-2.svg)

When an element is added to the canvas, we assign it to the appropriate tile. During rendering, we check which tiles are in the viewport and render only their elements. Below is pseudocode for adding elements to tiles and rendering them.

```js
function addElementToTile(element) {
  // Determine which tile the element belongs to by dividing its virtual coordinates by the tile size
  const tileX = Math.floor(element.virtualX / tileSize);
  const tileY = Math.floor(element.virtualY / tileSize);

  // Add the element to the corresponding tile in the tile map
  // Note: Elements may span multiple tiles, but for simplicity, we assume they belong to one tile
  const key = `${tileX},${tileY}`;
  if (tileMap.has(key)) {
    tileMap.get(key).push(element);
  } else {
    tileMap.set(key, [element]);
  }
}

function render() {
  // Determine which tiles the canvas viewport covers
  const canvasTileX = Math.floor(canvas.virtualX / tileSize);
  const canvasTileY = Math.floor(canvas.virtualY / tileSize);

  // Calculate the number of tiles based on canvas dimensions
  const numTilesX = Math.ceil(canvas.width / tileSize);
  const numTilesY = Math.ceil(canvas.height / tileSize);

  // Render each tile in the viewport
  for (let i = canvasTileX; i < canvasTileX + numTilesX; i++) {
    for (let j = canvasTileY; j < canvasTileY + numTilesY; j++) {
      const key = `${i},${j}`;
      if (tileMap.has(key)) {
        const elements = tileMap.get(key);
        elements.forEach((element) => {
          // Check if the element is within the viewport
          if (
            element.virtualX >= canvasTileX * tileSize &&
            element.virtualX < (canvasTileX + numTilesX) * tileSize &&
            element.virtualY >= canvasTileY * tileSize &&
            element.virtualY < (canvasTileY + numTilesY) * tileSize
          ) {
            // Render the element
            renderElement(element);
          }
        });
      }
    }
  }
}
```
