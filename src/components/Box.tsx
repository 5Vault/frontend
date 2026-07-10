import type { ReactNode } from "react";

const Box = ({
  label,
  icon,
  footer,
  children,
}: {
  label: string;
  icon: ReactNode;
  footer: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex items-start justify-start p-4 flex-col flex-1 min-w-0 border border-zinc-800 bg-zinc-900/40 gap-4 hover:border-zinc-700 hover:border-l-[var(--primary-contrast-light)] hover:border-l-2 transition-all duration-200 group">
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{label}</span>
        <div className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/30 flex items-center justify-center text-[var(--primary-contrast-light)]">{icon}</div>
      </div>
      <div className="flex-1 flex items-center">{children}</div>
      <div className="text-xs text-zinc-600 tracking-wide">{footer}</div>
    </div>
  );
};

export default Box;
