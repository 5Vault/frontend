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
import AuthProvider from "./provider/AuthProvider.tsx";

import PrivateRoutes from "./routes/PrivateRoute.tsx";
import TiersTemplate from "./templates/Tiers.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <VisualProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<App section="dashboard" />} />
              <Route path="/storages" element={<App section="storages" />} />
              <Route path="/storage/:id" element={<App section="storage" />} />
              <Route path="/settings" element={<App section="settings" />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<AccountTemplate />} />
            <Route path="/docs" element={<DocsTemplate />} />
            <Route path="/contact" element={<ContactTemplate />} />
            <Route path="/about-us" element={<AboutUsTemplate />} />
            <Route path="/tiers" element={<TiersTemplate />} />
          </Routes>
        </BrowserRouter>
      </VisualProvider>
    </AuthProvider>
  </StrictMode>
);
