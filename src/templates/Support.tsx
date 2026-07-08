import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare, Plus, Loader2, Send, X, CheckCircle,
  Clock, AlertCircle, ArrowLeft, ChevronRight, Tag, Wifi,
} from "lucide-react";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import { useTicketWS } from "../hooks/useTicketWS";

type TicketStatus = "open" | "in_progress" | "closed";

type Ticket = {
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

const CATEGORIES = [
  { value: "financeiro", label: "Financeiro", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { value: "suporte_tecnico", label: "Suporte Técnico", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "parcerias", label: "Parcerias", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { value: "outros", label: "Outros", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
] as const;

type CategoryValue = typeof CATEGORIES[number]["value"];

function getCategoryConfig(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[3];
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; icon: React.ReactNode; color: string }> = {
  open: { label: "Aberto", icon: <AlertCircle size={11} />, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  in_progress: { label: "Em andamento", icon: <Clock size={11} />, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  closed: { label: "Encerrado", icon: <CheckCircle size={11} />, color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" },
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = getCategoryConfig(category);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${cfg.color}`}>
      <Tag size={10} /> {cfg.label}
    </span>
  );
}

// ── New Ticket Modal ──────────────────────────────────────────────────────────

const NewTicketModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Ticket) => void }) => {
  const axiosInstance = useAxios();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<CategoryValue>("suporte_tecnico");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post<Ticket>("/ticket/", {
        subject: subject.trim(),
        category,
        content: content.trim(),
      });
      toast.success("Ticket criado com sucesso!");
      onCreated(res.data);
      onClose();
    } catch {
      toast.error("Erro ao criar ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/30 flex items-center justify-center">
              <MessageSquare size={15} className="text-[var(--primary-contrast-light)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Abrir ticket de suporte</h2>
              <p className="text-xs text-zinc-500">Nossa equipe responderá em breve</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors" style={{ border: "none", background: "transparent" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5 p-6">
          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                    category === cat.value
                      ? `${cat.color} border-current`
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                  style={{ background: "transparent" }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Assunto</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Descreva o problema brevemente"
              required
              minLength={3}
              maxLength={120}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Descrição</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Explique em detalhes o que está acontecendo..."
              required
              minLength={10}
              rows={5}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors font-medium"
              style={{ background: "transparent" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !subject.trim() || !content.trim()}
              className="flex-1 py-3 rounded-xl bg-[var(--primary-contrast)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Enviar ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Ticket Detail ─────────────────────────────────────────────────────────────

const TicketDetail = ({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) => {
  const axiosInstance = useAxios();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const sending = false;

  // Load history via REST on mount.
  useEffect(() => {
    axiosInstance
      .get<{ ticket: Ticket; messages: TicketMessage[] }>(`/ticket/${ticket.ticket_id}`)
      .then(r => {
        const msgs = r.data.messages ?? [];
        msgs.forEach(m => seenIds.current.add(m.message_id));
        setMessages(msgs);
        setStatus(r.data.ticket?.status ?? ticket.status);
      })
      .catch(() => toast.error("Erro ao carregar mensagens."))
      .finally(() => setLoading(false));
  }, [ticket.ticket_id]);

  // WebSocket for real-time updates.
  const { incoming, send } = useTicketWS({
    ticketId: ticket.ticket_id,
    enabled: status !== "closed",
  });

  // Append incoming WS messages, deduplicating by ID.
  useEffect(() => {
    if (!incoming) return;
    if (seenIds.current.has(incoming.message_id)) return;
    seenIds.current.add(incoming.message_id);
    setMessages(prev => [...prev, incoming as TicketMessage]);
    // If admin replied, reflect status change.
    if (incoming.role === "admin" && status === "open") setStatus("in_progress");
  }, [incoming]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || status === "closed") return;
    const sent = send(reply.trim());
    if (sent) {
      setReply("");
    } else {
      toast.error("Conexão perdida. Tente novamente.");
    }
  };

  const catCfg = getCategoryConfig(ticket.category);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={onBack}
          className="mt-0.5 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
          style={{ border: "none", background: "transparent" }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-white leading-tight truncate">{ticket.subject}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={status} />
            <CategoryBadge category={ticket.category} />
            {status !== "closed" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <Wifi size={10} className="animate-pulse" /> Ao vivo
              </span>
            )}
            <span className="text-xs text-zinc-600">{new Date(ticket.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-600">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-zinc-600 text-sm">Nenhuma mensagem.</div>
          ) : (
            messages.map(msg => {
              const isAdmin = msg.role === "admin";
              return (
                <div key={msg.message_id} className={`flex flex-col gap-1 max-w-[85%] ${isAdmin ? "self-start" : "self-end items-end"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isAdmin
                      ? "bg-zinc-800 text-zinc-200 rounded-tl-sm"
                      : "bg-[var(--primary-contrast)] text-white rounded-tr-sm"
                  }`}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1.5 px-1">
                    <span className={`text-[10px] font-semibold ${isAdmin ? "text-zinc-500" : "text-zinc-500"}`}>
                      {isAdmin ? "Suporte FiveKeepr" : "Você"}
                    </span>
                    <span className="text-[10px] text-zinc-700">
                      {new Date(msg.created_at).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        {status !== "closed" ? (
          <form onSubmit={sendReply} className="border-t border-zinc-800 p-3 flex gap-2 items-end">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Escreva sua resposta..."
              rows={2}
              className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors resize-none leading-relaxed"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendReply(e as unknown as React.FormEvent);
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="p-2.5 rounded-xl bg-[var(--primary-contrast)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
              style={{ border: "none" }}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        ) : (
          <div className="border-t border-zinc-800 px-5 py-3.5 flex items-center gap-2 text-xs text-zinc-500">
            <CheckCircle size={14} className="text-zinc-600" />
            Ticket encerrado. Abra um novo ticket se precisar de mais ajuda.
          </div>
        )}
      </div>

      {/* Category hint */}
      <p className="text-[11px] text-zinc-700 mt-2 text-center">
        Categoria: <span className={catCfg.color.split(" ")[0]}>{catCfg.label}</span>
      </p>
    </div>
  );
};

// ── Ticket List ───────────────────────────────────────────────────────────────

const TicketList = ({ onOpen }: { onOpen: (t: Ticket) => void }) => {
  const axiosInstance = useAxios();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await axiosInstance.get<{ tickets: Ticket[] }>("/ticket/");
      setTickets(res.data.tickets ?? []);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Suporte</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Abra um ticket e nossa equipe responderá em breve.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary-contrast)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ border: "none" }}
        >
          <Plus size={15} /> Novo ticket
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-zinc-600" />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <p className="text-sm text-zinc-400">Não foi possível carregar os tickets.</p>
          <button onClick={fetchTickets} className="text-xs text-zinc-500 hover:text-white underline transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
            <MessageSquare size={28} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-300">Nenhum ticket ainda</p>
            <p className="text-xs text-zinc-600 mt-1">Clique em "Novo ticket" para entrar em contato com o suporte.</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors font-medium"
            style={{ background: "transparent" }}
          >
            <Plus size={14} /> Abrir primeiro ticket
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map(t => (
            <button
              key={t.ticket_id}
              onClick={() => onOpen(t)}
              className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all text-left w-full"
              style={{ background: undefined }}
            >
              {/* Category color bar */}
              <div className={`w-1 h-10 rounded-full shrink-0 ${getCategoryConfig(t.category).color.split(" ")[2].replace("border-", "bg-").replace("/20", "/60")}`} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-white">{t.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CategoryBadge category={t.category} />
                  <span className="text-xs text-zinc-600">{new Date(t.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={t.status} />
                <ChevronRight size={15} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}

      {showNew && (
        <NewTicketModal
          onClose={() => setShowNew(false)}
          onCreated={t => {
            setTickets(prev => [t, ...prev]);
          }}
        />
      )}
    </>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const SupportTemplate = () => {
  const [selected, setSelected] = useState<Ticket | null>(null);

  return (
    <div className="w-full h-full overflow-y-auto text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {selected ? (
          <div className="flex flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
            <TicketDetail ticket={selected} onBack={() => setSelected(null)} />
          </div>
        ) : (
          <TicketList onOpen={setSelected} />
        )}
      </div>
    </div>
  );
};

export default SupportTemplate;
