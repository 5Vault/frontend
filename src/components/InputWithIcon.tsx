import type { ReactNode, InputHTMLAttributes } from "react";

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
}

const InputWithIcon = ({
  icon,
  className = "",
  ...inputProps
}: InputWithIconProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        {...inputProps}
        className={`w-full border border-zinc-700 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-[var(--primary-contrast-light)] focus:bg-zinc-900 outline-none transition-colors duration-200 ${className}`}
      />
    </div>
  );
};

export default InputWithIcon;
