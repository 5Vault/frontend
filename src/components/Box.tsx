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
    <div className="flex items-start justify-start p-4 flex-col w-53.5 rounded-lg border-1 border-zinc-100/15">
      <div className="flex items-center justify-between w-full">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <div className="h-20">{children}</div>
      <div className="text-sm text-zinc-400">{footer}</div>
    </div>
  );
};

export default Box;
