import type { ReactElement } from "react";

type HeaderTemplateProps = {
  icon: ReactElement;
  title: string;
  description: string;
  content?: ReactElement;
  breadcrumb?: ReactElement;
};

const HeaderTemplate = ({ icon, title, description, content, breadcrumb }: HeaderTemplateProps) => {
  return (
    <header className="w-full border border-zinc-800 rounded-xl bg-zinc-900/50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex gap-3 items-center">
          <span className="text-[var(--primary-contrast-light)] flex items-center [&>svg]:w-7 [&>svg]:h-7">
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white leading-tight">{title}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
          </div>
        </div>
        {content && <div className="flex items-center gap-2">{content}</div>}
      </div>

      {breadcrumb && (
        <div className="border-t border-zinc-800 px-5 pt-1 pb-1.5 flex items-center gap-1.5 text-sm text-zinc-500">
          {breadcrumb}
        </div>
      )}
    </header>
  );
};

export default HeaderTemplate;
