import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

const TEMA_CHAVE = "apusm:tema";
if (localStorage.getItem(TEMA_CHAVE) === "escuro") {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
