import Icons from "../utils/Icons";
import InputWithIcon from "../components/Input/InputWithIcon";
import { useEffect, useState, useCallback } from "react";
import type { FileType } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";
import Select from "react-select";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import { Database } from "lucide-react";
import InlineFile from "../components/File/InlineFile";
import HeaderTemplate from "../components/Header";

const StorageTemplate = () => {
  const { key } = useAuthContext();  
  const [files, setFiles] = useState<FileType[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState<10 | 30 | 50>(10);
  const [page, setPage] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("");
  const axiosInstance = useAxios();

  const setBlob = (file: FileType) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file_id === file.file_id ? { ...f, blob: file.blob } : f))
    );
  };

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

  const fetchFiles = useCallback(async () => {
    if (!key) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        items_per_page: itemsPerPage.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (fileTypeFilter) params.append('type', fileTypeFilter);
      
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/file/?${params.toString()}`,
        {
          headers: {
            "Api-Key": key,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Assuming the API returns { files: FileType[], total: number }
      // Adjust based on your actual API response structure
      if (Array.isArray(data)) {
        setFiles(data);
        setTotalFiles(data.length);
      } else {
        setFiles(data.files || []);
        setTotalFiles(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Erro ao carregar arquivos");
      setFiles([]);
      setTotalFiles(0);
    } finally {
      setIsLoading(false);
    }
  }, [key, page, itemsPerPage, searchQuery, fileTypeFilter]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
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
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );

          // Create JSON payload with the specified format
          const payload = {
            mime_type: file.type,
            data: base64String,
          };

          await axiosInstance.post("/file/upload", payload, {
            headers: {
              "Content-Type": "application/json",
              "Api-Key": key,
            },
          });
        }

        toast.dismiss();
        toast.success(
          `${droppedFiles.length} arquivo(s) enviado(s) com sucesso!`
        );

        // Refresh file list after upload
        fetchFiles();
      } catch (error) {
        toast.dismiss();
        toast.error("Erro ao fazer upload do arquivo");
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [axiosInstance, key, fetchFiles]
  );

  const totalPages = Math.ceil(totalFiles / itemsPerPage);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const handleItemsPerPageChange = useCallback((selectedOption: { value: number; label: string } | null) => {
    if (selectedOption) {
      setItemsPerPage(selectedOption.value as 10 | 30 | 50);
      setPage(1); // Reset to first page when changing items per page
    }
  }, []);

  const handleFileTypeFilterChange = useCallback((selectedOption: { value: string; label: string } | null) => {
    setFileTypeFilter(selectedOption?.value || "");
    setPage(1); // Reset to first page when changing filter
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div
      className={`relative flex flex-col items-center justify-start w-full h-full gap-4 transition-all duration-200 ${
        isDragOver
          ? "bg-[var(--primary-contrast-opacity)] border-2 border-dashed border-[var(--primary-contrast-light)]"
          : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <HeaderTemplate 
        icon={<Database size={38} />}
        title="Store Management"
        description="Monitor and manage your storage infrastructure."
        content={
          <span className="flex gap-2">
            
            <Select
              options={[
                {
                  value: 10,
                  label: "10 itens",
                },
                {
                  value: 30,
                  label: "30 itens",
                },
                {
                  value: 50,
                  label: "50 itens",
                },
              ]}
              className="w-34"
              value={{ value: itemsPerPage, label: `${itemsPerPage} itens` }}
              onChange={handleItemsPerPageChange}
              isSearchable={false}
              styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
                borderColor: "#4a5565",
                color: "white",
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#4a5565" : "#3f3f3f",
                color: "white",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "white",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
              }),
              menuPortal: (provided) => ({
                ...provided,
                zIndex: 10000,
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#adadad",
              }),
            }}
            />
            <Select
              options={[
                {
                  value: "",
                  label: "Todos os tipos",
                },
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
                  value: "document",
                  label: "Documentos",
                },
              ]}
              className="w-44"
              placeholder="Filtrar por tipo..."
              isClearable
              value={fileTypeFilter ? { value: fileTypeFilter, label: fileTypeFilter } : null}
              onChange={handleFileTypeFilterChange}
            />
            {/* <Select
              options={[
                {
                  value: "",
                  label: "Todos os tipos",
                },
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
                  value: "document",
                  label: "Documentos",
                },
              ]}
              className="w-44"
              placeholder="Filtrar por tipo..."
              isClearable
              value={fileTypeFilter ? { value: fileTypeFilter, label: fileTypeFilter } : null}
              onChange={handleFileTypeFilterChange}
              styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
                borderColor: "#4a5565",
                color: "white",
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#4a5565" : "#3f3f3f",
                color: "white",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "white",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
              }),
              menuPortal: (provided) => ({
                ...provided,
                zIndex: 10000,
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#adadad",
              }),
            }}
            /> */}
            <InputWithIcon 
              icon={Icons.search} 
              placeholder="Search Storages..." 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </span>
        }
      />      

      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--primary-contrast-opacity)] z-50">
          <div className="text-6xl mb-4">📁</div>
          <div className="text-3xl font-bold text-[var(--primary-contrast-light)]">
            DROPE AQUI
          </div>
          <div className="text-lg text-zinc-300">
            Solte os arquivos para fazer upload
          </div>
        </div>
      )}

      {/* Upload Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <div className="text-3xl font-bold text-yellow-400">ENVIANDO...</div>
          <div className="text-lg text-zinc-300">
            Aguarde o upload dos arquivos
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-start w-full overflow-y-auto h-full border border-zinc-800 p-4 rounded-xl bg-zinc-900/50 gap-4">
        
        <div className="flex flex-col w-full items-center justify-start gap-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin text-4xl">⏳</div>
              <span className="ml-2">Carregando arquivos...</span>
            </div>
          ) : files.length > 0 ? (
            files.map((file) => (
              <InlineFile file={file} key={file.file_id} setFile={setBlob}/>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-400">
              {searchQuery || fileTypeFilter ? (
                <div>
                  <p>Nenhum arquivo encontrado para os filtros aplicados</p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setFileTypeFilter("");
                    }}
                    className="mt-2 text-blue-500 hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                "Nenhum arquivo encontrado"
              )}
            </div>
          )}
        </div>
        
      </div>
      <div className="flex gap-4 items-center">
        <button 
          onClick={handlePreviousPage}
          disabled={page === 1 || isLoading}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          {Icons.arrow_left}
        </button>
        <p className="text-sm">
          Página {page} de {totalPages || 1} ({totalFiles} itens)
        </p>
        <button 
          onClick={handleNextPage}
          disabled={page >= totalPages || isLoading}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          {Icons.arrow_right}
        </button>
      </div>
    </div>
  );
};

export default StorageTemplate;