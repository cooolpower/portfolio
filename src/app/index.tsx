import React from "react";
import ReactDOM from "react-dom/client";
import { themeClass } from "@/styles/theme.css";
import { App } from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className={themeClass}>
      <App />
    </div>
  </React.StrictMode>,
);
