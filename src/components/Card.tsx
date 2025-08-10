import type { ReactElement } from "react";

interface CardProps {
  icon: ReactElement;
  title: string;
  description?: string;
}

const Card = ({ icon, title, description }: CardProps) => {
  return (
    <div className="border border-zinc-100/10 shadow-md rounded-lg p-4 flex flex-col items-center justify-center space-x-4 gap-2 h-48 w-80 hover:scale-102 hover:shadow-lg">
      <span>{icon}</span>
      <span className="font-bold text-xl text-center">{title}</span>
      {description && <span className="text-zinc-500">{description}</span>}
    </div>
  );
};

export default Card;
