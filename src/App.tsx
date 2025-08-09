import { Toaster } from "react-hot-toast";
import Side from "./components/Side";
import DashBoardTemplate from "./templates/DashBoard";
import StorageTemplate from "./templates/Storage";
import SettingsTemplate from "./templates/Settings";


function App({section}: {section: "dashboard" | "storage" | "settings"}) {

  const templates = {
    dashboard: <DashBoardTemplate />,
    storage: <StorageTemplate />,
    settings: <SettingsTemplate />,
  }

  return (
    <div className="flex h-screen w-screen">
      <Side />
      {/* Generic */}
      <div className="flex-1 p-6 w-full h-full justify-center">
        {templates[section]}
      </div>
      <Toaster
        position="top-right"
        containerStyle={{
          zIndex: 9999,
          right: "1%",
          overflow: "hidden",
        }}
        toastOptions={{
          style: {
            backgroundColor: "#1a1a1a",
            color: "#fff",
            borderRadius: "8px",
            padding: "10px",
          },
          success: { duration: 4000 },
          error: { duration: 4000 },
        }}
      />
    </div>
  );
}

export default App;
