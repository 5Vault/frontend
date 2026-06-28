import { useEffect, useState, useRef } from "react";
import { Key, Plus, Trash2, Eye, EyeOff, Globe, Database, ChevronDown, Check, X, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import HeaderTemplate from "../components/Header";

type BucketPerm = { bucket_id: string; permission: "read" | "readwrite" };

type ApiKey = {
  id: number;
  label: string;
  key: string;
  permission: "read" | "readwrite";
  all_buckets: boolean;
  bucket_perms: BucketPerm[] | null;
  created_at: string;
};

type Bucket = { bucket_id: string; name: string; status: string };

// ── Create Modal ──────────────────────────────────────────────────────────────

const CreateKeyModal = ({
  buckets,
  onClose,
  onCreated,
}: {
  buckets: Bucket[];
  onClose: () => void;
  onCreated: () => void;
}) => {
  const axiosInstance = useAxios();
  const axiosRef = useRef(axiosInstance);
  axiosRef.current = axiosInstance;

  const [label, setLabel] = useState("");
  const [defaultPerm, setDefaultPerm] = useState<"read" | "readwrite">("readwrite");
  const [allBuckets, setAllBuckets] = useState(true);
  const [bucketPerms, setBucketPerms] = useState<Record<string, "read" | "readwrite">>({});
  const [saving, setSaving] = useState(false);

  const toggleBucket = (id: string) => {
    setBucketPerms((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = defaultPerm;
      return next;
    });
  };

  const setBucketPerm = (id: string, perm: "read" | "readwrite") => {
    setBucketPerms((prev) => ({ ...prev, [id]: perm }));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        label,
        permission: defaultPerm,
        all_buckets: allBuckets,
      };
      if (!allBuckets) {
        payload.bucket_perms = Object.entries(bucketPerms).map(([bucket_id, permission]) => ({
          bucket_id,
          permission,
        }));
      }
      await axiosRef.current.post("/key/", payload);
      toast.success("Chave criada com sucesso!");
      onCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error || "Erro ao criar chave");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[var(--primary-contrast-opacity)] text-[var(--primary-contrast-light)]">
              <Key size={16} />
            </span>
            <h3 className="text-base font-semibold text-white">Nova Chave de API</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Label */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Label (opcional)</label>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ex: Servidor FiveM Principal"
            className="px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--primary-contrast-light)] transition-colors"
          />
        </div>

        {/* Default permission */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Permissão padrão</label>
          <div className="flex gap-2">
            {(["read", "readwrite"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setDefaultPerm(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  defaultPerm === p
                    ? "bg-[var(--primary-contrast-opacity)] border-[var(--primary-contrast-light)] text-[var(--primary-contrast-light)]"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {p === "read" ? "Somente Leitura" : "Leitura e Escrita"}
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400">Escopo de acesso</label>
          <div className="flex gap-2">
            <button
              onClick={() => setAllBuckets(true)}
              className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${
                allBuckets
                  ? "bg-[var(--primary-contrast-opacity)] border-[var(--primary-contrast-light)] text-[var(--primary-contrast-light)]"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              <Globe size={14} /> Todos os buckets
            </button>
            <button
              onClick={() => setAllBuckets(false)}
              className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${
                !allBuckets
                  ? "bg-[var(--primary-contrast-opacity)] border-[var(--primary-contrast-light)] text-[var(--primary-contrast-light)]"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              <Database size={14} /> Buckets específicos
            </button>
          </div>
        </div>

        {/* Per-bucket config */}
        {!allBuckets && (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {buckets.filter((b) => b.status === "active").length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Nenhum bucket ativo disponível.</p>
            ) : (
              buckets
                .filter((b) => b.status === "active")
                .map((b) => {
                  const selected = b.bucket_id in bucketPerms;
                  return (
                    <div
                      key={b.bucket_id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        selected ? "border-[var(--primary-contrast-light)]/40 bg-zinc-800" : "border-zinc-800 bg-zinc-900"
                      }`}
                    >
                      <button
                        onClick={() => toggleBucket(b.bucket_id)}
                        className="flex items-center gap-2.5 flex-1 text-left"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? "bg-[var(--primary-contrast)] border-[var(--primary-contrast)]" : "border-zinc-600"
                        }`}>
                          {selected && <Check size={10} className="text-white" />}
                        </div>
                        <span className="text-sm text-white">{b.name}</span>
                      </button>

                      {selected && (
                        <div className="flex gap-1 ml-3">
                          {(["read", "readwrite"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setBucketPerm(b.bucket_id, p)}
                              className={`text-[10px] px-2 py-1 rounded-md font-semibold uppercase transition-colors ${
                                bucketPerms[b.bucket_id] === p
                                  ? "bg-[var(--primary-contrast)] text-white"
                                  : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                              }`}
                            >
                              {p === "read" ? "Leitura" : "Escrita"}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || (!allBuckets && Object.keys(bucketPerms).length === 0)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[var(--primary-contrast)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Criando...</> : "Criar Chave"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmKeyModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="p-2 rounded-full bg-red-500/10 text-red-400"><AlertTriangle size={20} /></span>
        <h3 className="text-base font-semibold text-white">Excluir chave de API</h3>
      </div>
      <p className="text-sm text-zinc-400">
        Tem certeza que deseja excluir esta chave? Qualquer integração usando-a deixará de funcionar imediatamente.
      </p>
      <div className="flex gap-2 justify-end mt-1">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Cancelar</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 transition-colors font-medium">Excluir</button>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const ApiKeysTemplate = () => {
  const axiosInstance = useAxios();
  const axiosRef = useRef(axiosInstance);
  axiosRef.current = axiosInstance;

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [expandedKey, setExpandedKey] = useState<number | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<number | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [keysRes, bucketsRes] = await Promise.all([
        axiosRef.current.get("/key/"),
        axiosRef.current.get("/bucket/"),
      ]);
      setKeys(keysRes.data ?? []);
      setBuckets(bucketsRes.data ?? []);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await axiosRef.current.delete(`/key/${id}`);
      setKeyToDelete(null);
      toast.success("Chave removida.");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      toast.error("Erro ao remover chave.");
    }
  };

  const toggleVisibility = (id: number) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const maskKey = (k: string) => k.slice(0, 8) + "•".repeat(16) + k.slice(-4);

  const permBadge = (p: string) =>
    p === "read" ? (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-semibold uppercase tracking-wide">
        Leitura
      </span>
    ) : (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-contrast-opacity)] text-[var(--primary-contrast-light)] border border-[var(--primary-contrast-light)]/25 font-semibold uppercase tracking-wide">
        Leitura e Escrita
      </span>
    );

  const bucketName = (id: string) => buckets.find((b) => b.bucket_id === id)?.name ?? id;

  return (
    <div className="flex flex-col w-full h-full gap-4 overflow-y-auto pr-1">
      <HeaderTemplate
        icon={<Key size={22} />}
        title="Chaves de API"
        description="Autentique requisições ao 5Vault. Não compartilhe suas chaves."
        content={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] text-[var(--primary-contrast-light)] hover:bg-[var(--primary-contrast-light)] hover:text-white transition-colors"
          >
            <Plus size={14} /> Nova Chave
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
          <Key size={40} className="opacity-30" />
          <p className="text-sm">Nenhuma chave criada ainda.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm text-[var(--primary-contrast-light)] hover:underline"
          >
            Criar primeira chave
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((k) => (
            <div key={k.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-white">{k.label || "Sem label"}</span>
                    {permBadge(k.permission)}
                    {k.all_buckets ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-contrast-opacity)] text-[var(--primary-contrast-light)] border border-[var(--primary-contrast-light)]/30 font-medium flex items-center gap-1">
                        <Globe size={9} /> Todos os buckets
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700 font-medium flex items-center gap-1">
                        <Database size={9} /> {(k.bucket_perms ?? []).length} bucket(s)
                      </span>
                    )}
                  </div>
                  <code className="text-xs text-zinc-400 font-mono">
                    {visibleKeys.has(k.id) ? k.key : maskKey(k.key)}
                  </code>
                  <span className="text-[10px] text-zinc-600 ml-3">{k.created_at?.slice(0, 10)}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!k.all_buckets && (k.bucket_perms ?? []).length > 0 && (
                    <button
                      onClick={() => setExpandedKey(expandedKey === k.id ? null : k.id)}
                      className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                      title="Ver buckets"
                    >
                      <ChevronDown size={14} className={`transition-transform ${expandedKey === k.id ? "rotate-180" : ""}`} />
                    </button>
                  )}
                  <button onClick={() => toggleVisibility(k.id)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                    {visibleKeys.has(k.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => setKeyToDelete(k.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Bucket perms expanded */}
              {expandedKey === k.id && !k.all_buckets && (
                <div className="border-t border-zinc-800 px-4 py-3 flex flex-wrap gap-2">
                  {(k.bucket_perms ?? []).map((bp) => (
                    <div key={bp.bucket_id} className="flex items-center gap-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5">
                      <Database size={11} className="text-zinc-500" />
                      <span className="text-zinc-300">{bucketName(bp.bucket_id)}</span>
                      <span className="text-zinc-600">·</span>
                      {permBadge(bp.permission)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateKeyModal
          buckets={buckets}
          onClose={() => setShowCreate(false)}
          onCreated={fetchAll}
        />
      )}

      {keyToDelete !== null && (
        <ConfirmKeyModal
          onConfirm={() => handleDelete(keyToDelete)}
          onCancel={() => setKeyToDelete(null)}
        />
      )}
    </div>
  );
};

export default ApiKeysTemplate;
