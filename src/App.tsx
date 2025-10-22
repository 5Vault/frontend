import Side from "./components/Side";
import DashBoardTemplate from "./templates/DashBoard";
import SettingsTemplate from "./templates/Settings";
import type { ReactElement } from "react";
import StorageTemplate from "./templates/Storage";
import useFileModalContext from "./hook/useFileModalContext";
import ItemView from "./components/ItemView";

type SectionType =
  | "dashboard"
  | "storage"
  | "settings" 

interface AppProps {
  section: SectionType;
}


const templates: Record<SectionType, ReactElement> = {
  dashboard: <DashBoardTemplate />,
  storage: <StorageTemplate />,
  settings: <SettingsTemplate />,
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
