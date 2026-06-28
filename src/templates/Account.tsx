import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import logoW from "../assets/logow.png";
import useUserContext from "../hooks/useUserContext";
import toast from "react-hot-toast";
import {
  loginUser,
  registerUser,
  googleLoginRedirect,
  discordLoginRedirect,
  verifyCurrentUser,
} from "../services/AuthService";
import { logger } from "../utils/logger";

// ── Icons ─────────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// ── Shared components ─────────────────────────────────────────────────────────

const Field = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-medium text-zinc-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full rounded-lg px-3 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-[var(--primary-contrast-light)] focus:outline-none text-white text-sm placeholder:text-zinc-500 transition-colors"
    />
  </div>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-zinc-800" />
    <span className="text-[11px] text-zinc-600 font-medium">ou continue com</span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
);

const SocialButton = ({
  onClick,
  icon,
  label,
  className = "",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all duration-150 ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// ── AccountTemplate ───────────────────────────────────────────────────────────

const AccountTemplate = () => {
  const [searchParams] = useSearchParams();
  const { setToken, setUser } = useUserContext();
  const mode = searchParams.get("mode");
  const tokenParam = searchParams.get("token");

  useEffect(() => {
    if (!tokenParam) return;
    (async () => {
      try {
        const freshUser = await verifyCurrentUser(tokenParam);
        setToken(tokenParam);
        setUser(freshUser);
        window.location.replace("/dashboard");
      } catch (err) {
        logger.error("Google OAuth callback error:", err);
        toast.error("Erro ao autenticar");
      }
    })();
  }, [tokenParam, setToken, setUser]);

  useEffect(() => {
    if (!tokenParam && mode !== "login" && mode !== "register" && mode !== "recovery") {
      window.location.replace("/account?mode=login");
    }
  }, [mode, tokenParam]);

  const modes = { login: <Login />, register: <Register />, recovery: <Recovery /> };
  const validMode = mode && mode in modes ? (mode as keyof typeof modes) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4 py-10">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[var(--primary-contrast-light)] opacity-[0.04] blur-[140px]" />
        <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600 opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-2xl shadow-black/40">
          {/* Logo inside card */}
          <div className="flex flex-col items-center mb-6 gap-3">
            <img src="/logo.svg" alt="5Vault" className="w-14 h-14 rounded-2xl shadow-lg shadow-black/40" />
            <img src={logoW} alt="5Vault" className="h-6 object-contain" />
          </div>
          {validMode != null ? modes[validMode] : <Login />}
        </div>
      </div>
    </div>
  );
};

// ── Login ─────────────────────────────────────────────────────────────────────

const Login = () => {
  const { setToken, setUser } = useUserContext();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const payload = needs2FA
        ? { ...credentials, two_fa_code: twoFACode }
        : credentials;
      const { token } = await loginUser(payload);
      const freshUser = await verifyCurrentUser(token);
      setToken(token);
      setUser(freshUser);
      window.location.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "2fa_required") {
        setNeeds2FA(true);
      } else {
        toast.error(msg || "Credenciais inválidas");
        logger.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (needs2FA) {
    return (
      <div className="w-full">
        <h2 className="text-lg font-bold text-white mb-1">Verificação em 2 etapas</h2>
        <p className="text-zinc-500 text-sm mb-6">Digite o código do seu autenticador.</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field
            label="Código 2FA"
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            autoComplete="one-time-code"
          />
          <button
            type="submit"
            disabled={loading || twoFACode.length !== 6}
            className="w-full bg-[var(--primary-contrast-light)] hover:brightness-110 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all text-sm"
          >
            {loading ? "Verificando..." : "Confirmar"}
          </button>
          <button type="button" onClick={() => { setNeeds2FA(false); setTwoFACode(""); }}
            className="text-xs text-zinc-500 hover:text-white transition-colors text-center">
            Voltar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-white mb-0.5">Entrar</h2>
      <p className="text-zinc-500 text-sm mb-5">Bem-vindo de volta ao 5Vault.</p>

      <div className="flex gap-2 mb-1">
        <SocialButton
          onClick={googleLoginRedirect}
          icon={<GoogleIcon />}
          label="Google"
          className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white"
        />
        <SocialButton
          onClick={discordLoginRedirect}
          icon={<DiscordIcon />}
          label="Discord"
          className="bg-[#5865F2]/10 border-[#5865F2]/30 text-[#7289da] hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 hover:text-white"
        />
      </div>

      <Divider />

      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <Field
          label="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          placeholder="seu_username"
          autoComplete="username"
        />
        <Field
          label="Senha"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary-contrast-light)] hover:brightness-110 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all text-sm mt-1"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-800/60">
        <a href="/account?mode=register" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Criar conta
        </a>
        <a href="/account?mode=recovery" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Esqueceu a senha?
        </a>
      </div>
    </div>
  );
};

// ── Register ──────────────────────────────────────────────────────────────────

const Register = () => {
  const [form, setForm] = useState({
    username: "", name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.name || !form.email || !form.password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        username: form.username,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      toast.success("Conta criada! Faça login.");
      window.location.replace("/account?mode=login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
      logger.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-white mb-0.5">Criar conta</h2>
      <p className="text-zinc-500 text-sm mb-5">Comece grátis, sem cartão de crédito.</p>

      <div className="flex gap-2 mb-1">
        <SocialButton
          onClick={googleLoginRedirect}
          icon={<GoogleIcon />}
          label="Google"
          className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white"
        />
        <SocialButton
          onClick={discordLoginRedirect}
          icon={<DiscordIcon />}
          label="Discord"
          className="bg-[#5865F2]/10 border-[#5865F2]/30 text-[#7289da] hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 hover:text-white"
        />
      </div>

      <Divider />

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Username *" value={form.username} onChange={set("username")} placeholder="seu_username" autoComplete="username" />
          <Field label="Nome *" value={form.name} onChange={set("name")} placeholder="Seu Nome" autoComplete="name" />
        </div>
        <Field label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="email@exemplo.com" autoComplete="email" />
        <Field label="Telefone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+55 11 99999-9999" autoComplete="tel" />
        <Field label="Senha *" type="password" value={form.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
        <Field label="Confirmar Senha *" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repita a senha" autoComplete="new-password" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary-contrast-light)] hover:brightness-110 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all text-sm mt-1"
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>
      </form>

      <div className="flex justify-center mt-5 pt-4 border-t border-zinc-800/60">
        <a href="/account?mode=login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Já tem uma conta? Entrar
        </a>
      </div>
    </div>
  );
};

// ── Recovery ──────────────────────────────────────────────────────────────────

const Recovery = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Informe o email."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Se esse email existir, você receberá um link de recuperação.");
    setLoading(false);
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold text-white mb-0.5">Recuperar conta</h2>
      <p className="text-zinc-500 text-sm mb-5">Enviaremos um link para o seu email.</p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary-contrast-light)] hover:brightness-110 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all text-sm"
        >
          {loading ? "Enviando..." : "Enviar Link"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-800/60">
        <a href="/account?mode=login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Voltar ao login
        </a>
        <a href="/account?mode=register" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Criar conta
        </a>
      </div>
    </div>
  );
};

export default AccountTemplate;
