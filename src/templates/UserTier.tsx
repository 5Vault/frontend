import {
  ArrowLeft, Check, Zap, Star, Building2, Sparkles,
  Minus, HardDrive, Database, Key, Globe, RefreshCw, ShieldCheck, X,
} from "lucide-react";
import HeaderTemplate from "../components/Header";
import useVisualContext from "../hook/useVisualContext";
import useAuthContext from "../hook/useAuthContext";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

// ── Static data ───────────────────────────────────────────────────────────────

const tierIcon: Record<string, React.ReactElement> = {
  free:       <Sparkles size={15} />,
  starter:    <Zap size={15} />,
  pro:        <Star size={15} />,
  enterprise: <Building2 size={15} />,
};

const iconBg: Record<string, string> = {
  free:       "bg-zinc-700 text-zinc-300",
  starter:    "bg-[var(--primary-contrast-light)] text-white",
  pro:        "bg-violet-600 text-white",
  enterprise: "bg-amber-500 text-white",
};

const priceColor: Record<string, string> = {
  free:       "text-white",
  starter:    "text-[var(--primary-contrast-light)]",
  pro:        "text-violet-400",
  enterprise: "text-amber-400",
};

type CellValue = string | boolean | null;

type CompareRow = {
  category?: string; // optional section divider label
  icon: React.ReactNode;
  label: string;
  free: CellValue;
  starter: CellValue;
  pro: CellValue;
  enterprise: CellValue;
};

const rows: CompareRow[] = [
  // Capacidade
  { category: "Capacidade", icon: <Database size={13} />,   label: "Buckets",                  free: "1",          starter: "3",          pro: "6",             enterprise: "Ilimitado"   },
  {                          icon: <HardDrive size={13} />,  label: "Armazenamento",             free: "1 GB",       starter: "60 GB",      pro: "150 GB",        enterprise: "250 GB"      },
  // API
  { category: "API",         icon: <Key size={13} />,        label: "Chaves de API",             free: "1",          starter: "3",          pro: "10",            enterprise: "Ilimitadas"  },
  // Infraestrutura
  { category: "Infraestrutura", icon: <Globe size={13} />,  label: "Subdomínio compartilhado",  free: true,         starter: true,         pro: true,            enterprise: true          },
  {                          icon: <Globe size={13} />,      label: "Configuração de outros domínios", free: false,        starter: false,        pro: true,            enterprise: true          },
  {                          icon: <RefreshCw size={13} />,  label: "Backup automático diário",  free: false,        starter: false,        pro: true,            enterprise: true          },
  {                          icon: <ShieldCheck size={13} />,label: "SLA de uptime",             free: null,         starter: null,         pro: null,            enterprise: "99,9%"       },
];

// ── Cell ──────────────────────────────────────────────────────────────────────

