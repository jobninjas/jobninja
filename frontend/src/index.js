import React from "react";
console.log("jobNinjas booting...");
// Force redeploy v3 - 2026-01-15
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
