import { Toaster } from "react-hot-toast";
import Side from "./components/Side";
import DashBoardTemplate from "./templates/DashBoard";
import StorageTemplate from "./templates/Storages";
import SettingsTemplate from "./templates/Settings";
import type { ReactElement } from "react";

type SectionType = "dashboard" | "storage" | "settings";

interface AppProps {
  section: SectionType;
}

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

const templates: Record<SectionType, ReactElement> = {
  dashboard: <DashBoardTemplate />,
  storage: <StorageTemplate />,
  settings: <SettingsTemplate />,
};

function App({ section }: AppProps) {
  return (
    <div className="flex h-screen w-screen">
      <Side />
      {/* Generic */}
      <main className="flex-1 p-6 w-full h-full justify-center">
        {templates[section]}
      </main>
      <Toaster {...toasterConfig} />
    </div>
  );
}

export default App;
