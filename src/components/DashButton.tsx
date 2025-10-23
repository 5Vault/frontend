import type { ReactElement } from "react";

type DashButtonProps = {
    icon?: ReactElement;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

const DashButton = (props: DashButtonProps) => {
    return (
        <button 
            onClick={props.onClick} 
            className={`relative flex items-center max-w-[400px] gap-2 p-2 rounded-md transition-colors overflow-hidden group bg-transparent ${
                props.disabled 
                    ? 'text-zinc-600/40 opacity-50 cursor-not-allowed' 
                    : 'text-zinc-400 hover:text-zinc-400 hover:bg-zinc-800/70 cursor-pointer'
            }`}
            disabled={props.disabled}
        >
            {props.icon}
            <span className="text-sm font-medium">{props.label}</span>
            <span className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--primary-contrast-light)] transition-all duration-1000 ${
                props.disabled ? '' : 'group-hover:w-full'
            }`} />
        </button>
    );
}

export default DashButton;