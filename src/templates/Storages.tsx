import toast from "react-hot-toast";
import useVisualContext from "../hook/useVisualContext";
import dashboardContent from "../utils/contents/DashBoard";
import Icons from "../utils/Icons";
import InputWithIcon from "../components/InputWithIcon";
import { useEffect, useState } from "react";
import type { File } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";

const StoragesTemplate = () => {
  const { language } = useVisualContext();
  const { key } = useAuthContext();

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    console.log(key);
    if (!key) return;
    fetch("http://localhost:8000/api/v1/file/", {
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
      <div className="flex flex-col overflow-y-auto w-full items-center justify-center gap-2 p-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="border border-zinc-100/10 rounded-lg p-2 flex items-center gap-4 justify-start w-fit min-w-220 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <img
              src={file.file_url}
              alt={file.file_id}
              className="w-18 h-18 rounded"
            />
            <h2 className="text-lg ">{file.file_id}</h2>

            {file.file_type === "image/jpeg" ||
            file.file_type === "image/png" ? (
              <p className="flex items-center gap-2">{Icons.image} Imagem</p>
            ) : file.file_type === "video/mp4" ? (
              <p className="flex items-center gap-2">{Icons.video} Vídeo</p>
            ) : file.file_type === "audio/mpeg" ? (
              <p className="flex items-center gap-2">{Icons.audio} Áudio</p>
            ) : (
              <p className="flex items-center gap-2">{Icons.files} Arquivo</p>
            )}
            <p className="text-zinc-400">
              {new Date(file.uploaded_at).toLocaleString()}
            </p>
            <p className="text-sm text-zinc-400">
              {(file.file_size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoragesTemplate;
