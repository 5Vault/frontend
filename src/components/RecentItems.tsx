import type { ReactNode } from "react";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import Icons from "../utils/Icons";
import useAuthContext from "../hook/useAuthContext";
import { FolderSync } from "lucide-react";

const RecentItems = ({
  label,    
  children,
  onFileUploaded,
}: {
  label: string;    
  children: ReactNode;
  onFileUploaded?: () => void;
}) => {
  const {key} = useAuthContext();
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

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setIsUploading(true);
    toast.loading("Fazendo upload do arquivo...");

    try {
      for (const file of files) {
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
      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      
      // Call callback to refresh the file list
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao fazer upload do arquivo");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [axiosInstance, onFileUploaded, key]);

  return (
    <div 
      className={`flex flex-col items-center justify-between border h-full rounded-xl transition-all duration-200 ${
        isDragOver 
          ? 'border-dashed border-2 border-[var(--primary-contrast-light)] bg-[var(--primary-contrast-opacity)]' 
          : 'border-zinc-100/15 bg-zinc-900/50'
      } w-full`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header className="flex items-center gap-2 justify-start w-full text-zinc-400 p-4">
        <div className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] rounded-2xl flex items-center justify-center">
          <FolderSync size={24} className="text-zinc-200" />
        </div>
        <span className="flex flex-col justify-start items-start ">
          <span className="font-semibold text-lg text-white">{label}</span>
          <span className="font-semibold text-xs">Últimos Arquivos enviados para o seu storage</span>
        </span>        
      </header>
      
      {isDragOver ? (
        <div className="flex flex-col w-full gap-1 p-4 h-120 max-h-120 items-center justify-center">
          <div className="text-2xl mb-4">{Icons.folder}</div>
          <div className="text-lg font-semibold text-[var(--primary-contrast-light)]">DROPE AQUI</div>
          <div className="text-sm text-zinc-400">Solte o arquivo para fazer upload</div>
        </div>
      ) : isUploading ? (
        <div className="flex flex-col w-full gap-1 p-4 h-120 max-h-120 items-center justify-center">
          <div className="animate-spin text-2xl mb-4">⏳</div>
          <div className="text-lg font-semibold text-yellow-400">ENVIANDO...</div>
          <div className="text-sm text-zinc-400">Aguarde o upload do arquivo</div>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-1 h-fit items-start justify-start overflow-auto p-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default RecentItems;
