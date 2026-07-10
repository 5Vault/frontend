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
    <header className="w-full border border-zinc-800 border-l-2 border-l-[var(--primary-contrast-light)] bg-zinc-900/40 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex gap-4 items-center">
          <span className="text-[var(--primary-contrast-light)] flex items-center [&>svg]:w-6 [&>svg]:h-6 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]/20 p-2.5">
            {icon}
          </span>
          <div>
            <h2 className="text-base font-bold text-white leading-tight tracking-wide uppercase">{title}</h2>
            <p className="text-xs text-zinc-500 mt-0.5 tracking-wide">{description}</p>
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
