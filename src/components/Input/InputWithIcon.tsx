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
        className={`w-full border border-gray-100/20 py-2 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-[var(--primary-contrast-opacity)] focus:border-transparent outline-none ${className}`}
      />
    </div>
  );
};

export default InputWithIcon;
