# Resizable Component in React/Angular

---

date: 08/07/2024
topics: typescript react angular

---

## Background

In modern web application like notion and vscode. We observe that there is often a resize feature for the navigation bar. More generally, when we want to achieve something like folder manager navigation system, we will need a resizable navigation bar.

## Generalize the Concept

### Layout

Consider we separate the whole window in to two part separately which the left side is navigation part and right side is display part. We may use flex or grid to constructure the layout

```html
<div class="manual-test-case-wrapper">
 <div class="navigation">
 {...}
 </div>
 <div class="display">
 {...}
 </div>
</div>
```

```sass
.manual-test-case-wrapper 
	display: flex
  height: 100%

.display 
	flex: 1
```

### Navigation Part

We need a draggable bar for resizing, which it show place at the boarder of the navigation part and in this case will be located at the right side.

```html
<div class="manual-test-case-wrapper">
 <div class="navigation">
	 <div class="right-resizer" />
 </div>
 <div class="display">
 {...}
 </div>
</div>
```

```sass
.manual-test-case-wrapper 
		display: flex
	  height: 100%

.display 
		flex: 1

.right-resizer
    cursor: ew-resize
    width: 2px
    height: 100%
    position: absolute
    right: 0
    top: 0
    background-color: lightgray
    z-index: 1000
```

## Code Implementation

The only thing we need to handle is enable a resize function when mousdown on the resizer and disable when mouseup.

### Angular

We can implement this by `HostListener` and `ViewChild` to resize the children component.

```html
<div id="resizable" #resizable>
  <div (mousedown)="onMouseDown($event, 'right')" id="right-resizer"></div>
  <ng-content></ng-content>
</div>

```

```js
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-resizable',
  standalone: true,
  imports: [],
  templateUrl: './resizable.component.html',
  styleUrl: './resizable.component.sass',
})
export class ResizableComponent {
  @Input() left: boolean = false;
  @Input() right: boolean = false;
  @Input() top: boolean = false;
  @Input() bottom: boolean = false;
  @ViewChild('resizable') resizable?: ElementRef;

  isResizing = false;

  constructor() {}

  onMouseDown(
    event: MouseEvent,
  ): void {
    event.preventDefault();
    this.isResizing = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    this.rightResizer(event);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (!this.isResizing) return;
    this.isResizing = false;
  }

  rightResizer(event: MouseEvent): void {
    if (!this.resizable) return;
    const resizable = this.resizable.nativeElement as HTMLElement;

    resizable.style.width = `${resizable.offsetWidth + event.movementX}px`;

    event.preventDefault();
  }
}

```

### React

We can use `useRef` to get the size of `Resizable` and use `onMouseDown` to add the listener for resizing.

```js
import { useRef, useState } from "react";

function App() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      <Resizable>
        <Navbar />
      </Resizable>
      <Display />
    </div>
  );
}

const Resizable = ({ children }) => {
  const [width, setWidth] = useState(200);
  const resizerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener("mousemove", resizer);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", resizer);
    });
  };

  const resizer = (e: MouseEvent) => {
    setWidth(e.clientX - resizerRef.current!.getBoundingClientRect().left);
  };

  return (
    <div
      style={{
        position: "relative",
        paddingRight: 10,
        width: width,
      }}
      ref={resizerRef}
    >
      <div
        style={{
          cursor: "ew-resize",
          width: 10,
          height: "100%",
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: 1000,
        }}
        onMouseDown={onMouseDown}
      >
        <div
          style={{
            margin: "auto",
            width: 2,
            height: "100%",
            backgroundColor: "black",
          }}
        />
      </div>
      {children}
    </div>
  );
};

const Navbar = () => {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Contact", link: "/contact" },
    { name: "Blog", link: "/blog" },
    { name: "Portfolio", link: "/portfolio" },
  ];
  return (
    <nav>
      <ul>
        {navItems.map((item) => (
          <li key={item.name}>
            <a href={item.link}>{item.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Display = () => {
  const page = window.location.pathname;

  return (
    <div style={{ flex: 1 }}>
      <h1>{page}</h1>
      <p>This is the {page} page</p>
    </div>
  );
};

export default App;
```
