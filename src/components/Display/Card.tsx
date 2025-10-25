import type { ReactElement } from "react";

interface CardProps {
  icon: ReactElement;
  title: string;
  description?: string;
}

const Card = ({ icon, title, description }: CardProps) => {
  return (
    <div className="border border-zinc-100/10 shadow-md rounded-lg p-4 flex flex-col items-center justify-around space-x-4 gap-2 h-42 w-72 hover:scale-102 hover:shadow-lg bg-zinc-900/50">
      <span className="text-2xl p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] rounded-2xl flex items-center justify-center">{icon}</span>
      <div className="flex flex-col items-center text-center gap-1">
        <span className="font-bold text-lg text-center">{title}</span>
        {description && <span className="text-zinc-500">{description}</span>}
      </div>
    </div>
  );
};

export default Card;
