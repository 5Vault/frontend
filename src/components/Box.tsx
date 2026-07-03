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
    <div className="flex items-start justify-start p-4 flex-col flex-1 min-w-0 rounded-xl border border-zinc-100/15 bg-zinc-900/50 gap-4">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <div className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/50 rounded-xl flex items-center justify-center">{icon}</div>
      </div>
      <div className="flex-1 flex items-center">{children}</div>
      <div className="text-xs text-zinc-500">{footer}</div>
    </div>
  );
};

export default Box;
