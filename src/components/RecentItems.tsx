import type { ReactNode } from "react";
import Icons from "../utils/Icons";

const RecentItems = ({
  label,
  icon,
  width = "w-147",
  children,
}: {
  label: string;
  icon: ReactNode;
  width?: string;
  children: ReactNode;
}) => {
  return (
    <div className={`flex flex-col items-center justify-between p-2 border border-zinc-100/15 ${width} rounded-lg`}>
      <header className="flex items-center gap-2 justify-between w-full px-6 py-4">
        <span className="flex gap-2 items-center">
          {icon}
          <span className="font-semibold text-3xl">{label}</span>
        </span>
        <span className="text-sm text-zinc-400 flex gap-2 items-center">
          <span>View All</span>
          {Icons.goto}
        </span>
      </header>
      <div className="flex flex-col w-full gap-1 p-4 h-132 max-h-132 items-start justify-start overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default RecentItems;
