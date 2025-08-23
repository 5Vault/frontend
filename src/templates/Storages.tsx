import Icons from "../utils/Icons";
import InputWithIcon from "../components/InputWithIcon";
import { useEffect, useState } from "react";
import type { FileType } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";
import Select from "react-select";
import File from "../components/File";


const StoragesTemplate = () => {
  const { key } = useAuthContext();

  const [files, setFiles] = useState<FileType[]>([]);

  useEffect(() => {
    console.log(key);
    if (!key) return;
    fetch(import.meta.env.VITE_SERVER_URL + "/file/", {
      headers: {
        "Api-Key": key,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFiles(data);
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
      });
  }, [key]);

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
          <Select
            options={[
              {
                value: "image",
                label: "Imagens",
              },
              {
                value: "video",
                label: "Vídeos",
              },
              {
                value: "audio",
                label: "Áudios",
              },
              {
                value: "files",
                label: "Arquivos",
              },
            ]}
            className="w-64"
          />
          <InputWithIcon icon={Icons.search} placeholder="Search Storages..." />
        </span>
      </header>
      <div className="flex items-center justify-between w-full"></div>
      <div className="flex flex-wrap overflow-y-auto w-full items-center justify-center gap-2 p-2">
        {files.map((file) => (
          <File file={file} key={file.file_id} />
        ))}
      </div>
    </div>
  );
};

export default StoragesTemplate;
