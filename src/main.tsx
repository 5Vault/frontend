import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Route, BrowserRouter, Routes } from "react-router";

import UserProvider from "./providers/UserProvider.tsx";
import VisualProvider from "./provider/VisualProvider.tsx";
import FileModalProvider from "./provider/FileModalProvider.tsx";

import Home from "./templates/Home.tsx";
import AccountTemplate from "./templates/Account.tsx";
import CheckOut from "./templates/CheckOut.tsx";
import BucketStorageTemplate from "./templates/BucketStorage.tsx";
import Admin from "./templates/Admin.tsx";
import ForgotPasswordTemplate from "./templates/ForgotPassword.tsx";
import ResetPasswordTemplate from "./templates/ResetPassword.tsx";

import RouteGate from "./routes/RouteGate.tsx";
import SessionListener from "./components/SessionListener.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import LGPDBanner from "./components/LGPDBanner.tsx";

import { Toaster } from "react-hot-toast";

const toasterConfig = {
  position: "top-right" as const,
  containerStyle: { zIndex: 9999, right: "16px", top: "16px" },
  toastOptions: {
    style: {
      backgroundColor: "#18181b",
      color: "#fff",
      borderRadius: "10px",
      padding: "12px 16px",
      fontSize: "13px",
      fontWeight: "500",
      border: "1px solid #27272a",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    },
    success: {
      duration: 4000,
      iconTheme: { primary: "#e8073f", secondary: "#fff" },
    },
    error: {
      duration: 5000,
      iconTheme: { primary: "#e8073f", secondary: "#fff" },
    },
    loading: {
      iconTheme: { primary: "#e8073f", secondary: "#18181b" },
    },
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <UserProvider>
          <VisualProvider>
            <FileModalProvider>
              {/* Listens for 401 events from the API client and clears session */}
              <SessionListener />

              <Routes>
                {/* Public routes — redirect to /dashboard if already authenticated */}
                <Route element={<RouteGate redirectAuthenticated />}>
                  <Route path="/account" element={<AccountTemplate />} />
                </Route>

                {/* Landing page — always public */}
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/forgot-password" element={<ForgotPasswordTemplate />} />
                <Route path="/reset-password/:token" element={<ResetPasswordTemplate />} />

                {/* Private routes — redirect to /account?mode=login if not authenticated */}
                <Route element={<RouteGate requireUser />}>
                  <Route path="/dashboard" element={<App section="dashboard" />} />
                  <Route path="/storage" element={<App section="storage" />} />
                  <Route path="/settings" element={<App section="settings" />} />
                  <Route path="/settings/tier" element={<App section="tier" />} />
                  <Route path="/api-keys" element={<App section="api-keys" />} />
                  <Route path="/sdk" element={<App section="sdk" />} />
                  <Route path="/bucket" element={<BucketStorageTemplate />} />
                  <Route path="/checkout" element={<CheckOut />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/suporte" element={<App section="suporte" />} />
                  <Route path="/backup" element={<App section="backup" />} />
                </Route>
              </Routes>

              <LGPDBanner />
              <Toaster {...toasterConfig} />
            </FileModalProvider>
          </VisualProvider>
        </UserProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
