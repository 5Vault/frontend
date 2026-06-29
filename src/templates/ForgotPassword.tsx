import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";

const ForgotPasswordTemplate = () => {
  const axiosInstance = useAxios();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch {
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <span className="text-2xl font-bold tracking-tight text-white">
            Five<span className="text-[var(--primary-contrast)]">Vault</span>
          </span>
        </div>

        {sent ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-full bg-green-500/10 text-green-400">
              <CheckCircle size={28} />
            </div>
            <h1 className="text-xl font-semibold text-white">Email enviado!</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Se existir uma conta com esse email, você receberá um link para redefinir sua senha em instantes.
            </p>
            <Link to="/login" className="mt-2 text-sm text-[var(--primary-contrast)] hover:opacity-80 transition-opacity flex items-center gap-1">
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">Esqueceu sua senha?</h1>
              <p className="text-zinc-400 text-sm">Informe seu email e enviaremos um link para redefinição.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[var(--primary-contrast)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Enviar link de redefinição
              </button>
            </form>

            <Link to="/login" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 justify-center">
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordTemplate;
