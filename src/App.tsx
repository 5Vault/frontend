import Side from "./components/Side";
import DashBoardTemplate from "./templates/DashBoard";
import SettingsTemplate from "./templates/Settings";
import ApiKeysTemplate from "./templates/ApiKeys";
import UserTierTemplate from "./templates/UserTier";
import SDKTemplate from "./templates/SDK";
import SupportTemplate from "./templates/Support";
import BackupTemplate from "./templates/Backup";
import type { ReactElement } from "react";
import StorageTemplate from "./templates/Storage";
import useFileModalContext from "./hook/useFileModalContext";
import ItemView from "./components/ItemView";

type SectionType =
  | "dashboard"
  | "storage"
  | "settings"
  | "api-keys"
  | "tier"
  | "sdk"
  | "suporte"
  | "backup"

interface AppProps {
  section: SectionType;
}


const templates: Record<SectionType, ReactElement> = {
  dashboard: <DashBoardTemplate />,
  storage: <StorageTemplate />,
  settings: <SettingsTemplate />,
  "api-keys": <ApiKeysTemplate />,
  tier: <UserTierTemplate />,
  sdk: <SDKTemplate />,
  suporte: <SupportTemplate />,
  backup: <BackupTemplate />,
};

function App({ section }: AppProps) {

  const { fileModal, setFileModal } = useFileModalContext();

  return (
    <div className="flex h-screen w-screen bg-gdnt">
      <Side />
      {/* Generic */}
      <main className="flex-1 p-6 w-full h-full justify-center relative">
        {fileModal && <ItemView file={fileModal} setFile={setFileModal}/>}
        {templates[section]}
      </main>
      
    </div>
  );
}

export default App;
