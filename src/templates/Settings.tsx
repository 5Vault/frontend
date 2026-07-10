import { Settings, Trash2, HardDrive, CreditCard, Star, AlertTriangle, ShieldCheck, ShieldOff, X } from "lucide-react";
import useAuthContext from "../hook/useAuthContext";
import Icons from "../utils/Icons";
import { formatDate } from "../utils/dateFormat";
import { useState, useEffect } from "react";
import HeaderTemplate from "../components/Header";
import useAxios from "../utils/axiosConfig";
import toast from "react-hot-toast";


const ConfirmCardModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="p-2 rounded-full bg-red-500/10 text-red-400"><AlertTriangle size={20} /></span>
        <h3 className="text-base font-semibold text-white">Remover cartão</h3>
      </div>
      <p className="text-sm text-zinc-400">
        Tem certeza que deseja remover este cartão? Você não poderá usá-lo para pagamentos futuros.
      </p>
      <div className="flex gap-2 justify-end mt-1">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Cancelar</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 transition-colors font-medium">Remover</button>
      </div>
    </div>
  </div>
);

// ── 2FA Modal ────────────────────────────────────────────────────────────────

type TwoFASetupData = { qr_code: string; secret: string; otp_auth_url: string };

const TwoFASetupModal = ({
  data,
  onVerify,
  onCancel,
}: {
  data: TwoFASetupData;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onVerify(code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[var(--primary-contrast-light)]" />
            <h3 className="text-base font-semibold text-white">Configurar autenticação em 2 etapas</h3>
          </div>
          <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <ol className="text-sm text-zinc-400 flex flex-col gap-2 list-decimal list-inside">
          <li>Abra seu aplicativo autenticador (Google Authenticator, Authy, etc.)</li>
          <li>Escaneie o QR Code abaixo ou adicione manualmente</li>
          <li>Digite o código de 6 dígitos gerado para confirmar</li>
        </ol>

        <div className="flex justify-center">
          <img src={data.qr_code} alt="QR Code 2FA" className="w-44 h-44 rounded-lg" />
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-1">Chave manual</p>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 border border-zinc-700">
            <code className="text-xs text-zinc-300 flex-1 break-all font-mono">{data.secret}</code>
            <button onClick={handleCopy} className="text-xs text-[var(--primary-contrast-light)] shrink-0 hover:underline">
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Código de verificação</label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              autoComplete="one-time-code"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:border-[var(--primary-contrast-light)] outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="px-4 py-2 rounded-lg text-sm bg-[var(--primary-contrast-light)] hover:bg-[var(--primary-contrast-dark)] text-white font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Verificando..." : "Ativar 2FA"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TwoFADisableModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: (code: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-full bg-red-500/10 text-red-400"><ShieldOff size={20} /></span>
          <h3 className="text-base font-semibold text-white">Desativar 2FA</h3>
        </div>
        <p className="text-sm text-zinc-400">
          Para desativar, confirme com o código do seu autenticador.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            autoComplete="one-time-code"
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:border-red-500 outline-none"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Desativando..." : "Desativar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsTemplate = () => {
  const { user, setUser } = useAuthContext();
  const axiosInstance = useAxios();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Avatar
  const [avatarURL, setAvatarURL] = useState<string | null>(user?.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Avatar muito grande (máx 2 MB)"); return; }
    const form = new FormData();
    form.append("avatar", file);
    setUploadingAvatar(true);
    try {
      const r = await axiosInstance.post("/user/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
      const newAvatarURL = r.data.avatar_url + "?t=" + Date.now();
      setAvatarURL(newAvatarURL);
      if (setUser) {
        setUser((prev) => prev ? { ...prev, avatar_url: newAvatarURL } : null);
      }
      toast.success("Avatar atualizado!");
    } catch {
      toast.error("Erro ao enviar avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const [extraStorage, setExtraStorage] = useState<boolean>(user?.extra_storage_enabled ?? false);
  const [savingExtra, setSavingExtra] = useState(false);

  // 2FA
  type TwoFASetupData = { qr_code: string; secret: string; otp_auth_url: string };
  const [twoFAEnabled, setTwoFAEnabled] = useState<boolean>(false);
  const [twoFASetupData, setTwoFASetupData] = useState<TwoFASetupData | null>(null);
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  const fetchTwoFAStatus = async () => {
    try {
      const r = await axiosInstance.get("/user/");
      setTwoFAEnabled(r.data?.two_fa_enabled ?? false);
    } catch { /* silencioso */ }
  };

  useEffect(() => { fetchTwoFAStatus(); }, []);

  const handle2FASetup = async () => {
    try {
      const r = await axiosInstance.post("/user/2fa/setup");
      setTwoFASetupData(r.data);
    } catch {
      toast.error("Erro ao iniciar configuração do 2FA.");
    }
  };

  const handle2FAVerify = async (code: string) => {
    try {
      await axiosInstance.post("/user/2fa/verify", { code });
      setTwoFAEnabled(true);
      setTwoFASetupData(null);
      toast.success("2FA ativado com sucesso!");
    } catch {
      toast.error("Código inválido. Tente novamente.");
      throw new Error("invalid");
    }
  };

  const handle2FADisable = async (code: string) => {
    try {
      await axiosInstance.post("/user/2fa/disable", { code });
      setTwoFAEnabled(false);
      setShowDisable2FA(false);
      toast.success("2FA desativado.");
    } catch {
      toast.error("Código inválido. Tente novamente.");
      throw new Error("invalid");
    }
  };

  type SavedCard = {
    pm_id: string;
    card_last4: string;
    card_brand: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
    created_at: string;
  };
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      const r = await axiosInstance.get("/payment/cards");
      setCards(r.data ?? []);
    } catch { /* silencioso */ }
  };

  const handleSetDefaultCard = async (pmId: string) => {
    try {
      await axiosInstance.patch(`/payment/cards/${pmId}/default`);
      setCards((prev) => prev.map((c) => ({ ...c, is_default: c.pm_id === pmId })));
    } catch {
      toast.error("Erro ao definir cartão padrão.");
    }
  };

  const handleDeleteCard = async (pmId: string) => {
    try {
      await axiosInstance.delete(`/payment/cards/${pmId}`);
      setCardToDelete(null);
      setCards((prev) => prev.filter((c) => c.pm_id !== pmId));
      toast.success("Cartão removido.");
    } catch {
      toast.error("Erro ao remover cartão.");
    }
  };

  const brandIcon = (brand: string) => {
    const map: Record<string, string> = {
      visa: "💳", mastercard: "💳", elo: "💳", amex: "💳",
      hipercard: "💳", diners: "💳",
    };
    return map[brand.toLowerCase()] ?? "💳";
  };

  useEffect(() => { fetchCards(); }, []);

  const handleToggleExtraStorage = async (enabled: boolean) => {
    setSavingExtra(true);
    try {
      await axiosInstance.patch("/user/extra-storage", { enabled });
      setExtraStorage(enabled);
      toast.success(enabled ? "Armazenamento extra ativado!" : "Armazenamento extra desativado.");
    } catch {
      toast.error("Erro ao atualizar configuração.");
    } finally {
      setSavingExtra(false);
    }
  };

  const handleSave = () => {
    // TODO: chamar endpoint de atualização de perfil
    toast.success("Perfil atualizado!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  };

  const inputClass = (disabled: boolean) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors ${
      disabled
        ? "bg-zinc-900 border-zinc-800 text-zinc-400 cursor-not-allowed opacity-70"
        : "bg-zinc-800 border-zinc-700 text-white focus:border-[var(--primary-contrast-light)] outline-none"
    }`;

  return (
    <div className="flex flex-col w-full h-full items-start gap-4 overflow-y-auto pr-1">
      <HeaderTemplate
        icon={<Settings size={38} />}
        title="Configurações"
        description="Gerencie seu perfil, meios de pagamento e preferências"
      />

      {/* Perfil */}
      <div className="rounded-xl p-6 w-full border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3 mb-6">
          {Icons.settings}
          <h3 className="text-lg font-semibold">Informações do Perfil</h3>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
              {avatarURL ? (
                <img src={avatarURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-zinc-500">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-0.5">Foto de perfil</p>
            <p className="text-xs text-zinc-500 mb-2">JPG, PNG, WEBP ou GIF · máx 2 MB</p>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[var(--primary-contrast-light)] hover:text-white border border-[var(--primary-contrast-light)]/30 hover:border-[var(--primary-contrast-light)] px-3 py-1.5 rounded-lg transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
              {uploadingAvatar ? "Enviando..." : "Alterar foto"}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nome Completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className={inputClass(!isEditing)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className={inputClass(!isEditing)}
              />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className={inputClass(!isEditing)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5 gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded-lg bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] hover:bg-[var(--primary-contrast-light)] transition-colors"
            >
              {Icons.edit} Editar Perfil
            </button>
          ) : (
            <>
              <button onClick={handleCancel} className="text-sm px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} className="text-sm px-4 py-2 rounded-lg bg-[var(--primary-contrast-light)] hover:bg-[var(--primary-contrast-dark)] text-white transition-colors">
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Armazenamento Extra */}
      <div className="rounded-xl p-6 w-full border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <HardDrive size={20} className="text-[var(--primary-contrast-light)] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold">Armazenamento Extra</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Permite armazenar além da capacidade do seu plano.
                O excedente é cobrado em <strong className="text-white">R$1,00 por GB</strong> adicional,
                proporcional ao uso mensal.
              </p>
              <div className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-500">
                <span>• Cobrança automática no ciclo de faturamento</span>
                <span>• Você pode desativar a qualquer momento</span>
                <span>• Apenas arquivos de mídia são aceitos (imagem, áudio, vídeo)</span>
              </div>
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={() => !savingExtra && handleToggleExtraStorage(!extraStorage)}
            disabled={savingExtra}
            className={`shrink-0 relative inline-flex h-6 w-11 items-center border transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
              extraStorage ? "border-[var(--primary-contrast-light)] bg-[var(--primary-contrast-opacity)]" : "border-zinc-700 bg-zinc-800"
            }`}
            aria-label="Ativar armazenamento extra"
          >
            <span
              className={`inline-block h-4 w-4 transform transition-all duration-200 ${
                extraStorage ? "bg-[var(--primary-contrast-light)] translate-x-[1.375rem]" : "bg-zinc-500 translate-x-1"
              }`}
            />
          </button>
        </div>

        {extraStorage && (
          <div className="mt-4 px-4 py-3 rounded-lg border border-[var(--primary-contrast-light)]/20 bg-[var(--primary-contrast-opacity)]">
            <p className="text-xs text-zinc-300">
              <span className="text-[var(--primary-contrast-light)] font-semibold">Ativo</span> —
              o uso acima do limite do plano será cobrado a R$1,00/GB.
              O valor aparecerá na próxima fatura.
            </p>
          </div>
        )}
      </div>

      {/* Meios de Pagamento */}
      <div className="rounded-xl p-6 w-full border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard size={20} className="text-[var(--primary-contrast-light)]" />
          <div>
            <h3 className="text-lg font-semibold">Meios de Pagamento</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Apenas os últimos 4 dígitos são exibidos. CVV nunca é armazenado.
            </p>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-6 text-zinc-600 text-sm">
            Nenhum cartão salvo. Adicione um ao fazer upgrade de plano.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cards.map((card) => (
              <div key={card.pm_id}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-xl shrink-0">{brandIcon(card.card_brand)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white capitalize">{card.card_brand}</span>
                    <span className="text-sm text-zinc-400">•••• {card.card_last4}</span>
                    {card.is_default && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary-contrast-opacity)] text-[var(--primary-contrast-light)] border border-[var(--primary-contrast-light)]/30 font-semibold uppercase">
                        Padrão
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600">
                    Expira {String(card.exp_month).padStart(2, "0")}/{card.exp_year}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!card.is_default && (
                    <button
                      onClick={() => handleSetDefaultCard(card.pm_id)}
                      title="Definir como padrão"
                      className="p-1.5 text-zinc-600 hover:text-yellow-400 transition-colors"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setCardToDelete(card.pm_id)}
                    title="Remover cartão"
                    className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-[10px] text-zinc-700 leading-relaxed">
          Seus dados de pagamento são processados com segurança pelo Stripe (PCI-DSS Nível 1).
          O número completo do cartão nunca trafega ou é armazenado em nossos servidores,
          em conformidade com a LGPD e com as normas PCI-DSS.
        </p>
      </div>

      {/* Segurança — 2FA */}
      <div className="rounded-xl p-6 w-full border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-[var(--primary-contrast-light)] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold">Autenticação em duas etapas</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Adicione uma camada extra de segurança usando um aplicativo autenticador (Google Authenticator, Authy, etc.).
              </p>
              {twoFAEnabled && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                  <ShieldCheck size={11} />
                  Ativo
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {twoFAEnabled ? (
              <button
                onClick={() => setShowDisable2FA(true)}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                <ShieldOff size={14} />
                Desativar
              </button>
            ) : (
              <button
                onClick={handle2FASetup}
                className="flex items-center gap-1.5 text-sm text-white px-3 py-1.5 rounded-lg bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/40 hover:bg-[var(--primary-contrast-light)] transition-colors"
              >
                <ShieldCheck size={14} />
                Configurar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plano */}
      <div className="rounded-xl p-6 w-full border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3 mb-4">
          {Icons.flag}
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{user?.tier_name ? `Plano ${user.tier_name}` : "Plano Gratuito"}</h3>
            <button
              onClick={() => (window.location.href = "/settings/tier")}
              className="text-xs text-[var(--primary-contrast-light)] hover:underline"
            >
              Fazer Upgrade
            </button>
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          Você está no plano <strong className="text-white">{user?.tier_name || "Gratuito"}</strong>. Gerencie sua assinatura e cobrança.
        </p>
        <div className="w-full h-px bg-zinc-800 my-4" />
        <p className="text-sm text-zinc-500">
          Próxima cobrança: <strong className="text-zinc-300">{user?.tier_updated_at ? formatDate(user.tier_updated_at) : "N/A"}</strong>
        </p>
      </div>

      {cardToDelete && (
        <ConfirmCardModal
          onConfirm={() => handleDeleteCard(cardToDelete)}
          onCancel={() => setCardToDelete(null)}
        />
      )}

      {twoFASetupData && (
        <TwoFASetupModal
          data={twoFASetupData}
          onVerify={handle2FAVerify}
          onCancel={() => setTwoFASetupData(null)}
        />
      )}

      {showDisable2FA && (
        <TwoFADisableModal
          onConfirm={handle2FADisable}
          onCancel={() => setShowDisable2FA(false)}
        />
      )}
    </div>
  );
};

export default SettingsTemplate;
