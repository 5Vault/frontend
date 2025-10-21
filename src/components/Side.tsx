import useVisualContext from "../hook/useVisualContext";
import Content from "../utils/Content";
// import Icons from "../utils/Icons";
import Logo from "../assets/logow.png";
import useAuthContext from "../hook/useAuthContext";

const Side = () => {
  const { language } = useVisualContext();
  const { user, logout } = useAuthContext();

  return (
    <div className="w-80 h-full flex flex-col justify-between border-r border-zinc-700">
      <div>
        <header className="flex w-full h-20 border-b border-zinc-700 items-center justify-start gap-4 p-4">
          {/* <div className="h-12 w-12 justify-center items-center flex rounded-lg bg-blue-400">
            {Icons.shield}
          </div> */}
          <img src={Logo} alt="Logo" className="h-12" />
          <div className="flex flex-col items-start justify-start">
            <h2 className="text-white font-bold text-xl">5Vault</h2>
            <span className="text-sm text-zinc-400">
              Host your files securely
            </span>
          </div>
        </header>
        <span>
          {Object.entries(Content.side).map(([key, value]) => (
            <div
              key={key}
              className={`group flex items-center p-4 hover:bg-zinc-700 gap-2 ${
                  window.location.pathname === `/${key}`
                    ? "bg-[#00000038]"
                    : "text-zinc-200"
                } cursor-pointer`}
              onClick={() => {
                window.location.href = `/${key}`;
              }}
            >
              <span className={`mr-2 ${
                  window.location.pathname === `/${key}`
                    ? "text-zinc-200"
                    : "text-zinc-500"
                }`}>{value.icon}</span>
                <div className="flex flex-col h-full justify-center">
                  <span
                    className={`text-sm font-bold ${
                      window.location.pathname === `/${key}`
                        ? "text-zinc-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {value.labels[language]}
                  </span>
                  {value.sublabels && <span
                    className={`text-xs text-zinc-500 ${
                      window.location.pathname === `/${key}`
                        && "text-zinc-400 opacity-100"
                    }`}
                  >
                    {value.sublabels[language]}
                  </span>}
                </div>
            </div>
          ))}
        </span>
      </div>
      <div className="flex w-full h-20 border-t border-zinc-700 items-center justify-start p-4 gap-4">
        <span className="p-4 bg-blue-300/15 rounded-full w-13 h-13 flex items-center justify-center font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col items-start justify-start">
          <span className="text-white">{user?.name || "Nome do Usuário"}</span>
          <span className="text-sm text-zinc-400">
            {user?.email || "Email do Usuário"}
          </span>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="p-2 bg-[var(--primary-contrast-light)] rounded-md text-white"
            onClick={logout}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default Side;
