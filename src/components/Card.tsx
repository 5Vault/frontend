import type { ReactElement } from "react";

interface CardProps {
  icon: ReactElement;
  title: string;
  description?: string;
}

const Card = ({ icon, title, description }: CardProps) => {
  return (
    <div className="border border-zinc-800 shadow-md p-4 flex flex-col items-center justify-around space-x-4 gap-2 h-42 w-72 hover:border-zinc-600 hover:border-l-[var(--primary-contrast-light)] hover:border-l-2 bg-zinc-900/40 transition-all duration-200">
      <span className="text-2xl p-2.5 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/30 flex items-center justify-center text-[var(--primary-contrast-light)]">{icon}</span>
      <div className="flex flex-col items-center text-center gap-1">
        <span className="font-bold text-base text-center tracking-wide">{title}</span>
        {description && <span className="text-zinc-500 text-sm">{description}</span>}
      </div>
    </div>
  );
};

export default Card;
