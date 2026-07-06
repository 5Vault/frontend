import { useCallback, useEffect, useState } from "react";
import { ArchiveRestore, Calendar, FileArchive, HardDrive } from "lucide-react";
import useAxios from "../utils/axiosConfig";
import HeaderTemplate from "../components/Header";

interface BackupSession {
  session_id: string;
  date: string;
  path_prefix: string;
  file_count: number;
  total_size: number;
  created_at: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const BackupTemplate = () => {
  const axiosInstance = useAxios();
  const [sessions, setSessions] = useState<BackupSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const limit = 20;

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (dateFilter) params.date = dateFilter;
      const res = await axiosInstance.get<{ sessions: BackupSession[]; total: number }>("/backup/sessions", { params });
      setSessions(res.data.sessions ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [axiosInstance, page, dateFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <HeaderTemplate
        icon={<ArchiveRestore size={38} />}
        title="Backups"
        description="Histórico de backups automáticos enviados pelo script Lua"
      />

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="date"
            value={dateFilter}
            onChange={handleDateChange}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
          />
        </div>
        {dateFilter && (
          <button
            onClick={() => { setDateFilter(""); setPage(1); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700"
          >
            Limpar filtro
          </button>
        )}
        <span className="ml-auto text-xs text-zinc-600">{total} sessão{total !== 1 ? "ões" : ""} encontrada{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-[var(--primary-contrast)] rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-600">
            <FileArchive size={36} className="opacity-40" />
            <p className="text-sm">Nenhum backup encontrado</p>
            {dateFilter && <p className="text-xs">Tente remover o filtro de data</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <div
                key={s.session_id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all"
              >
                {/* Icon */}
                <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 shrink-0">
                  <HardDrive size={15} className="text-zinc-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-white font-mono">{s.path_prefix}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{s.file_count} arquivo{s.file_count !== 1 ? "s" : ""}</span>
                    <span className="text-zinc-700">·</span>
                    <span>{formatBytes(s.total_size)}</span>
                    <span className="text-zinc-700">·</span>
                    <span>{s.created_at}</span>
                  </div>
                </div>

                {/* Date badge */}
                <span className="shrink-0 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-400 font-mono">
                  {s.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="text-xs text-zinc-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default BackupTemplate;
