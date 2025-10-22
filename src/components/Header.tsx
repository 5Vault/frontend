import type { ReactElement } from "react";

type HeaderTemplateProps = {
    icon: ReactElement;
    title: string;
    description: string;
    content?: ReactElement;
};

const HeaderTemplate = ({ icon, title, description, content }: HeaderTemplateProps) => {
  return (
    <header className="w-full flex justify-between items-center border border-zinc-800 p-4 rounded-xl bg-zinc-900/50">
      <div className="flex gap-4 items-center justify-center">
        <div className="p-3 bg-[var(--primary-contrast-light)] rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <span className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">{title}</h2>
          <h5 className="text-sm text-zinc-400 tracking-wide">{description}</h5>
        </span>
      </div>
      {content && content}
    </header>
  )
}

export default HeaderTemplate;