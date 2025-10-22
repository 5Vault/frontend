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
import UserTierTemplate from "./templates/UserTier.tsx";
import CheckOut from "./templates/CheckOut.tsx";
import { Toaster } from "react-hot-toast";

const toasterConfig = {
  position: "top-right" as const,
  containerStyle: {
    zIndex: 9999,
    right: "1%",
    overflow: "hidden",
  },
  toastOptions: {
    style: {
      backgroundColor: "#1a1a1a",
      color: "#fff",
      borderRadius: "8px",
      padding: "10px",
    },
    success: { duration: 4000 },
    error: { duration: 4000 },
  },
};

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
                <Route path="/settings/tier" element={<UserTierTemplate />} />
                <Route path="/checkout" element={<CheckOut />} />
              </Route>
              <Route path="/" element={<Home />} />
              <Route path="/account" element={<AccountTemplate />} />
              <Route path="/products" element={<ProductsTemplate />} />
              <Route path="/about-us" element={<AboutUsTemplate />} />
              <Route path="/tiers" element={<TiersTemplate />} />
            </Routes>
          </BrowserRouter>
          <Toaster {...toasterConfig} />
        </FileModalProvider>
      </VisualProvider>
    </AuthProvider>
  </StrictMode>
);
