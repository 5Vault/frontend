import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Database, Activity, TrendingUp, Search, ChevronLeft,
  ChevronRight, Trash2, Shield, ShieldOff, Crown, RefreshCw,
  ArrowLeft, AlertTriangle, X, ServerCrash, BarChart3,
  UserCheck, Clock, Eye, MessageSquare, CreditCard, FileText,
  HardDrive, Send, CheckCircle, Loader2, Wifi,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAdminStats, listAdminUsers, setUserTier, setUserRole, deleteUser,
  type AdminUser, type AdminStats,
} from "../api/admin";
import useUserContext from "../hooks/useUserContext";
import useAxios from "../utils/axiosConfig";
import { useTicketWS } from "../hooks/useTicketWS";

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

// ─── Types for new sections ───────────────────────────────────────────────────

type Payment = {
  payment_id: string;
  user_id: string;
  stripe_id: string;
  tier_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

type ActionLog = {
  log_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip: string;
  created_at: string;
};

type AdminBucket = {
  bucket_id: string;
  name: string;
  r2_name: string;
  public_domain: string;
  custom_domain: string;
  status: string;
  created_at: string;
};

type TicketStatus = "open" | "in_progress" | "closed";

type AdminTicket = {
  ticket_id: string;
  user_id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
};

type TicketMessage = {
  message_id: string;
  ticket_id: string;
  sender_id: string;
  role: "user" | "admin";
  content: string;
  created_at: string;
};

const ticketStatusConfig: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: "Aberto", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  in_progress: { label: "Em andamento", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  closed: { label: "Encerrado", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
};

function TicketBadge({ status }: { status: TicketStatus }) {
  const cfg = ticketStatusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────

function UserDetailPanel({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const axiosInstance = useAxios();
  const [tab, setTab] = useState<"payments" | "logs" | "buckets">("payments");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [buckets, setBuckets] = useState<AdminBucket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTab = useCallback(async (t: "payments" | "logs" | "buckets") => {
    setLoading(true);
    try {
      if (t === "payments") {
        const r = await axiosInstance.get<{ payments: Payment[] }>(`/admin/users/${user.user_id}/payments`);
        setPayments(r.data.payments ?? []);
      } else if (t === "logs") {
        const r = await axiosInstance.get<{ logs: ActionLog[] }>(`/admin/users/${user.user_id}/logs`);
        setLogs(r.data.logs ?? []);
      } else {
        const r = await axiosInstance.get<{ buckets: AdminBucket[] }>(`/admin/users/${user.user_id}/buckets`);
        setBuckets(r.data.buckets ?? []);
      }
    } catch {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [user.user_id]);

  useEffect(() => { fetchTab(tab); }, [tab]);

  const tabs = [
    { key: "payments" as const, label: "Pagamentos", icon: <CreditCard size={13} /> },
    { key: "logs" as const, label: "Action Logs", icon: <FileText size={13} /> },
    { key: "buckets" as const, label: "Buckets", icon: <HardDrive size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div>
            <p className="text-sm font-semibold text-white">{user.username}</p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" style={{ background: "none", border: "none" }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 px-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${tab === t.key ? "border-[var(--primary-contrast)] text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
              style={{ background: "none" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-zinc-600">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : tab === "payments" ? (
            payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-600">
                <CreditCard size={28} className="opacity-30" />
                <p className="text-sm">Nenhum pagamento registrado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {payments.map(p => (
                  <div key={p.payment_id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white capitalize">{p.tier_id}</p>
                      <p className="text-xs text-zinc-500 font-mono truncate">{p.stripe_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        {(p.amount_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: p.currency.toUpperCase() })}
                      </p>
                      <p className="text-xs text-zinc-600">{new Date(p.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === "logs" ? (
            logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-600">
                <FileText size={28} className="opacity-30" />
                <p className="text-sm">Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {logs.map(l => (
                  <div key={l.log_id} className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-2.5 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-300 font-mono">{l.action}</p>
                      {l.entity_type && <p className="text-xs text-zinc-600">{l.entity_type} {l.entity_id}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-zinc-600">{l.ip || "—"}</p>
                      <p className="text-xs text-zinc-700">{new Date(l.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            buckets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-600">
                <HardDrive size={28} className="opacity-30" />
                <p className="text-sm">Nenhum bucket encontrado</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {buckets.map(b => (
                  <div key={b.bucket_id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${b.status === "active" ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-zinc-500 bg-zinc-800 border-zinc-700"}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono truncate">{b.custom_domain || b.public_domain || b.r2_name}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Tickets Section ────────────────────────────────────────────────────

function TicketsSection() {
  const axiosInstance = useAxios();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"" | TicketStatus>("");
  const [selected, setSelected] = useState<AdminTicket | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("open");
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [closing, setClosing] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const sending = false;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get<{ tickets: AdminTicket[] }>("/admin/tickets", { params: { status: statusFilter || undefined } });
      setTickets(r.data.tickets ?? []);
    } catch {
      toast.error("Erro ao carregar tickets.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openTicket = async (t: AdminTicket) => {
    seenIds.current = new Set();
    setSelected(t);
    setSelectedStatus(t.status);
    setMessages([]);
    setMsgLoading(true);
    try {
      const r = await axiosInstance.get<{ ticket: AdminTicket; messages: TicketMessage[] }>(`/admin/tickets/${t.ticket_id}`);
      const msgs = r.data.messages ?? [];
      msgs.forEach(m => seenIds.current.add(m.message_id));
      setMessages(msgs);
      setSelectedStatus(r.data.ticket?.status ?? t.status);
    } catch {
      toast.error("Erro ao carregar mensagens.");
    } finally {
      setMsgLoading(false);
    }
  };

  // WebSocket for real-time on the selected ticket.
  const { incoming, send: wsSend } = useTicketWS({
    ticketId: selected?.ticket_id ?? "",
    enabled: !!selected && selectedStatus !== "closed",
  });

  useEffect(() => {
    if (!incoming) return;
    if (seenIds.current.has(incoming.message_id)) return;
    seenIds.current.add(incoming.message_id);
    setMessages(prev => [...prev, incoming as TicketMessage]);
    if (incoming.role === "user" && selectedStatus === "open") setSelectedStatus("in_progress");
  }, [incoming]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    const sent = wsSend(reply.trim());
    if (sent) {
      setReply("");
      if (selectedStatus === "open") {
        setSelectedStatus("in_progress");
        setTickets(prev => prev.map(t => t.ticket_id === selected.ticket_id ? { ...t, status: "in_progress" } : t));
      }
    } else {
      toast.error("Conexão perdida. Tente novamente.");
    }
  };

  const closeTicket = async () => {
    if (!selected) return;
    setClosing(true);
    try {
      await axiosInstance.patch(`/admin/tickets/${selected.ticket_id}/close`);
      toast.success("Ticket encerrado.");
      setSelectedStatus("closed");
      setTickets(prev => prev.map(t => t.ticket_id === selected.ticket_id ? { ...t, status: "closed" } : t));
    } catch {
      toast.error("Erro ao encerrar ticket.");
    } finally {
      setClosing(false);
    }
  };

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelected(null); setMessages([]); }} className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1" style={{ background: "none", border: "none" }}>
            ← Voltar
          </button>
          <div className="h-4 w-px bg-zinc-700" />
          <TicketBadge status={selectedStatus} />
          {selectedStatus !== "closed" && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <Wifi size={10} className="animate-pulse" /> Ao vivo
            </span>
          )}
          <p className="text-sm font-semibold text-white flex-1 truncate">{selected.subject}</p>
          {selectedStatus !== "closed" && (
            <button onClick={closeTicket} disabled={closing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-40"
              style={{ background: "transparent" }}>
              {closing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
              Encerrar
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col overflow-hidden">
          {msgLoading ? (
            <div className="flex items-center justify-center py-12 text-zinc-600"><Loader2 size={20} className="animate-spin" /></div>
          ) : (
            <div className="flex flex-col divide-y divide-zinc-800/50 max-h-[480px] overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.message_id} className={`p-4 flex flex-col gap-1 ${msg.role === "admin" ? "bg-zinc-800/30" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${msg.role === "admin" ? "text-[var(--primary-contrast-light)]" : "text-zinc-300"}`}>
                      {msg.role === "admin" ? "Suporte (você)" : "Usuário"}
                    </span>
                    <span className="text-xs text-zinc-600">{new Date(msg.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {selectedStatus !== "closed" && (
            <form onSubmit={sendReply} className="border-t border-zinc-800 p-4 flex gap-3 items-end">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Responder como suporte..."
                rows={2}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(e as unknown as React.FormEvent); } }}
              />
              <button type="submit" disabled={!reply.trim()}
                className="p-2.5 rounded-xl bg-[var(--primary-contrast)] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ border: "none" }}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-zinc-500" />
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Tickets {tickets.length > 0 && <span className="text-zinc-600">({tickets.length})</span>}
          </h2>
        </div>
        <div className="flex gap-2 items-center">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as "" | TicketStatus)}
            className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-2 cursor-pointer hover:border-zinc-600 transition-colors">
            <option value="">Todos</option>
            <option value="open">Abertos</option>
            <option value="in_progress">Em andamento</option>
            <option value="closed">Encerrados</option>
          </select>
          <button onClick={fetchTickets} className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white transition-colors" style={{ background: "transparent" }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
          <MessageSquare size={32} className="opacity-30" />
          <p className="text-sm">Nenhum ticket encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map(t => (
            <button key={t.ticket_id} onClick={() => openTicket(t)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-zinc-700 transition-colors text-left w-full"
              style={{ background: undefined }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{t.subject}</p>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono">{t.user_id} · {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <TicketBadge status={t.status} />
              <ChevronRight size={16} className="text-zinc-600 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [activeTab, setActiveTab] = useState<"users" | "tickets">("users");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button onClick={() => setActiveTab("users")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === "users" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                style={{ border: "none" }}>
                <Users size={12} /> Usuários
              </button>
              <button onClick={() => setActiveTab("tickets")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === "tickets" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                style={{ border: "none" }}>
                <MessageSquare size={12} /> Tickets
              </button>
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
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col gap-8">

        {activeTab === "tickets" && <TicketsSection />}

        {activeTab === "users" && <>

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
            <div className="grid grid-cols-[1fr_1fr_80px_72px_80px_36px_160px] gap-4 px-5 py-3 border-b border-zinc-800 bg-zinc-900/80">
              {["Usuário", "Email", "Tier", "Role", "Provider", "", "Ações"].map((h, idx) => (
                <span key={idx} className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest last:text-right">{h}</span>
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
                    className={`grid grid-cols-[1fr_1fr_80px_72px_80px_36px_160px] gap-4 px-5 py-3.5 items-center border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors ${i === users.length - 1 ? "border-b-0" : ""}`}
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

                    {/* Detail */}
                    <button
                      title="Ver detalhes"
                      onClick={() => setSelectedUser(u)}
                      className="p-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-sky-400 hover:border-sky-500/30 transition-colors"
                      style={{ background: "transparent" }}
                    >
                      <Eye size={14} />
                    </button>

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

        </> /* end activeTab === "users" */}

        {/* ── Footer ── */}
        <footer className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-700">
          <span>5Vault Admin Panel</span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} /> {new Date().toLocaleString("pt-BR")}
          </span>
        </footer>
      </div>

      {/* User detail panel */}
      {selectedUser && <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

export default Admin;
