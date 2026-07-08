import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle, Globe, Server, Search, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import useAuthContext from "../hook/useAuthContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const SHARED_PRICE_BRL = 15;

type Step = "domain-choice" | "own-domain" | "check-domain" | "confirming" | "done";

interface DomainCheckResult {
  domain: string;
  available: boolean;
  price_usd: number;
  price_brl: number;
  purchase_url: string;
}

interface StorageResult {
  bucket_name: string;
  domain: string;
  domain_type: string;
  status: string;
  public_url: string;
}

const StorageSetupTemplate = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuthContext();
  const [step, setStep] = useState<Step>("domain-choice");
  const [customDomain, setCustomDomain] = useState("");
  const [domainToCheck, setDomainToCheck] = useState("");
  const [checkResult, setCheckResult] = useState<DomainCheckResult | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [storage, setStorage] = useState<StorageResult | null>(null);

  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  const handleSetup = async (domainType: "own" | "shared", domain?: string) => {
    setSetupLoading(true);
    try {
      const { data } = await axios.post(
        SERVER_URL + "/bucket/setup",
        { domain_type: domainType, custom_domain: domain ?? "" },
        { headers: authHeader }
      );
      setStorage(data);
      setStep("done");
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Erro ao configurar storage");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDomainCheck = async () => {
    if (!domainToCheck) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const { data } = await axios.post(
        SERVER_URL + "/bucket/domain/check",
        { domain: domainToCheck },
        { headers: authHeader }
      );
      setCheckResult(data);
    } catch {
      toast.error("Não foi possível verificar o domínio");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Server className="text-blue-500 w-7 h-7" />
            <h1 className="text-3xl font-bold text-white">Criar seu Storage</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Seu storage é um bucket Cloudflare R2 dedicado para os arquivos do seu servidor FiveM.
          </p>
        </div>

        {/* Step: domain-choice */}
        {step === "domain-choice" && (
          <div className="space-y-4">
            <p className="text-zinc-300 text-sm font-medium mb-2">Você quer configurar outro domínio?</p>

            <button
              onClick={() => {
                if (!user?.tier || user.tier === "free" || user.tier === "starter") {
                  toast.error("Seu plano não permite configuração de outros domínios. Faça upgrade para o plano Profissional ou superior.");
                  return;
                }
                setStep("own-domain");
              }}
              className="w-full flex items-start gap-4 border border-zinc-700 hover:border-blue-500 rounded-xl p-5 text-left transition-colors group"
            >
              <Globe className="text-blue-400 w-6 h-6 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Sim, tenho um domínio</p>
                  {(!user?.tier || user.tier === "free" || user.tier === "starter") && (
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      PRO / ENTERPRISE
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm mt-1">
                  Ex: <code className="text-zinc-300">files.meuservidor.com.br</code> — configure gratuitamente.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                if (!user?.tier || user.tier === "free" || user.tier === "starter") {
                  toast.error("Seu plano não permite configuração de outros domínios. Faça upgrade para o plano Profissional ou superior.");
                  return;
                }
                setStep("check-domain");
              }}
              className="w-full flex items-start gap-4 border border-zinc-700 hover:border-purple-500 rounded-xl p-5 text-left transition-colors group"
            >
              <Search className="text-purple-400 w-6 h-6 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">Quero comprar um domínio</p>
                  {(!user?.tier || user.tier === "free" || user.tier === "starter") && (
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      PRO / ENTERPRISE
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm mt-1">
                  Verifique disponibilidade e preço via Cloudflare Registrar (preços no atacado, sem markup).
                </p>
              </div>
            </button>

            <button
              onClick={() => handleSetup("shared")}
              disabled={setupLoading}
              className="w-full flex items-start gap-4 border border-zinc-700 hover:border-green-500 rounded-xl p-5 text-left transition-colors group disabled:opacity-50"
            >
              <Server className="text-green-400 w-6 h-6 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white group-hover:text-green-400 transition-colors">
                    Usar subdomínio compartilhado
                  </p>
                  <span className="text-xs bg-green-900/40 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">
                    R$ {SHARED_PRICE_BRL}/mês
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-1">
                  Você receberá um endereço como{" "}
                  <code className="text-zinc-300">seu-slug.storage.5keepr.app</code>
                </p>
              </div>
            </button>

            {setupLoading && (
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm pt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando seu bucket...
              </div>
            )}
          </div>
        )}

        {/* Step: own-domain */}
        {step === "own-domain" && (
          <div className="space-y-4">
            <button onClick={() => setStep("domain-choice")} className="text-zinc-400 hover:text-white text-sm mb-2">
              ← Voltar
            </button>
            <p className="text-zinc-300 font-medium">Qual será o domínio para o seu storage?</p>
            <p className="text-zinc-500 text-sm">
              Insira um subdomínio que você controla. Seu domínio precisa estar na Cloudflare para que configuremos o DNS automaticamente.
            </p>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="files.meuservidor.com.br"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSetup("own", customDomain)}
              disabled={!customDomain || setupLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {setupLoading ? "Configurando..." : "Criar storage com este domínio"}
            </button>
          </div>
        )}

        {/* Step: check-domain */}
        {step === "check-domain" && (
          <div className="space-y-4">
            <button onClick={() => setStep("domain-choice")} className="text-zinc-400 hover:text-white text-sm mb-2">
              ← Voltar
            </button>
            <p className="text-zinc-300 font-medium">Verificar disponibilidade de domínio</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={domainToCheck}
                onChange={(e) => setDomainToCheck(e.target.value)}
                placeholder="meuservidor.com.br"
                onKeyDown={(e) => e.key === "Enter" && handleDomainCheck()}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleDomainCheck}
                disabled={!domainToCheck || checkLoading}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-50"
              >
                {checkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {checkResult && (
              <div className="border border-zinc-700 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{checkResult.domain}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    checkResult.available
                      ? "bg-green-900/40 text-green-400 border border-green-700"
                      : "bg-red-900/40 text-red-400 border border-red-700"
                  }`}>
                    {checkResult.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>

                {checkResult.available && (
                  <div className="text-zinc-400 text-sm space-y-1">
                    <p>Preço estimado (Cloudflare at-cost):</p>
                    <p className="text-white font-semibold text-lg">
                      R$ {checkResult.price_brl.toFixed(2)}/ano
                      <span className="text-zinc-500 text-sm font-normal ml-2">(USD {checkResult.price_usd.toFixed(2)})</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {checkResult.available && (
                    <a
                      href={checkResult.purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Comprar na Cloudflare
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setCustomDomain(checkResult.domain);
                      setStep("own-domain");
                    }}
                    className="flex-1 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm py-2 rounded-lg transition-colors"
                  >
                    Já tenho este domínio →
                  </button>
                </div>
              </div>
            )}

            {/* Fallback to shared */}
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleSetup("shared")}
                disabled={setupLoading}
                className="w-full text-zinc-400 hover:text-white text-sm text-center py-2 disabled:opacity-50"
              >
                Usar subdomínio compartilhado por R$ {SHARED_PRICE_BRL}/mês →
              </button>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === "done" && storage && (
          <div className="text-center space-y-5">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-white">Storage criado!</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Seu bucket está sendo provisionado. Pode levar até 2 minutos para ficar ativo.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left space-y-3">
              <InfoRow label="Bucket" value={storage.bucket_name} />
              <InfoRow label="Domínio" value={storage.domain} />
              <InfoRow label="URL Pública" value={storage.public_url || "Provisionando..."} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span className={`font-medium ${storage.status === "active" ? "text-green-400" : "text-yellow-400"}`}>
                  {storage.status === "active" ? "Ativo" : "Provisionando..."}
                </span>
              </div>
            </div>

            {storage.domain_type === "shared" && (
              <div className="bg-blue-950/40 border border-blue-800 rounded-xl p-4 text-sm text-blue-300 text-left">
                <p className="font-medium mb-1">Subdomínio compartilhado</p>
                <p className="text-blue-400/70">
                  O plano compartilhado será cobrado R$ {SHARED_PRICE_BRL}/mês. Configure o pagamento em <strong>Configurações → Plano</strong>.
                </p>
              </div>
            )}

            <button
              onClick={onComplete}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Ir para o Storage →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-zinc-500">{label}</span>
    <span className="text-white font-mono text-xs">{value}</span>
  </div>
);

export default StorageSetupTemplate;
