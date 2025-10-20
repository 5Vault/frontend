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
    <div className="flex items-start justify-start p-4 flex-col w-68 rounded-xl border-1 border-zinc-100/15 bg-gdnt gap-4">
      <div className="flex items-center justify-between w-full">
        <span>{label}</span>
        <div className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] rounded-2xl flex items-center justify-center">{icon}</div>
      </div>
      <div className="h-20">{children}</div>
      <div className="text-sm text-zinc-400">{footer}</div>
    </div>
  );
};

export default Box;
