import { useEffect, useState, useCallback, useRef } from "react";
import { Database, FolderPlus, Trash2, ChevronRight, Upload, Plus, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import HeaderTemplate from "../components/Header";
import type { Bucket, Directory, MediaFile } from "../@types/Storage";

type View = "buckets" | "dirs" | "files";

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

// ── Component ─────────────────────────────────────────────────────────────────

const StorageTemplate = () => {
  const axiosInstance = useAxios();
  const axiosRef = useRef(axiosInstance);
  axiosRef.current = axiosInstance;

  const [view, setView] = useState<View>("buckets");
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [dirs, setDirs] = useState<Directory[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);

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

  const fetchFiles = useCallback(async (bucket: Bucket, dir: Directory) => {
    setLoading(true);
    try {
      const res = await axiosRef.current.get(`/bucket/${bucket.bucket_id}/dir/${dir.dir_id}/files`);
      setFiles(res.data?.files ?? []);
    } catch {
      toast.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  }, []);

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
    const f = fileToDelete;
    const filename = f.key.split("/").pop()!;
    setFileToDelete(null);
    try {
      await axiosRef.current.delete(
        `/bucket/${selectedBucket.bucket_id}/dir/${selectedDir.dir_id}/files/${filename}`
      );
      toast.success("Arquivo removido");
      fetchFiles(selectedBucket, selectedDir);
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
      fetchFiles(bucket, dir);
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

  const goBack = () => {
    if (view === "files") { setView("dirs"); setSelectedDir(null); setFiles([]); }
    else if (view === "dirs") { setView("buckets"); setSelectedBucket(null); setDirs([]); }
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

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
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
            <div className="flex gap-2">
              <input
                autoFocus
                value={newBucketName}
                onChange={e => setNewBucketName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createBucket()}
                placeholder="Nome do bucket..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button onClick={createBucket}
                className="px-4 py-2 bg-[var(--primary-contrast)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
                Criar
              </button>
              <button onClick={() => { setShowNewBucket(false); setNewBucketName(""); }}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm hover:bg-zinc-600 transition-colors">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setShowNewBucket(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-all w-fit">
              <Plus size={16} /> Novo Bucket
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
                  className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors group">
                  <button onClick={() => openBucket(b)}
                    className="flex items-center gap-3 flex-1 text-left">
                    <Database size={20} className="text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{b.name}</p>
                      <p className="text-xs text-zinc-500">{b.r2_name}</p>
                    </div>
                    <div className="ml-3">{statusBadge(b.status)}</div>
                  </button>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setBucketToDelete(b)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
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
          ) : dirs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
              <FolderPlus size={40} className="opacity-30" />
              <p>Nenhum diretório neste bucket</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dirs.map(d => {
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
                      <span className="text-xl">{isOver ? "📂" : "📁"}</span>
                      <p className="text-sm font-medium text-white">{d.name}</p>
                      {isOver && <span className="text-xs text-[var(--primary-contrast-light)] ml-2">Solte para enviar</span>}
                    </button>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setDirToDelete(d)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Files ── */}
      {view === "files" && (
        <div
          className={`flex flex-col gap-3 w-full h-full relative transition-all ${
            isDragOver ? "outline outline-2 outline-dashed outline-[var(--primary-contrast)] rounded-xl" : ""
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
          onDrop={async e => { e.preventDefault(); setIsDragOver(false); await uploadFiles(e.dataTransfer.files); }}
        >
          {isDragOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-10 rounded-xl">
              <Upload size={48} className="text-[var(--primary-contrast)] mb-2" />
              <p className="text-lg font-semibold text-white">Solte para enviar</p>
            </div>
          )}

          {/* Upload button */}
          <label className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-all w-fit cursor-pointer">
            <Upload size={16} />
            {uploading ? "Enviando..." : "Enviar arquivos"}
            <input type="file" multiple accept="image/*,audio/*,video/*" className="hidden"
              onChange={e => e.target.files && uploadFiles(e.target.files)} />
          </label>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-2">
              <Upload size={40} className="opacity-30" />
              <p>Nenhum arquivo. Arraste ou clique em "Enviar arquivos".</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {files.map(f => {
                const filename = f.key.split("/").pop()!;
                return (
                  <div key={f.key}
                    className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xl shrink-0">🖼️</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{filename}</p>
                        <p className="text-xs text-zinc-500">{fmtSize(f.size)} · {f.last_modified.slice(0, 10)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setFileToDelete(f)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>

    {/* ── Modals ── */}
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
