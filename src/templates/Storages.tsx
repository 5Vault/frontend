import toast from "react-hot-toast";
import useVisualContext from "../hook/useVisualContext";
import dashboardContent from "../utils/contents/DashBoard";
import Icons from "../utils/Icons";
import InputWithIcon from "../components/InputWithIcon";
import { useState } from "react";
import type { File } from "../@types/Storage";

const StoragesTemplate = () => {
  const { language } = useVisualContext();

  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-8 px-24 py-10">
      <header className="w-full flex justify-between items-center">
        <span className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">Store Management</h2>
          <h5 className="text-sm text-zinc-400 tracking-wide">
            Monitor and manage your storage infrastructure.
          </h5>
        </span>
        <span className="flex gap-2">
          {/* Usando o componente InputWithIcon */}
          <InputWithIcon icon={Icons.search} placeholder="Search Storages..." />
          <button
            className="h-10 flex justify-start items-center gap-2 border-0.5 border-zinc-100 px-4 bg-[#00000039]"
            onClick={() => {
              toast.success("Adicionado com sucesso!");
            }}
          >
            {Icons.add}
            {dashboardContent.addStorage[language]}
          </button>
        </span>
      </header>
      <div className="flex flex-wrap overflow-y-auto w-full justify-center gap-10 p-2">

      </div>
    </div>
  );
};

export default StoragesTemplate;
