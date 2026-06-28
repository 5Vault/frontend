import { useNavigate } from "react-router-dom";
import { LogIn, LayoutDashboard, LogOut } from "lucide-react";
import useAuthContext from "../../hook/useAuthContext";

const Top = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-[#080809]/80">
      <span className="font-black text-white text-lg tracking-tight cursor-pointer" onClick={() => navigate("/")}>5Vault</span>

      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
          className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
        >
          Planos
        </button>
        <button
          onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
          className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
        >
          Como funciona
        </button>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-[#e8073f] flex items-center justify-center text-white text-xs font-black">
                {user.name?.[0]?.toUpperCase() ?? user.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-zinc-300 font-medium max-w-[120px] truncate">
                {user.name || user.username}
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-[#e8073f] hover:bg-[#c8063a] text-white transition-all hover:scale-105 shadow-md shadow-[#e8073f30]"
            >
              <LayoutDashboard size={14} />
              Dashboard
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/account?mode=login")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm font-medium transition-colors px-3 py-2"
            >
              <LogIn size={15} />
              Login
            </button>
            <button
              onClick={() => navigate("/account?mode=register")}
              className="bg-[#e8073f] hover:bg-[#c8063a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md shadow-[#e8073f30]"
            >
              Criar conta
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Top;
