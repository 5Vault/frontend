import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import useVisualContext from "../hook/useVisualContext";
import Content from "../utils/Content";
import Logo from "../assets/logow.png";
import useAuthContext from "../hook/useAuthContext";
import { LogOut, ChevronRight } from "lucide-react";
import { useNotifications, NOTIF_ROUTE_MAP } from "../hooks/useNotifications";

const SIDEBAR_KEY = "@fivevault/sidebar_expanded";

function NotifBadge({ count, collapsed }: { count: number; collapsed: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full
        bg-[var(--primary-contrast)] text-white font-bold leading-none
        shrink-0 tabular-nums
        ${collapsed
          ? "absolute -top-1 -right-1 w-4 h-4 text-[9px]"
          : "min-w-[20px] h-5 px-1.5 text-[11px]"
        }
      `}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

const Side = () => {
  const { language } = useVisualContext();
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { counts } = useNotifications();

  const [expanded, setExpanded] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    return stored === null ? true : stored === "true";
  });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(expanded));
  }, [expanded]);

  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current?.contains(e.target as Node) ||
        avatarRef.current?.contains(e.target as Node)
      ) return;
      setPopoverOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popoverOpen]);

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  // Get badge count for a sidebar route key.
  function getBadge(routeKey: string): number {
    let total = 0;
    for (const [notifType, sideKey] of Object.entries(NOTIF_ROUTE_MAP)) {
      if (sideKey === routeKey) total += counts[notifType] ?? 0;
    }
    return total;
  }

  return (
    <div
      className={`relative h-full flex flex-col justify-between border-r border-zinc-800 transition-all duration-200 ${
        expanded ? "w-72" : "w-16"
      }`}
    >
      {/* Header / toggle */}
      <div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex w-full h-16 border-b border-zinc-800 items-center px-4 gap-3 hover:bg-zinc-900/60 transition-colors"
        >
          <img src={Logo} alt="Logo" className="h-8 w-8 shrink-0" />
          {expanded && (
            <span className="flex-1 text-left">
              <p className="text-white font-bold text-base leading-tight">5Vault</p>
              <p className="text-xs text-zinc-500">Host your files securely</p>
            </span>
          )}
          {expanded && (
            <ChevronRight
              size={16}
              className="text-zinc-500 rotate-180 transition-transform duration-200"
            />
          )}
        </button>

        {/* Nav items */}
        <nav className="flex flex-col mt-2 px-2 gap-0.5">
          {Object.entries(Content.side).map(([key, value]) => {
            const isActive = location.pathname === `/${key}`;
            const badge = getBadge(key);

            return (
              <button
                key={key}
                title={expanded ? undefined : value.labels[language]}
                onClick={() => navigate(`/${key}`)}
                className={`
                  relative flex items-center gap-3 rounded-xl w-full text-left transition-all
                  ${expanded ? "px-3 py-3" : "px-0 py-3 justify-center"}
                  ${isActive
                    ? "bg-zinc-800/80 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200"
                  }
                `}
              >
                {/* Icon */}
                <span
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-[var(--primary-contrast-light)]" : "text-zinc-500"
                  }`}
                >
                  {value.icon}
                </span>

                {/* Collapsed badge — floats over icon */}
                {!expanded && <NotifBadge count={badge} collapsed />}

                {/* Expanded content */}
                {expanded && (
                  <>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider truncate ${
                          isActive ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {value.labels[language]}
                      </span>
                      {value.sublabels && (
                        <span className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {value.sublabels[language]}
                        </span>
                      )}
                    </div>

                    {/* Expanded badge */}
                    <NotifBadge count={badge} collapsed={false} />
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / user */}
      <div className={`border-t border-zinc-800 p-3 relative ${!expanded ? "flex justify-center" : ""}`}>
        {expanded ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/40 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-white truncate">{user?.name || "Usuário"}</span>
              <span className="text-xs text-zinc-500 truncate">{user?.email || ""}</span>
              {user?.tier_name && (
                <span className="text-[10px] text-[var(--primary-contrast-light)] font-bold uppercase tracking-wider">
                  {user.tier_name}
                </span>
              )}
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="shrink-0 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <>
            <button
              ref={avatarRef}
              onClick={() => setPopoverOpen((p) => !p)}
              className="w-9 h-9 rounded-full bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/40 flex items-center justify-center text-sm font-bold text-white hover:border-[var(--primary-contrast-light)] transition-colors overflow-hidden"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </button>

            {popoverOpen && (
              <div
                ref={popoverRef}
                className="absolute bottom-14 left-14 z-50 w-56 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl p-3 flex flex-col gap-3"
              >
                <div className="absolute -bottom-2 left-4 w-3 h-3 bg-zinc-900 border-b border-l border-zinc-700 rotate-[-45deg]" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/40 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{user?.name || "Usuário"}</span>
                    <span className="text-xs text-zinc-500 truncate">{user?.email || ""}</span>
                    {user?.tier_name && (
                      <span className="text-[10px] text-[var(--primary-contrast-light)] font-bold uppercase tracking-wider">
                        {user.tier_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-zinc-800" />

                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Side;
