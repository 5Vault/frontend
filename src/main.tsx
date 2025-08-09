import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Route, BrowserRouter, Routes } from "react-router";

import VisualProvider from "./provider/VisualProvider.tsx";
import Home from "./templates/Home.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VisualProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<App section="dashboard" />} />
          <Route path="/storage" element={<App section="storage" />} />
          <Route path="/settings" element={<App section="settings" />} />
        </Routes>
      </BrowserRouter>
    </VisualProvider>
  </StrictMode>
);
