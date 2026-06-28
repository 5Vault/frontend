import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  Trash2,
  Copy,
  File as FileIcon,
  RefreshCw,
  Loader2,
  ExternalLink,
  HardDrive,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

const ConfirmFileModal = ({
  filename,
  onConfirm,
  onCancel,
}: {
  filename: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="p-2 rounded-full bg-red-500/10 text-red-400"><Trash2 size={20} /></span>
        <h3 className="text-base font-semibold text-white">Excluir arquivo</h3>
      </div>
      <p className="text-sm text-zinc-400">
        Tem certeza que deseja excluir <span className="text-white font-medium">"{filename}"</span>? Esta ação não pode ser desfeita.
      </p>
      <div className="flex gap-2 justify-end mt-1">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Cancelar</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 transition-colors font-medium">Excluir</button>
      </div>
    </div>
  </div>
);
import StorageSetupTemplate from "./StorageSetup";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface StorageConfig {
  bucket_name: string;
  domain: string;
  domain_type: string;
  status: string;
  public_url: string;
}

interface FileEntry {
  key: string;
  size: number;
  last_modified: string;
  public_url: string;
}

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const BucketStorageTemplate = () => {
  const [storageConfig, setStorageConfig] = useState<StorageConfig | null>(null);
  const [hasStorage, setHasStorage] = useState<boolean | null>(null); // null = loading
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStorageConfig = useCallback(async () => {
    try {
      const { data } = await axios.get(SERVER_URL + "/bucket/", {
        headers: authHeader(),
      });
      setStorageConfig(data);
      setHasStorage(true);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setHasStorage(false);
      } else {
        toast.error("Erro ao carregar storage");
        setHasStorage(false);
      }
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!hasStorage) return;
    setFilesLoading(true);
    try {
      const { data } = await axios.get(SERVER_URL + "/bucket/files", {
        headers: authHeader(),
      });
      setFiles(data.files ?? []);
    } catch {
      toast.error("Erro ao listar arquivos");
    } finally {
      setFilesLoading(false);
    }
  }, [hasStorage]);

  useEffect(() => {
    fetchStorageConfig();
  }, [fetchStorageConfig]);

  useEffect(() => {
    if (hasStorage && storageConfig?.status === "active") {
      fetchFiles();
    }
  }, [hasStorage, storageConfig?.status, fetchFiles]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadLoading(true);
    try {
      await axios.post(SERVER_URL + "/bucket/files", formData, {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(`${file.name} enviado!`);
      fetchFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao enviar arquivo");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const deleteFile = async (key: string) => {
    try {
      await axios.delete(`${SERVER_URL}/bucket/files/${encodeURIComponent(key)}`, {
        headers: authHeader(),
      });
      setFileToDelete(null);
      toast.success("Arquivo deletado");
      setFiles((prev) => prev.filter((f) => f.key !== key));
    } catch {
      toast.error("Erro ao deletar arquivo");
    }
  };

  const copyURL = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  // Loading
  if (hasStorage === null) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Carregando...
      </div>
    );
  }

  // No storage yet → wizard
  if (!hasStorage) {
    return (
      <StorageSetupTemplate
        onComplete={() => {
          setHasStorage(null);
          fetchStorageConfig();
        }}
      />
    );
  }

  const isActive = storageConfig?.status === "active";
  const isPending = storageConfig?.status === "pending";
  const isError = storageConfig?.status === "error";

  return (
    <div className="flex flex-col h-full">
      {/* Storage header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Storage</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Arquivos do seu servidor FiveM servidos via Cloudflare R2
          </p>
        </div>
        <button
          onClick={() => { fetchStorageConfig(); fetchFiles(); }}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Storage info banner */}
      {storageConfig && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-zinc-500" />
            <span className="text-zinc-400 text-sm">Bucket:</span>
            <span className="text-white text-sm font-mono">{storageConfig.bucket_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-zinc-500" />
            <span className="text-zinc-400 text-sm">Domínio:</span>
            <a
              href={storageConfig.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm hover:underline"
            >
              {storageConfig.domain}
            </a>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <StatusBadge status={storageConfig.status} />
          </div>
        </div>
      )}

      {/* Pending / error states */}
      {isPending && (
        <div className="bg-yellow-950/30 border border-yellow-800 rounded-xl p-5 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium">Provisionando seu bucket...</p>
            <p className="text-yellow-500 text-sm mt-1">
              Estamos criando seu bucket R2 e configurando o domínio na Cloudflare. Isso leva normalmente menos de 2 minutos.
            </p>
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-red-950/30 border border-red-800 rounded-xl p-5 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium">Erro ao provisionar</p>
            <p className="text-red-500 text-sm mt-1">
              Houve um problema ao criar seu storage. Entre em contato com o suporte informando seu user ID.
            </p>
          </div>
        </div>
      )}

      {/* File management — only when active */}
      {isActive && (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 mb-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-950/20"
                : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50"
            }`}
          >
            {uploadLoading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-zinc-400 text-sm">Enviando...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-500" />
                <p className="text-zinc-300 text-sm">
                  Arraste um arquivo ou <span className="text-blue-400">clique para selecionar</span>
                </p>
                <p className="text-zinc-500 text-xs">Qualquer tipo de arquivo — sem limite de tipo</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" onChange={handleFileInput} className="hidden" />

          {/* Files list */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-medium">
                Arquivos{" "}
                <span className="text-zinc-500 font-normal text-sm">({files.length})</span>
              </h2>
            </div>

            {filesLoading ? (
              <div className="flex items-center justify-center py-12 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Carregando arquivos...
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <FileIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum arquivo ainda. Faça o upload do primeiro!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <FileRow
                    key={file.key}
                    file={file}
                    onDelete={() => setFileToDelete(file.key)}
                    onCopy={() => copyURL(file.public_url)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {fileToDelete && (
        <ConfirmFileModal
          filename={fileToDelete.split("/").pop()!}
          onConfirm={() => deleteFile(fileToDelete)}
          onCancel={() => setFileToDelete(null)}
        />
      )}
    </div>
  );
};

const FileRow = ({
  file,
  onDelete,
  onCopy,
}: {
  file: FileEntry;
  onDelete: () => void;
  onCopy: () => void;
}) => (
  <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors group">
    <FileIcon className="w-4 h-4 text-zinc-500 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm truncate">{file.key}</p>
      <p className="text-zinc-500 text-xs">
        {formatBytes(file.size)} · {new Date(file.last_modified).toLocaleDateString("pt-BR")}
      </p>
    </div>
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <a
        href={file.public_url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
        title="Abrir"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <button
        onClick={onCopy}
        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
        title="Copiar URL"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
        title="Deletar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    active: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: "Ativo",
      cls: "text-green-400 bg-green-900/30 border-green-700",
    },
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Provisionando",
      cls: "text-yellow-400 bg-yellow-900/30 border-yellow-700",
    },
    error: {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: "Erro",
      cls: "text-red-400 bg-red-900/30 border-red-700",
    },
  };
  const { icon, label, cls } = map[status] ?? map.pending;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1 rounded-full ${cls}`}>
      {icon}
      {label}
    </span>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default BucketStorageTemplate;
