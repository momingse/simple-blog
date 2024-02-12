import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import "./highlightjsTheme.css";

ReactDOM.hydrateRoot(
  document.getElementById("app")!,
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
