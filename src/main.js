import "./styles/main.css";
import { renderApp } from "./app/app.js";

const appRoot = document.querySelector("#app");

if (!appRoot) {
  throw new Error("Application root #app was not found.");
}

renderApp(appRoot);
