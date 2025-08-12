import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Route, BrowserRouter, Routes } from "react-router";

import VisualProvider from "./provider/VisualProvider.tsx";
import Home from "./templates/Home.tsx";
import AccountTemplate from "./templates/Account.tsx";
import DocsTemplate from "./templates/Docs.tsx";
import ContactTemplate from "./templates/Contact.tsx";
import AboutUsTemplate from "./templates/AboutUs.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VisualProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<App section="dashboard" />} />
          <Route path="/storages" element={<App section="storages" />} />
          <Route path="/storage/:id" element={<App section="storage" />} />
          <Route path="/settings" element={<App section="settings" />} />
          <Route path="/account" element={<AccountTemplate />} />
          <Route path="/docs" element={<DocsTemplate />} />
          <Route path="/contact" element={<ContactTemplate />} />
          <Route path="/about-us" element={<AboutUsTemplate />} />
        </Routes>
      </BrowserRouter>
    </VisualProvider>
  </StrictMode>
);