const Cell = ({ value, highlight }: { value: CellValue; highlight?: boolean }) => {
  if (value === true) return (
    <div className="flex justify-center">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? "bg-violet-600" : "bg-green-500/15"}`}>
        <Check size={11} className={highlight ? "text-white" : "text-green-400"} />
      </span>
    </div>
  );
  if (value === false) return (
    <div className="flex justify-center">
      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-800/60">
        <X size={10} className="text-zinc-700" />
      </span>
    </div>
  );
  if (value === null) return (
    <div className="flex justify-center">
      <Minus size={13} className="text-zinc-700" />
    </div>
  );
  return (
    <span className={`text-xs font-medium ${highlight ? "text-white" : "text-zinc-400"}`}>
      {value}
    </span>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────

const TiersTemplate = () => {
  const { language, tiers } = useVisualContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();


  const tierOrder = ["free", "starter", "pro", "enterprise"];
  const sorted = [...tiers].sort((a, b) => tierOrder.indexOf(a.id) - tierOrder.indexOf(b.id));
  const currentTierIndex = tiers.findIndex(t => t.id === user?.tier);

  const handleSelect = (id: string) => {
    if (id === user?.tier) { toast("Este já é o seu plano atual.", { icon: "ℹ️" }); return; }
    if (id === "free")     { toast("Para voltar ao plano gratuito, cancele seu plano atual.", { icon: "ℹ️" }); return; }
    navigate(`/checkout?tier=${id}`);
  };

  // group rows by category for section headers
  let lastCategory = "";

  return (
    <div className="flex flex-col w-full h-full gap-6 overflow-y-auto pr-1 pb-4">
      <HeaderTemplate
        icon={<Star size={22} />}
        title="Planos"
        description="Escolha o plano ideal para o seu servidor"
        content={
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800">
            <ArrowLeft size={15} /> Voltar
          </button>
        }
      />

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="w-full rounded-2xl border border-zinc-800 overflow-hidden">

        {/* Sticky header with pricing */}
        <div className="grid grid-cols-[200px_repeat(4,_1fr)] bg-zinc-900 border-b border-zinc-800">
          <div className="px-5 py-5 flex items-end">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Recursos</p>
          </div>

          {sorted.map((tier) => {
            const isCurrentTier = user?.tier === tier.id;
            const isPro         = tier.id === "pro";

            const tierIdx       = tiers.findIndex(t => t.id === tier.id);
            const isUpgrade     = tierIdx > currentTierIndex;

            return (
              <div key={tier.id}
                className={`px-4 py-5 flex flex-col items-center gap-2 border-l border-zinc-800 relative ${isPro ? "bg-violet-600/5" : ""}`}>
                {isPro && !isCurrentTier && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-violet-600/0 via-violet-500 to-violet-600/0" />
                )}
                {isPro && !isCurrentTier && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 px-2 py-px rounded-b-md bg-violet-600 text-white text-[9px] font-bold tracking-widest uppercase">
                    Popular
                  </span>
                )}
                {isCurrentTier && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 px-2 py-px rounded-b-md bg-zinc-600 text-zinc-300 text-[9px] font-bold tracking-widest uppercase">
                    Atual
                  </span>
                )}

                <span className={`p-1.5 rounded-lg ${iconBg[tier.id]}`}>
                  {tierIcon[tier.id]}
                </span>
                <span className="text-sm font-bold text-white">{tier.name}</span>

                {tier.cost === 0 ? (
                  <span className={`text-xl font-black ${priceColor[tier.id]}`}>Grátis</span>
                ) : (
                  <div className="flex items-end gap-0.5 leading-none">
                    <span className="text-[10px] text-zinc-500 mb-1">R$</span>
                    <span className={`text-xl font-black ${priceColor[tier.id]}`}>
                      {tier.cost.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] text-zinc-500 mb-0.5">/mês</span>
                  </div>
                )}

                <p className="text-[10px] text-zinc-500 text-center leading-relaxed">{tier.description[language]}</p>

                {isCurrentTier ? (
                  <div className="w-full mt-1 py-1.5 rounded-lg text-center text-[11px] text-zinc-500 bg-zinc-800/60 font-medium border border-zinc-700/40">
                    Plano ativo
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelect(tier.id)}
                    className={`w-full mt-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      isPro
                        ? "bg-violet-600 text-white hover:bg-violet-500"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50"
                    }`}
                  >
                    {tier.id === "free" ? "Cancelar" : isUpgrade ? "Fazer upgrade" : "Fazer downgrade"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature rows */}
        {rows.map((row, i) => {
          const showCategory = row.category && row.category !== lastCategory;
          if (row.category) lastCategory = row.category;

          return (
            <div key={`${row.label}-${i}`}>
              {showCategory && (
                <div className="grid grid-cols-[200px_repeat(4,_1fr)] bg-zinc-800/40 border-b border-zinc-800/60">
                  <div className="px-5 py-2 col-span-5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{row.category}</span>
                  </div>
                </div>
              )}
              <div className={`grid grid-cols-[200px_repeat(4,_1fr)] border-b border-zinc-800/40 ${i % 2 === 0 ? "bg-zinc-900/40" : "bg-zinc-900/10"}`}>
                <div className="px-5 py-3 flex items-center gap-2.5">
                  <span className="text-zinc-600 shrink-0">{row.icon}</span>
                  <span className="text-xs text-zinc-400">{row.label}</span>
                </div>
                {(["free", "starter", "pro", "enterprise"] as const).map((id) => (
                  <div key={id} className={`px-4 py-3 flex items-center justify-center border-l border-zinc-800/30 ${id === "pro" ? "bg-violet-600/5" : ""}`}>
                    <Cell value={row[id]} highlight={id === "pro"} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>



      {/* ── Cancel ────────────────────────────────────────────────────── */}
      {user?.tier && user.tier !== "free" && (
        <div className="w-full border border-zinc-800 rounded-2xl bg-zinc-900/30 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Cancelar plano</p>
            <p className="text-xs text-zinc-500">Seus dados serão preservados. Você continuará no plano gratuito após o cancelamento.</p>
          </div>
          <button
            onClick={() => toast("Funcionalidade em breve.", { icon: "ℹ️" })}
            className="shrink-0 px-4 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
            Cancelar plano
          </button>
        </div>
      )}
    </div>
  );
};

export default TiersTemplate;
