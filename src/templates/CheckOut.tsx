import { useState, useEffect, type ReactElement } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Database,
  Globe,
  HeadphonesIcon,
} from "lucide-react";
import useVisualContext from "../hook/useVisualContext";
import { createPaymentIntent } from "../api/payment";
import type { TierType } from "../@types/Tier";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? "");

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const tierIcons: Record<string, ReactElement> = {
  free: <Zap size={18} />,
  basic: <Database size={18} />,
  pro: <Globe size={18} />,
};

const tierFeatureIcons: Record<string, ReactElement> = {
  storage: <Database size={14} />,
  support: <HeadphonesIcon size={14} />,
  default: <CheckCircle2 size={14} />,
};

function featureIcon(label: string): ReactElement {
  const l = label.toLowerCase();
  if (l.includes("storage") || l.includes("armazenamento")) return tierFeatureIcons.storage;
  if (l.includes("support") || l.includes("suporte")) return tierFeatureIcons.support;
  return tierFeatureIcons.default;
}

// ─── Stripe form ──────────────────────────────────────────────────────────────

interface CheckoutFormProps {
  tierID: string;
  saveCard: boolean;
  onSaveCardChange: (v: boolean) => void;
  onError: (msg: string | null) => void;
}

function CheckoutForm({ tierID, saveCard, onSaveCardChange, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setLocalError(null);
    onError(null);

    const returnUrl = `${window.location.origin}/dashboard?payment=success&tier=${tierID}&save_card=${saveCard}`;
    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });

    if (error) {
      const msg =
        error.type === "card_error" || error.type === "validation_error"
          ? (error.message ?? "Erro na validação do pagamento.")
          : "Ocorreu um erro inesperado. Tente novamente.";
      setLocalError(msg);
      onError(msg);
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Stripe payment element */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden p-1">
        <PaymentElement
          options={{
            layout: { type: "accordion", defaultCollapsed: false, radios: "auto", spacedAccordionItems: true },
          }}
        />
      </div>

      {/* Save card toggle */}
      <label className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-zinc-700 transition-colors select-none">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={e => onSaveCardChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            saveCard ? "bg-[var(--primary-contrast)] border-[var(--primary-contrast)]" : "border-zinc-600 bg-transparent"
          }`}>
            {saveCard && (
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Guardar cartão para transações futuras</p>
          <p className="text-xs text-zinc-500 mt-0.5">Seu cartão será salvo com segurança. CVV nunca é armazenado.</p>
        </div>
      </label>

      {localError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <p className="text-sm">{localError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: processing
            ? "#6b0020"
            : "linear-gradient(135deg, #e8073f 0%, #ad022c 100%)",
          boxShadow: processing ? "none" : "0 4px 20px rgba(232,7,63,0.35)",
        }}
      >
        {processing ? (
          <><RefreshCw size={16} className="animate-spin" /> Processando...</>
        ) : (
          <><Lock size={15} /> Confirmar pagamento</>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-zinc-600 text-xs">
        <ShieldCheck size={13} className="text-[var(--primary-contrast-light)]" />
        Pagamento seguro processado por Stripe
      </p>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CheckOut = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tiers, language } = useVisualContext();

  const tierID = searchParams.get("tier") ?? "pro";
  const tier = tiers.find((t: TierType) => t.id === tierID) ?? null;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveCard, setSaveCard] = useState(false);

  // Re-create intent when saveCard changes so setup_future_usage is set correctly
  useEffect(() => {
    if (!tier || tier.cost === 0) {
      setLoadError("Plano inválido ou gratuito.");
      setLoading(false);
      return;
    }
    setLoading(true);
    createPaymentIntent(tierID, false)
      .then((data) => setClientSecret(data.client_secret))
      .catch(() => setLoadError("Não foi possível iniciar o checkout. Tente novamente."))
      .finally(() => setLoading(false));
  }, [tierID]);

  const stripeAppearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#e8073f",
      colorBackground: "#18181b",
      colorText: "#f4f4f5",
      colorTextSecondary: "#a1a1aa",
      colorDanger: "#f43f5e",
      colorIcon: "#a1a1aa",
      fontFamily: "system-ui, sans-serif",
      borderRadius: "10px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: "1px solid #27272a",
        backgroundColor: "#09090b",
        padding: "12px 14px",
        boxShadow: "none",
        color: "#f4f4f5",
      },
      ".Input:focus": { border: "1px solid #e8073f", boxShadow: "0 0 0 2px rgba(232,7,63,0.15)" },
      ".Input--invalid": { border: "1px solid #f43f5e" },
      ".Label": { fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.07em", color: "#52525b" },
      ".Tab": { border: "1px solid #27272a", backgroundColor: "#09090b", color: "#71717a" },
      ".Tab:hover": { border: "1px solid #3f3f46", color: "#a1a1aa" },
      ".Tab--selected": { border: "1px solid #e8073f", backgroundColor: "rgba(232,7,63,0.08)", color: "#e8073f" },
      ".TabIcon--selected": { fill: "#e8073f" },
      ".Block": { border: "1px solid #27272a", backgroundColor: "#09090b" },
      ".Error": { color: "#f43f5e" },
    },
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-zinc-800 border-t-[var(--primary-contrast-light)] animate-spin"
          />
          <p className="text-zinc-600 text-xs tracking-widest uppercase">Preparando checkout...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (loadError || !tier || !clientSecret) {
    return (
      <div className="min-h-screen bg-[#0d0d0e] flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <AlertCircle size={26} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Algo deu errado</h2>
          <p className="text-sm text-zinc-500 max-w-xs">{loadError ?? "Não foi possível carregar o checkout."}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all text-sm font-medium"
          style={{ background: "transparent" }}
        >
          <ArrowLeft size={15} /> Voltar
        </button>
      </div>
    );
  }

  const isPro = tier.id === "pro";

  // ── Main ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-white">
      {/* Navbar */}
      <div className="sticky top-0 z-40 border-b border-zinc-900 bg-[#0d0d0e]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
            style={{ background: "transparent", border: "none", padding: 0 }}
          >
            <ArrowLeft size={15} /> Voltar
          </button>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <ShieldCheck size={14} className="text-[var(--primary-contrast-light)]" />
            Checkout seguro
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-5 py-12">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">

          {/* ── Left: plan summary ── */}
          <div className="flex flex-col gap-6">
            {/* Plan card */}
            <div className={`relative rounded-2xl border p-6 ${isPro ? "border-[var(--primary-contrast-light)]/40 bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"}`}>
              {isPro && (
                <span className="absolute -top-3 left-6 bg-[var(--primary-contrast-light)] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}

              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/30 flex items-center justify-center text-[var(--primary-contrast-light)]">
                    {tierIcons[tier.id] ?? <Zap size={18} />}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Plano</p>
                    <h2 className="text-lg font-extrabold">{tier.name}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{formatBRL(tier.cost)}</span>
                    <span className="text-zinc-500 text-sm">/{language === "pt" ? "mês" : "mo"}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Cobrado mensalmente</p>
                </div>
              </div>

              {/* Included features */}
              <div className="flex flex-col gap-2.5">
                {tier.included.map((item: { [key: string]: string }) => (
                  <div key={item[language]} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <span className="text-[var(--primary-contrast-light)] shrink-0">
                      {featureIcon(item[language])}
                    </span>
                    {item[language]}
                  </div>
                ))}
              </div>

              <p className="mt-5 text-zinc-600 text-xs border-t border-zinc-800 pt-4">
                {tier.description[language]}
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <ShieldCheck size={16} />, label: "Pagamento seguro" },
                { icon: <RefreshCw size={16} />, label: "Cancele quando quiser" },
                { icon: <Lock size={16} />, label: "Dados protegidos" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
                  <span className="text-[var(--primary-contrast-light)]">{b.icon}</span>
                  <p className="text-[11px] text-zinc-500 leading-tight font-medium">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: payment form ── */}
          <div className="lg:sticky lg:top-20">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/30 flex items-center justify-center text-[var(--primary-contrast-light)]">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Finalizar assinatura</h3>
                  <p className="text-zinc-500 text-xs">Processado com segurança pela Stripe</p>
                </div>
              </div>

              {/* Order summary line */}
              <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <p className="text-sm font-semibold">5Keepr {tier.name}</p>
                  <p className="text-xs text-zinc-500">Assinatura mensal</p>
                </div>
                <p className="font-extrabold text-white">{formatBRL(tier.cost)}</p>
              </div>

              {payError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-4">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {payError}
                </div>
              )}

              {/* Stripe Elements */}
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                <CheckoutForm
                  tierID={tier.id}
                  saveCard={saveCard}
                  onSaveCardChange={setSaveCard}
                  onError={setPayError}
                />
              </Elements>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckOut;
