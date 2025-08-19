import Icons from "../utils/Icons";
import InputWithIcon from "../components/InputWithIcon";
import { useEffect, useState } from "react";
import type { File } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";
import Select from "react-select";

const StoragesTemplate = () => {
  const { key } = useAuthContext();

  const [files, setFiles] = useState<File[]>([]);

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
          <div
            key={file.id}
            className="border border-zinc-100/10 rounded-lg p-2 flex items-center gap-4 justify-start w-fit hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <img
              src={file.file_url}
              alt={file.file_id}
              className="h-36 rounded"
            />
            <span className="flex flex-col gap-2 p-2">
              <h2 className="text-xl font-semibold">{file.file_id}</h2>
              {file.file_type === "image/jpeg" ||
              file.file_type === "image/png" ? (
                <p className="flex items-center gap-2">
                  {Icons.image} <span className="text-zinc-400">Imagem</span>
                </p>
              ) : file.file_type === "video/mp4" ? (
                <p className="flex items-center gap-2">
                  {Icons.video} <span className="text-zinc-400">Vídeo</span>
                </p>
              ) : file.file_type === "audio/mpeg" ? (
                <p className="flex items-center gap-2">
                  {Icons.audio} <span className="text-zinc-400">Áudio</span>
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  {Icons.files} <span className="text-zinc-400">Arquivo</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                {Icons.date}
                <span className="text-zinc-400">
                  {new Date(file.uploaded_at).toLocaleString()}
                </span>
              </p>
              <p className="text-sm flex items-center gap-2">
                {Icons.storage}
                <span className="text-zinc-400">
                  {(file.file_size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </p>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoragesTemplate;
