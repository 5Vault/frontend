import type { ReactNode } from "react";

const RecentItem = ({
  icon,
  label,
  subLabel,
  children,
}: {
  icon: ReactNode;
  label: ReactNode;
  subLabel: ReactNode;
  children: ReactNode | null;
}) => {
  return (
    <div className="flex items-center justify-start gap-2 p-4 border border-transparent  hover:border-zinc-100/15 w-full rounded-lg">
      <span>{icon}</span>
      <div className="w-full">
        <div className="flex flex-col">
          <span className="text-lg text-zinc-400">{label}</span>
          <span className="text-xs text-zinc-500">{subLabel}</span>
        </div>
      </div>
      {children}
    </div>
  );
};

export default RecentItem;
