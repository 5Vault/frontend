import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Route, BrowserRouter, Routes } from "react-router";

import VisualProvider from "./provider/VisualProvider.tsx";
import Home from "./templates/Home.tsx";
import AccountTemplate from "./templates/Account.tsx";
import ProductsTemplate from "./templates/Products.tsx";
import AboutUsTemplate from "./templates/AboutUs.tsx";
import AuthProvider from "./provider/AuthProvider.tsx";
import PrivateRoutes from "./routes/PrivateRoute.tsx";
import TiersTemplate from "./templates/Tiers.tsx";
import FileModalProvider from "./provider/FileModalProvider.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <VisualProvider>
        <FileModalProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PrivateRoutes />}>
                <Route path="/dashboard" element={<App section="dashboard" />} />
                <Route path="/storage" element={<App section="storage" />} />
                <Route path="/settings" element={<App section="settings" />} />
              </Route>
              <Route path="/" element={<Home />} />
              <Route path="/account" element={<AccountTemplate />} />
              <Route path="/products" element={<ProductsTemplate />} />
              <Route path="/about-us" element={<AboutUsTemplate />} />
              <Route path="/tiers" element={<TiersTemplate />} />
            </Routes>
          </BrowserRouter>
        </FileModalProvider>
      </VisualProvider>
    </AuthProvider>
  </StrictMode>
);
