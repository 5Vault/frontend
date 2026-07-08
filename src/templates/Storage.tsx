import {useCallback, useEffect, useRef, useState} from "react";
import useAuthContext from "../hook/useAuthContext";
import {
  AlertTriangle,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  File as FileIcon2,
  FileAudio,
  FileVideo,
  FolderPlus,
  Globe,
  Loader2,
  Plus,
  Settings,
  Trash2,
  Upload,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import HeaderTemplate from "../components/Header";
import type {Bucket, Directory, MediaFile} from "../@types/Storage";

type View = "buckets" | "dirs" | "files";

// ── File type helpers ─────────────────────────────────────────────────────────

const isImageFile  = (name: string) => /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(name);
const isAudioFile  = (name: string) => /\.(mp3|wav|ogg|flac|aac|m4a|opus)$/i.test(name);
const isVideoFile  = (name: string) => /\.(mp4|webm|mkv|mov|avi|m4v)$/i.test(name);

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

// ── File row with image fallback ─────────────────────────────────────────────

type FileRowProps = {
  f: MediaFile; filename: string;
  isImg: boolean; isAud: boolean; isVid: boolean;
  onPreview: () => void; onCopy: () => void; onDelete: () => void;
};

const FileRow = ({ f, filename, isImg, isAud, isVid, onPreview, onCopy, onDelete }: FileRowProps) => {
  const [thumbErr, setThumbErr] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  return (
    <div onClick={onPreview}
      className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors group cursor-pointer">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {isImg && !thumbErr ? (
          <img src={f.public_url} alt={filename}
            className="w-10 h-10 rounded-lg object-cover border border-zinc-700 shrink-0 transition-opacity duration-300"
            style={{ opacity: thumbLoaded ? 1 : 0 }}
            onLoad={() => setThumbLoaded(true)}
            onError={() => setThumbErr(true)} />
        ) : isAud ? (
          <span className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <FileAudio size={18} className="text-zinc-400" />
          </span>
        ) : isVid ? (
          <span className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <FileVideo size={18} className="text-zinc-400" />
          </span>
        ) : (
          <span className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <FileIcon2 size={18} className="text-zinc-400" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{filename}</p>
          <p className="text-xs text-zinc-500">{fmtSize(f.size)} · {f.last_modified.slice(0, 10)}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onCopy(); }}
          className="p-1.5 text-zinc-500 hover:text-white transition-colors" title="Copiar URL">
          <Copy size={15} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors" title="Excluir">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

// ── File Preview Modal ────────────────────────────────────────────────────────

const FilePreviewModal = ({ file, onClose }: { file: MediaFile; onClose: () => void }) => {
  const filename = file.key.split("/").pop()!;
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{filename}</p>
            <p className="text-xs text-zinc-500">{fmtSize(file.size)} · {file.last_modified.slice(0, 10)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-3">
            <a href={file.public_url} target="_blank" rel="noopener noreferrer"
              className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800" title="Abrir em nova aba">
              <ExternalLink size={15} />
            </a>
            <button onClick={() => { navigator.clipboard.writeText(file.public_url); toast.success("URL copiada!"); }}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800" title="Copiar URL">
              <Copy size={15} />
            </button>
            <button onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex items-center justify-center bg-zinc-950 min-h-[300px] max-h-[520px]">
          {isImageFile(filename) ? (
            imgError ? (
              <div className="flex flex-col items-center gap-3 p-10 text-zinc-500">
                <FileIcon2 size={48} className="opacity-40" />
                <p className="text-sm text-center">Não foi possível carregar a imagem.</p>
                <p className="text-xs text-zinc-600 font-mono break-all max-w-xs text-center">{file.public_url}</p>
                <a href={file.public_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[var(--primary-contrast-light)] hover:underline flex items-center gap-1">
                  <ExternalLink size={12} /> Tentar abrir diretamente
                </a>
              </div>
            ) : (
              <img
                src={file.public_url}
                alt={filename}
                className="max-w-full max-h-[520px] object-contain transition-opacity duration-500"
                style={{ opacity: imgLoaded ? 1 : 0 }}
                onLoad={() => setImgLoaded(true)}
                onError={() => { setImgError(true); toast.error("Não foi possível carregar a imagem. Verifique se o bucket tem acesso público ativado."); }}
              />
            )
          ) : isAudioFile(filename) ? (
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FileAudio size={36} className="text-[var(--primary-contrast-light)]" />
              </div>
              <p className="text-sm text-zinc-400">{filename}</p>
              <audio controls src={file.public_url} className="w-full max-w-sm" />
            </div>
          ) : isVideoFile(filename) ? (
            <video controls src={file.public_url} className="max-w-full max-h-[520px]" />
          ) : (
            <div className="flex flex-col items-center gap-3 p-10 text-zinc-500">
              <FileIcon2 size={48} className="opacity-40" />
              <p className="text-sm">Pré-visualização não disponível para este tipo de arquivo.</p>
              <a href={file.public_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[var(--primary-contrast-light)] hover:underline flex items-center gap-1">
                <ExternalLink size={12} /> Abrir arquivo
              </a>
            </div>
          )}
        </div>

        {/* URL bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800 bg-zinc-900/60">
          <code className="text-xs text-zinc-400 flex-1 truncate font-mono">{file.public_url}</code>
          <button onClick={() => navigator.clipboard.writeText(file.public_url)}
            className="shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
            <Copy size={11} /> Copiar
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modals ────────────────────────────────────────────────────────────────────

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
        <button onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
          Cancelar
        </button>
        <button onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 transition-colors font-medium">
          Excluir
        </button>
      </div>
    </div>
  </div>
);

const ConfirmBucketModal = ({
  bucket,
  onConfirm,
  onCancel,
}: {
  bucket: Bucket;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);
  const valid = typed === bucket.name && checked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-full bg-red-500/10 text-red-400"><AlertTriangle size={20} /></span>
          <h3 className="text-base font-semibold text-white">Excluir bucket</h3>
        </div>

        <p className="text-sm text-zinc-400">
          Esta ação é <span className="text-red-400 font-medium">irreversível</span>. O bucket e todos os seus arquivos serão permanentemente removidos da Cloudflare.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500">
            Digite <span className="text-white font-semibold">{bucket.name}</span> para confirmar
          </label>
          <input
            autoFocus
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={bucket.name}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/60 transition-colors"
          />
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="mt-0.5 accent-red-500 w-4 h-4 shrink-0"
          />
          <span className="text-xs text-zinc-400 leading-relaxed">
            Entendo que <span className="text-white">todo o conteúdo dentro do bucket</span> — diretórios e arquivos — será excluído permanentemente junto com ele.
          </span>
        </label>

        <div className="flex gap-2 justify-end mt-1">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={!valid}
            className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed">
            Excluir bucket
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDirModal = ({
  dirname,
  onConfirm,
  onCancel,
}: {
  dirname: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="p-2 rounded-full bg-red-500/10 text-red-400"><Trash2 size={20} /></span>
        <h3 className="text-base font-semibold text-white">Excluir diretório</h3>
      </div>
      <p className="text-sm text-zinc-400">
        Tem certeza que deseja excluir o diretório <span className="text-white font-medium">"{dirname}"</span>? Esta ação não pode ser desfeita.
      </p>
      <div className="flex gap-2 justify-end mt-1">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Cancelar</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 transition-colors font-medium">Excluir</button>
      </div>
    </div>
  </div>
);

// ── Domain Settings Modal ─────────────────────────────────────────────────────

const STORAGE_DOMAIN = "sexdaily.app";
const canCustomize = (tier: string | null) => tier === "pro" || tier === "enterprise";

const BucketSettingsModal = ({
  bucket,
  onClose,
  onSaved,
}: {
  bucket: Bucket;
  onClose: () => void;
  onSaved: (updates: Partial<Bucket>) => void;
}) => {
  const axiosInstance = useAxios();
  const { user } = useAuthContext();
  const isPro = canCustomize(user?.tier ?? null);

  // O prefixo atual sem o sufixo ".5keepr.app"
  const currentPrefix = bucket.custom_domain?.endsWith("." + STORAGE_DOMAIN)
    ? bucket.custom_domain.slice(0, -(STORAGE_DOMAIN.length + 1))
    : "";

  const [prefix, setPrefix] = useState(currentPrefix);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const newDomain = prefix.trim() ? `${prefix.trim()}.${STORAGE_DOMAIN}` : "";
    setSaving(true);
    try {
      await axiosInstance.patch(`/bucket/${bucket.bucket_id}/domain`, { domain: newDomain });
      toast.success(newDomain ? "Subdomínio atualizado!" : "Subdomínio removido.");
      onSaved({ custom_domain: newDomain });
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Erro ao salvar.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const currentDomain = bucket.custom_domain || bucket.public_domain || "—";
  const isDefaultDomain = bucket.custom_domain?.endsWith("." + STORAGE_DOMAIN) && !isPro;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-full bg-zinc-800 text-zinc-300"><Settings size={18} /></span>
            <div>
              <h3 className="text-base font-semibold text-white">Configurações do Bucket</h3>
              <p className="text-xs text-zinc-500">{bucket.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={18} /></button>
        </div>

        {/* Domínio atual */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Globe size={14} /> Domínio público
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 rounded-xl border border-zinc-700">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${bucket.custom_domain || bucket.public_domain ? "bg-green-400" : "bg-zinc-600"}`} />
            <span className={`text-xs font-mono break-all ${bucket.custom_domain || bucket.public_domain ? "text-green-400" : "text-zinc-500"}`}>
              {currentDomain}
            </span>
          </div>
        </div>

        {/* Subdomínio personalizado (apenas pro/enterprise) */}
        {isPro ? (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Globe size={14} /> Subdomínio personalizado
            </label>
            <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden focus-within:border-zinc-500 transition-colors">
              <input
                type="text"
                placeholder="minha-org"
                value={prefix}
                onChange={e => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                onKeyDown={e => e.key === "Enter" && save()}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <span className="pr-4 text-sm text-zinc-500 select-none">.{STORAGE_DOMAIN}</span>
            </div>
            <p className="text-xs text-zinc-500">
              Seu bucket ficará acessível em <code className="text-zinc-300">{prefix || "prefixo"}.{STORAGE_DOMAIN}</code>
            </p>
          </div>
        ) : (
          !isDefaultDomain && (
            <div className="flex items-start gap-3 px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-xl">
              <span className="text-xs text-zinc-400 leading-relaxed">
                Subdomínios personalizados (<code className="text-zinc-300">orgname.{STORAGE_DOMAIN}</code>) estão disponíveis nos planos <span className="text-white font-medium">Pro</span> e <span className="text-white font-medium">Enterprise</span>.
              </span>
            </div>
          )
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Fechar</button>
          {isPro && (
            <button onClick={save} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm bg-[var(--primary-contrast)] text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-40 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const StorageTemplate = () => {
  const axiosInstance = useAxios();
  const axiosRef = useRef(axiosInstance);
  axiosRef.current = axiosInstance;

  const ROOT_DIR: Directory = { dir_id: "root", bucket_id: "", name: "Raiz", created_at: "" };
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [settingsBucket, setSettingsBucket] = useState<Bucket | null>(null);

  const [view, setView] = useState<View>("buckets");
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [dirs, setDirs] = useState<Directory[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState("");

  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [selectedDir, setSelectedDir] = useState<Directory | null>(null);

  const [loading, setLoading] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [newDirName, setNewDirName] = useState("");
  const [showNewBucket, setShowNewBucket] = useState(false);
  const [showNewDir, setShowNewDir] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverDirId, setDragOverDirId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // paginação
  const PAGE_LIMIT = 20;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);

  // modal state
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null);
  const [bucketToDelete, setBucketToDelete] = useState<Bucket | null>(null);
  const [dirToDelete, setDirToDelete] = useState<Directory | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBuckets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosRef.current.get("/bucket/");
      setBuckets(res.data ?? []);
    } catch {
      toast.error("Erro ao carregar buckets");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDirs = useCallback(async (bucket: Bucket) => {
    setLoading(true);
    try {
      const res = await axiosRef.current.get(`/bucket/${bucket.bucket_id}/dir`);
      setDirs(res.data ?? []);
    } catch {
      toast.error("Erro ao carregar diretórios");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFiles = useCallback(async (bucket: Bucket, dir: Directory, p = 1) => {
    setLoading(true);
    try {
      const res = await axiosRef.current.get(
        `/bucket/${bucket.bucket_id}/dir/${dir.dir_id}/files?page=${p}&limit=${PAGE_LIMIT}`
      );
      setFiles(res.data?.files ?? []);
      setTotalPages(res.data?.total_pages ?? 1);
      setTotalFiles(res.data?.total ?? 0);
      setPage(p);
    } catch {
      toast.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  }, [PAGE_LIMIT]);

  useEffect(() => { fetchBuckets(); }, [fetchBuckets]);

  // Polling: enquanto houver bucket pendente, recarrega a cada 3s
  useEffect(() => {
    const hasPending = buckets.some((b) => b.status === "pending");
    if (!hasPending) return;
    const id = setTimeout(() => fetchBuckets(), 3000);
    return () => clearTimeout(id);
  }, [buckets, fetchBuckets]);

  // ── Create ─────────────────────────────────────────────────────────────────

  const createBucket = async () => {
    if (!newBucketName.trim()) return;
    try {
      await axiosRef.current.post("/bucket/", { name: newBucketName.trim() });
      setNewBucketName("");
      setShowNewBucket(false);
      toast.success("Bucket criado! Provisionando...");
      fetchBuckets();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erro ao criar bucket");
    }
  };

  const createDir = async () => {
    if (!newDirName.trim() || !selectedBucket) return;
    try {
      await axiosRef.current.post(`/bucket/${selectedBucket.bucket_id}/dir`, { name: newDirName.trim() });
      setNewDirName("");
      setShowNewDir(false);
      toast.success("Diretório criado");
      fetchDirs(selectedBucket);
    } catch {
      toast.error("Erro ao criar diretório");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const confirmDeleteBucket = async () => {
    if (!bucketToDelete) return;
    const b = bucketToDelete;
    setBucketToDelete(null);
    try {
      await axiosRef.current.delete(`/bucket/${b.bucket_id}`);
      toast.success("Bucket removido");
      fetchBuckets();
    } catch {
      toast.error("Erro ao remover bucket");
    }
  };

  const deleteDir = async (d: Directory) => {
    if (!selectedBucket) return;
    try {
      await axiosRef.current.delete(`/bucket/${selectedBucket.bucket_id}/dir/${d.dir_id}`);
      setDirToDelete(null);
      toast.success("Diretório removido");
      fetchDirs(selectedBucket);
    } catch {
      toast.error("Erro ao remover diretório");
    }
  };

  const confirmDeleteFile = async () => {
    if (!selectedBucket || !selectedDir || !fileToDelete) return;
    const filename = fileToDelete.key.split("/").pop()!;
    setFileToDelete(null);
    try {
      await axiosRef.current.delete(
        `/bucket/${selectedBucket.bucket_id}/dir/${selectedDir.dir_id}/files/${filename}`
      );
      toast.success("Arquivo removido");
      fetchFiles(selectedBucket, selectedDir, page).then();
    } catch {
      toast.error("Erro ao remover arquivo");
    }
  };

  // ── Upload ─────────────────────────────────────────────────────────────────

  const uploadFilesToDir = async (fileList: FileList, bucket: Bucket, dir: Directory) => {
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(fileList)) {
      const form = new FormData();
      form.append("file", file);
      try {
        await axiosRef.current.post(
          `/bucket/${bucket.bucket_id}/dir/${dir.dir_id}/files`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        ok++;
      } catch {
        toast.error(`Erro ao enviar "${file.name}"`);
      }
    }
    setUploading(false);
    if (ok > 0) {
      toast.success(`${ok} arquivo(s) enviado(s)`);
      fetchFiles(bucket, dir, 1); // volta pra página 1 após upload
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    if (!selectedBucket || !selectedDir) return;
    await uploadFilesToDir(fileList, selectedBucket, selectedDir);
  };

  const handleDirDrop = async (e: React.DragEvent, dir: Directory) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDirId(null);
    if (!selectedBucket) return;
    openDir(dir);
    await uploadFilesToDir(e.dataTransfer.files, selectedBucket, dir);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const openBucket = (b: Bucket) => {
    if (b.status !== "active") { toast.error("Bucket ainda não está ativo"); return; }
    setSelectedBucket(b);
    setView("dirs");
    fetchDirs(b);
  };

  const openDir = (d: Directory) => {
    setSelectedDir(d);
    setView("files");
    fetchFiles(selectedBucket!, d);
  };


  // ── Status badge ───────────────────────────────────────────────────────────

  const statusBadge = (s: Bucket["status"]) => {
    const map = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${map[s]}`}>
        {s === "active" ? "Ativo" : s === "pending" ? "Provisionando..." : "Erro"}
      </span>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const breadcrumb = view === "buckets" ? undefined : (
    <>
      <button onClick={() => { setView("buckets"); setSelectedBucket(null); setSelectedDir(null); }}
        className="hover:text-white transition-colors">Buckets</button>
      {selectedBucket && (
        <>
          <ChevronRight size={12} />
          {selectedDir ? (
            <button onClick={() => { setView("dirs"); setSelectedDir(null); setFiles([]); }}
              className="hover:text-white transition-colors">{selectedBucket.name}</button>
          ) : (
            <span className="text-white">{selectedBucket.name}</span>
          )}
        </>
      )}
      {selectedDir && (
        <>
          <ChevronRight size={12} />
          <span className="text-white">{selectedDir.name}</span>
        </>
      )}
    </>
  );

  return (
    <>
    <div className="flex flex-col w-full h-full gap-4">
      <HeaderTemplate
        icon={<Database size={28} />}
        title="Storage"
        description="Gerencie seus buckets, diretórios e arquivos de mídia."
        breadcrumb={breadcrumb}
      />

      {/* ── Buckets ── */}
      {view === "buckets" && (
        <div className="flex flex-col gap-3 w-full">
          {/* New bucket form */}
          {showNewBucket ? (
            <div className="flex gap-2 items-center bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-zinc-500 transition-colors">
              <Database size={16} className="text-zinc-500 shrink-0" />
              <input
                autoFocus
                value={newBucketName}
                onChange={e => setNewBucketName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createBucket(); if (e.key === "Escape") { setShowNewBucket(false); setNewBucketName(""); } }}
                placeholder="Nome do bucket..."
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setShowNewBucket(false); setNewBucketName(""); }}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
                <button onClick={createBucket}
                  className="px-3 py-1.5 bg-[var(--primary-contrast)] text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
                  Criar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewBucket(true)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700/60 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-[var(--primary-contrast-opacity)] hover:border-[var(--primary-contrast-light)]/40 transition-all w-fit group">
              <Plus size={13} className="text-zinc-400 group-hover:text-white transition-all" />
              Novo Bucket
            </button>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
            </div>
          ) : buckets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
              <Database size={40} className="opacity-30" />
              <p>Nenhum bucket criado ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {buckets.map(b => (
                <div key={b.bucket_id}
                  className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3.5 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group">
                  <button onClick={() => openBucket(b)} className="flex items-center gap-4 flex-1 text-left min-w-0">
                    {/* Icon */}
                    <div className={`p-2 rounded-xl border shrink-0 ${b.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : b.status === "pending" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                      <Database size={16} />
                    </div>
                    {/* Name + domain */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{b.name}</p>
                        {statusBadge(b.status)}
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {b.custom_domain ? (
                          <span className="flex items-center gap-1">
                            <Globe size={9} className="text-emerald-400 shrink-0" />
                            <span className="text-emerald-400 truncate">{b.custom_domain}</span>
                          </span>
                        ) : (
                          <span className="font-mono">{b.r2_name}</span>
                        )}
                      </p>
                    </div>
                    {/* Bucket ID — always visible, muted */}
                    <span className="hidden md:block text-[10px] font-mono text-zinc-600 truncate max-w-40 shrink-0">
                      {b.bucket_id}
                    </span>
                  </button>
                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(b.bucket_id); toast.success("ID copiado!"); }}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-all" title="Copiar ID">
                      <Copy size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setSettingsBucket(b); }}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-all" title="Configurações">
                      <Settings size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setBucketToDelete(b); }}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Directories ── */}
      {view === "dirs" && (
        <div
          className="flex flex-col gap-3 w-full h-full"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); toast("Solte o arquivo em cima de um diretório", { icon: "📁" }); }}
        >
          {showNewDir ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newDirName}
                onChange={e => setNewDirName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createDir()}
                placeholder="Nome do diretório..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button onClick={createDir}
                className="px-4 py-2 bg-[var(--primary-contrast)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
                Criar
              </button>
              <button onClick={() => { setShowNewDir(false); setNewDirName(""); }}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm hover:bg-zinc-600 transition-colors">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setShowNewDir(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-all w-fit">
              <FolderPlus size={16} /> Novo Diretório
            </button>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Raiz sempre visível */}
              {[ROOT_DIR, ...dirs].map(d => {
                const isOver = dragOverDirId === d.dir_id;
                return (
                  <div
                    key={d.dir_id}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverDirId(d.dir_id); }}
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverDirId(null); }}
                    onDrop={e => handleDirDrop(e, d)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all group border ${
                      isOver
                        ? "bg-[var(--primary-contrast-opacity)] border-[var(--primary-contrast-light)] scale-[1.01]"
                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <button onClick={() => openDir(d)} className="flex items-center gap-3 flex-1 text-left">
                      <span className="text-xl">{isOver ? "📂" : d.dir_id === "root" ? "🗂️" : "📁"}</span>
                      <p className="text-sm font-medium text-white">{d.name}</p>
                      {d.dir_id === "root" && !isOver && <span className="text-xs text-zinc-600 ml-1">— arquivos sem diretório</span>}
                      {isOver && <span className="text-xs text-[var(--primary-contrast-light)] ml-2">Solte para enviar</span>}
                    </button>
                    {d.dir_id !== "root" && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDirToDelete(d)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Files ── */}
      {view === "files" && (
        <div className="flex flex-col gap-3 w-full h-full">

          {/* Drop zone */}
          <label
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
            onDrop={async e => { e.preventDefault(); setIsDragOver(false); await uploadFiles(e.dataTransfer.files); }}
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              isDragOver
                ? "border-[var(--primary-contrast-light)] bg-[var(--primary-contrast-opacity)] scale-[1.01]"
                : uploading
                ? "border-zinc-700 bg-zinc-900/30"
                : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 size={28} className="text-[var(--primary-contrast-light)] animate-spin" />
                <p className="text-sm text-zinc-400">Enviando...</p>
              </>
            ) : isDragOver ? (
              <>
                <Upload size={28} className="text-[var(--primary-contrast-light)]" />
                <p className="text-sm font-semibold text-white">Solte para enviar</p>
              </>
            ) : (
              <>
                <Upload size={28} className="text-zinc-600" />
                <p className="text-sm text-zinc-400">
                  Arraste arquivos aqui ou <span className="text-[var(--primary-contrast-light)]">clique para selecionar</span>
                </p>
                <p className="text-xs text-zinc-600">Imagens, vídeos, áudios e mais</p>
              </>
            )}
            <input type="file" multiple className="hidden"
              onChange={e => e.target.files && uploadFiles(e.target.files)} />
          </label>

          {/* Search */}
          {!loading && files.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-600 gap-1">
              <p className="text-sm">Nenhum arquivo neste diretório.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {files
                .filter(f => !search || f.key.split("/").pop()!.toLowerCase().includes(search.toLowerCase()))
                .map(f => {
                  const filename = f.key.split("/").pop()!;
                  const isImg = isImageFile(filename);
                  const isAud = isAudioFile(filename);
                  const isVid = isVideoFile(filename);
                  return (
                    <FileRow key={f.key} f={f} filename={filename} isImg={isImg} isAud={isAud} isVid={isVid}
                      onPreview={() => setPreviewFile(f)}
                      onCopy={() => { navigator.clipboard.writeText(f.public_url); toast.success("URL copiada!"); }}
                      onDelete={() => setFileToDelete(f)}
                    />
                  );
                })}
              {search && files.filter(f => f.key.split("/").pop()!.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-600 gap-1">
                  <p className="text-sm">Nenhum arquivo com esse nome.</p>
                </div>
              )}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-500">
                {totalFiles} arquivo{totalFiles !== 1 ? "s" : ""} · página {page} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchFiles(selectedBucket!, selectedDir!, page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-600">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => fetchFiles(selectedBucket!, selectedDir!, p as number)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                          page === p
                            ? "bg-[var(--primary-contrast-light)] text-white"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => fetchFiles(selectedBucket!, selectedDir!, page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* ── Modals ── */}
    {settingsBucket && (
      <BucketSettingsModal
        bucket={settingsBucket}
        onClose={() => setSettingsBucket(null)}
        onSaved={updates => setBuckets(prev => prev.map(b => b.bucket_id === settingsBucket!.bucket_id ? { ...b, ...updates } : b))}
      />
    )}
    {previewFile && (
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    )}
    {fileToDelete && (
      <ConfirmFileModal
        filename={fileToDelete.key.split("/").pop()!}
        onConfirm={confirmDeleteFile}
        onCancel={() => setFileToDelete(null)}
      />
    )}
    {bucketToDelete && (
      <ConfirmBucketModal
        bucket={bucketToDelete}
        onConfirm={confirmDeleteBucket}
        onCancel={() => setBucketToDelete(null)}
      />
    )}
    {dirToDelete && (
      <ConfirmDirModal
        dirname={dirToDelete.name}
        onConfirm={() => deleteDir(dirToDelete)}
        onCancel={() => setDirToDelete(null)}
      />
    )}
    </>
  );
};

export default StorageTemplate;
