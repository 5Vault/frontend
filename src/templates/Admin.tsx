import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Database, Activity, TrendingUp, Search, ChevronLeft,
  ChevronRight, Trash2, Shield, ShieldOff, Crown, RefreshCw,
  ArrowLeft, AlertTriangle, X, ServerCrash, BarChart3,
  UserCheck, Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAdminStats, listAdminUsers, setUserTier, setUserRole, deleteUser,
  type AdminUser, type AdminStats,
} from "../api/admin";
import useUserContext from "../hooks/useUserContext";

// ─── helpers ──────────────────────────────────────────────────────────────────

const TIERS = ["free", "basic", "pro"];
const TIER_COLORS: Record<string, string> = {
  free: "text-zinc-400 bg-zinc-800 border-zinc-700",
  basic: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  pro: "text-[var(--primary-contrast-light)] bg-[var(--primary-contrast-opacity)] border-[var(--primary-contrast-light)]/30",
};
const ROLE_COLORS: Record<string, string> = {
  user: "text-zinc-400 bg-zinc-800 border-zinc-700",
  admin: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};
const PROVIDER_COLORS: Record<string, string> = {
  google: "text-sky-400",
  local: "text-zinc-500",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${className}`}>
      {label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, accent = false,
}: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${accent ? "border-[var(--primary-contrast-light)]/30 bg-[var(--primary-contrast-opacity)]" : "border-zinc-800 bg-zinc-900/60"}`}>
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">{label}</span>
        <span className={accent ? "text-[var(--primary-contrast-light)]" : "text-zinc-600"}>{icon}</span>
      </div>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title, description, confirmLabel, danger, onConfirm, onClose,
}: {
  title: string; description: string; confirmLabel: string;
  danger?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
            <AlertTriangle size={20} />
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors" style={{ background: "none", border: "none", padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        <div>
          <h3 className="font-bold text-white text-base mb-1">{title}</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-sm font-medium transition-colors" style={{ background: "transparent" }}>
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User row actions ─────────────────────────────────────────────────────────

function UserActions({
  user, onRefresh,
}: { user: AdminUser; onRefresh: () => void }) {
  const [confirm, setConfirm] = useState<null | "delete" | "promote" | "demote">(null);
  const [loading, setLoading] = useState(false);

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    setLoading(true);
    try {
      await fn();
      toast.success(msg);
      onRefresh();
    } catch {
      toast.error("Operação falhou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end">
        {/* Tier quick-set */}
        <select
          value={user.tier}
          disabled={loading}
          onChange={(e) => act(() => setUserTier(user.user_id, e.target.value), "Tier atualizado")}
          className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1.5 cursor-pointer hover:border-zinc-600 transition-colors disabled:opacity-50"
        >
          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Toggle role */}
        <button
          title={user.role === "admin" ? "Remover admin" : "Tornar admin"}
          disabled={loading}
          onClick={() => setConfirm(user.role === "admin" ? "demote" : "promote")}
          className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 ${user.role === "admin" ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10" : "border-zinc-800 text-zinc-600 hover:text-amber-400 hover:border-amber-500/30"}`}
          style={{ background: "transparent" }}
        >
          {user.role === "admin" ? <ShieldOff size={14} /> : <Shield size={14} />}
        </button>

        {/* Delete */}
        <button
          title="Excluir usuário"
          disabled={loading}
          onClick={() => setConfirm("delete")}
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-rose-400 hover:border-rose-500/30 transition-colors disabled:opacity-50"
          style={{ background: "transparent" }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {confirm === "delete" && (
        <ConfirmModal
          danger
          title="Excluir usuário"
          description={`Tem certeza que deseja excluir permanentemente "${user.username}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={() => act(() => deleteUser(user.user_id), "Usuário excluído")}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === "promote" && (
        <ConfirmModal
          title="Tornar administrador"
          description={`"${user.username}" terá acesso total ao painel admin.`}
          confirmLabel="Confirmar"
          onConfirm={() => act(() => setUserRole(user.user_id, "admin"), "Usuário promovido a admin")}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === "demote" && (
        <ConfirmModal
          danger
          title="Remover admin"
          description={`"${user.username}" perderá o acesso ao painel admin.`}
          confirmLabel="Remover"
          onConfirm={() => act(() => setUserRole(user.user_id, "user"), "Permissão removida")}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const LIMIT = 15;

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await listAdminUsers(page, LIMIT, search, tierFilter);
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoadingUsers(false);
    }
  }, [page, search, tierFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.ceil(total / LIMIT);

  // Guard: non-admins see a 403 state (server also rejects the API calls)
  if (user && (user as any).role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0d0d0e] flex flex-col items-center justify-center gap-5 text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <ServerCrash size={26} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Acesso negado</h2>
          <p className="text-zinc-500 text-sm">Você não tem permissão para acessar esta área.</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-sm font-medium transition-colors" style={{ background: "transparent" }}>
          <ArrowLeft size={15} /> Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-zinc-900 bg-[#0d0d0e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-zinc-600 hover:text-white transition-colors" style={{ background: "none", border: "none", padding: 0 }}>
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/30 flex items-center justify-center">
                <Crown size={14} className="text-[var(--primary-contrast-light)]" />
              </div>
              <span className="font-bold text-sm">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={() => { fetchStats(); fetchUsers(); }}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <RefreshCw size={13} /> Atualizar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col gap-8">

        {/* ── Stats ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-zinc-500" />
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Visão geral</h2>
          </div>
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 h-28 animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users size={16} />} label="Total de usuários" value={stats.total_users} accent />
              <StatCard icon={<TrendingUp size={16} />} label="Novos este mês" value={stats.new_users_month} sub="Cadastros recentes" />
              <StatCard icon={<Database size={16} />} label="Storages ativos" value={stats.active_storages} sub={`${stats.pending_storages} pendentes`} />
              <StatCard icon={<Activity size={16} />} label="Total de storages" value={stats.total_storages} />
            </div>
          ) : null}

          {/* Tier breakdown */}
          {stats && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {TIERS.map((t) => (
                <div key={t} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-zinc-600" />
                    <span className="text-xs font-medium text-zinc-400 capitalize">{t}</span>
                  </div>
                  <span className="font-bold text-white">{stats.users_by_tier?.[t] ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Users table ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-zinc-500" />
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Usuários {total > 0 && <span className="text-zinc-600">({total})</span>}
              </h2>
            </div>

            <div className="flex gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar usuário..."
                  className="pl-8 pr-3 py-2 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl placeholder-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors w-48"
                />
              </div>

              {/* Tier filter */}
              <select
                value={tierFilter}
                onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
                className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 cursor-pointer hover:border-zinc-600 transition-colors"
              >
                <option value="">Todos os tiers</option>
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_80px_72px_80px_160px] gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-900/80">
              {["Usuário", "Email", "Tier", "Role", "Provider", "Ações"].map((h) => (
                <span key={h} className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest last:text-right">{h}</span>
              ))}
            </div>

            {/* Rows */}
            {loadingUsers ? (
              <div className="flex flex-col">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 border-b border-zinc-800/50 bg-zinc-900/20 animate-pulse" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
                <Search size={28} />
                <p className="text-sm">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {users.map((u, i) => (
                  <div
                    key={u.user_id}
                    className={`grid grid-cols-[1fr_1fr_80px_72px_80px_160px] gap-4 px-5 py-3.5 items-center border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors ${i === users.length - 1 ? "border-b-0" : ""}`}
                  >
                    {/* User info */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{u.username}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-zinc-500 truncate">{u.name}</p>
                        {u.role === "admin" && <Crown size={10} className="text-amber-400 shrink-0" />}
                      </div>
                    </div>

                    {/* Email */}
                    <p className="text-xs text-zinc-400 truncate">{u.email}</p>

                    {/* Tier */}
                    <Badge label={u.tier} className={TIER_COLORS[u.tier] ?? TIER_COLORS.free} />

                    {/* Role */}
                    <Badge label={u.role} className={ROLE_COLORS[u.role] ?? ROLE_COLORS.user} />

                    {/* Provider */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium ${PROVIDER_COLORS[u.auth_provider] ?? "text-zinc-500"}`}>
                        {u.auth_provider}
                      </span>
                    </div>

                    {/* Actions */}
                    <UserActions user={u} onRefresh={fetchUsers} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-zinc-600">
                Página {page} de {totalPages} · {total} usuários
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 disabled:opacity-30 transition-colors"
                  style={{ background: "transparent" }}
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${page === p ? "border-[var(--primary-contrast-light)]/50 bg-[var(--primary-contrast-opacity)] text-[var(--primary-contrast-light)]" : "border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"}`}
                      style={{ background: page === p ? undefined : "transparent" }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 disabled:opacity-30 transition-colors"
                  style={{ background: "transparent" }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <footer className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-700">
          <span>5Vault Admin Panel</span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} /> {new Date().toLocaleString("pt-BR")}
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Admin;
