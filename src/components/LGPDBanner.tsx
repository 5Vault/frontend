import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";
import { sessionStore } from "../utils/sessionStore";
import useAxios from "../utils/axiosConfig";
import useAuthContext from "../hook/useAuthContext";

const CONSENT_KEY = "@fivevault/lgpd_consent";

const LGPDBanner = () => {
  const [visible, setVisible] = useState(false);
  const axiosInstance = useAxios();
  const { user } = useAuthContext();

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = async () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    setVisible(false);
    // Registra no backend se estiver autenticado
    if (user) {
      try { await axiosInstance.post("/lgpd/consent"); } catch { /* silencioso */ }
    }
  };

  const reject = () => {
    // Apenas cookies essenciais — fecha o banner sem dados analíticos
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, at: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 flex justify-center">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={22} className="text-[var(--primary-contrast-light)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-1">Privacidade e Proteção de Dados (LGPD)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Utilizamos cookies e dados pessoais para autenticação, funcionamento da plataforma e melhoria dos nossos serviços,
              em conformidade com a{" "}
              <strong className="text-white">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>.
              Suas informações nunca são vendidas a terceiros. Você pode revogar o consentimento a qualquer momento nas configurações.
            </p>
          </div>
          <button onClick={reject} className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-3">
          <a
            href="/privacy"
            className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
          >
            Política de Privacidade
          </a>
          <div className="flex gap-2">
            <button
              onClick={reject}
              className="text-xs px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Apenas essenciais
            </button>
            <button
              onClick={accept}
              className="text-xs px-4 py-2 rounded-lg bg-[var(--primary-contrast-light)] text-white hover:bg-[var(--primary-contrast-dark)] transition-colors font-semibold"
            >
              Aceitar tudo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const hasLGPDConsent = (): boolean => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return false;
    return JSON.parse(stored)?.accepted === true;
  } catch {
    return false;
  }
};

export default LGPDBanner;
