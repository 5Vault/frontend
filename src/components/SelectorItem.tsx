import type { ReactNode } from "react";
import { useContext } from "react";
import { SelectorContext } from "./Selector";

export type SelectorItemProps = {
  value: string | number | object | boolean;
  label?: string;
  children?: ReactNode;
};

const SelectorItem = ({ value, label, children }: SelectorItemProps) => {
  const context = useContext(SelectorContext);
  const content = label ?? children;
  const isSelected = context?.selectedValue === value;

  return (
    <div
      className={`
        px-3 py-2 text-xs font-medium transition-all duration-150 cursor-pointer flex items-center justify-between
        ${
          isSelected
            ? "border-l-2 border-l-[var(--primary-contrast-light)] bg-[var(--primary-contrast-light)]/10 text-[var(--primary-contrast-light)] pl-[10px]"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
        }
      `}
      onClick={() => context?.onSelect(value)}
    >
      <span>{content}</span>
      {isSelected && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-in zoom-in duration-200"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
};

export default SelectorItem;
