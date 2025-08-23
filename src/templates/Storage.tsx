import Icons from "../utils/Icons";
import InputWithIcon from "../components/InputWithIcon";
import { useEffect, useState, useCallback } from "react";
import type { FileType } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";
import Select from "react-select";
import File from "../components/File";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import useFileModalContext from "../hook/useFileModalContext";


const StorageTemplate = () => {
  const { key } = useAuthContext();
  const { setFile } = useFileModalContext();
  const [files, setFiles] = useState<FileType[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const axiosInstance = useAxios();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragOver to false if we're leaving the component entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    setIsUploading(true);
    toast.loading("Fazendo upload do arquivo...");

    try {
      for (const file of droppedFiles) {
        // Convert file to base64 for JSON transmission
        const arrayBuffer = await file.arrayBuffer();
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        // Create JSON payload with the specified format
        const payload = {
          mime_type: file.type,
          data: base64String
        };

        await axiosInstance.post('/file/upload', payload, {
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': key
          },
        });
      }

      toast.dismiss();
      toast.success(`${droppedFiles.length} arquivo(s) enviado(s) com sucesso!`);
      
      // Refresh file list after upload
      if (!key) return;
      try {
        const response = await fetch(import.meta.env.VITE_SERVER_URL + "/file/", {
          headers: {
            "Api-Key": key,
          },
        });
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao fazer upload do arquivo");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [axiosInstance, key]);

  const fetchFiles = useCallback(async () => {
    if (!key) return;
    try {
      const response = await fetch(import.meta.env.VITE_SERVER_URL + "/file/", {
        headers: {
          "Api-Key": key,
        },
      });
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [key]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div 
      className={`relative flex flex-col items-center justify-start w-full h-full gap-8 px-24 py-10 transition-all duration-200 ${
        isDragOver 
          ? 'bg-[var(--primary-contrast-opacity)] border-2 border-dashed border-[var(--primary-contrast-light)]' 
          : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
      
      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--primary-contrast-opacity)] z-50">
          <div className="text-6xl mb-4">📁</div>
          <div className="text-3xl font-bold text-[var(--primary-contrast-light)]">DROPE AQUI</div>
          <div className="text-lg text-zinc-300">Solte os arquivos para fazer upload</div>
        </div>
      )}
      
      {/* Upload Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <div className="text-3xl font-bold text-yellow-400">ENVIANDO...</div>
          <div className="text-lg text-zinc-300">Aguarde o upload dos arquivos</div>
        </div>
      )}
      
      <div className="flex items-center justify-between w-full"></div>
      <div className="flex flex-col overflow-y-auto w-full items-center justify-start gap-2 p-2">
        {files.map((file) => (
          <File file={file} key={file.file_id} setFile={setFile} />
        ))}
      </div>
    </div>
  );
};

export default StorageTemplate;
